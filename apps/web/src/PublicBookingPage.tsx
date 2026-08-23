import { useEffect, useMemo, useState, type FormEvent } from 'react';

type Service={id:string;title:string;description?:string|null;durationMinutes:number;priceAmount:number|string;color:string};
type Staff={id:string;name:string;roleTitle?:string|null;color:string};
type PublicData={ok:boolean;business?:{name:string;slug:string};services?:Service[];staff?:Staff[];booking?:{timezone:string;minBookingNoticeMinutes:number;requireDeposit:boolean;defaultDepositPercent:number};slots?:Array<{time:string;startsAt:string}>;message?:string};
type Result={ok:boolean;message?:string;appointment?:{id:string;status:string;startsAt:string;amount:number|string;depositAmount:number|string;currency:string};business?:{name:string};service?:{title:string};staff?:{name:string}};

const nf=new Intl.NumberFormat('fa-IR');
const money=(v:number|string)=>`${nf.format(Number(v||0))} ریال`;

async function getData(params:URLSearchParams){
  const res=await fetch(`/api/public/booking?${params.toString()}`);
  const data=await res.json().catch(()=>({})) as PublicData;
  if(!res.ok) throw new Error(data.message||'دریافت اطلاعات رزرو انجام نشد.');
  return data;
}

export default function PublicBookingPage(){
  const slug=decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1]||'');
  const [data,setData]=useState<PublicData|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [slotsLoading,setSlotsLoading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState<Result|null>(null);
  const [form,setForm]=useState({serviceId:'',staffId:'',date:new Date().toISOString().slice(0,10),time:'',customerName:'',phone:'',note:'',website:''});

  useEffect(()=>{void (async()=>{try{const fresh=await getData(new URLSearchParams({slug}));setData(fresh);setForm(v=>({...v,serviceId:fresh.services?.[0]?.id||'',staffId:fresh.staff?.[0]?.id||''}));}catch(e){setError(e instanceof Error?e.message:'خطا');}finally{setLoading(false);}})();},[slug]);

  useEffect(()=>{
    if(!form.serviceId||!form.staffId||!form.date) return;
    let active=true;setSlotsLoading(true);setForm(v=>({...v,time:''}));
    const p=new URLSearchParams({slug,date:form.date,serviceId:form.serviceId,staffId:form.staffId});
    void getData(p).then(fresh=>{if(active)setData(prev=>({...prev,...fresh}));}).catch(e=>{if(active)setError(e instanceof Error?e.message:'خطا');}).finally(()=>{if(active)setSlotsLoading(false);});
    return()=>{active=false;};
  },[slug,form.serviceId,form.staffId,form.date]);

  const service=useMemo(()=>data?.services?.find(x=>x.id===form.serviceId),[data,form.serviceId]);
  const staff=useMemo(()=>data?.staff?.find(x=>x.id===form.staffId),[data,form.staffId]);
  const minDate=new Date().toISOString().slice(0,10);

  async function submit(e:FormEvent){
    e.preventDefault();setBusy(true);setError('');
    try{
      const res=await fetch('/api/public/booking',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({slug,...form})});
      const result=await res.json().catch(()=>({})) as Result;
      if(!res.ok) throw new Error(result.message||'ثبت نوبت انجام نشد.');
      setDone(result);
    }catch(e){setError(e instanceof Error?e.message:'ثبت نوبت انجام نشد.');}finally{setBusy(false);}
  }

  if(loading)return <Shell><div className="pb-loading"><i/><span>در حال آماده‌سازی رزرو...</span></div><style>{styles}</style></Shell>;
  if(error&&!data)return <Shell><style>{styles}</style><div className="pb-fatal"><b>صفحه رزرو در دسترس نیست</b><span>{error}</span></div></Shell>;
  if(done)return <Shell><style>{styles}</style><div className="pb-success"><div>✓</div><small>رزرو ثبت شد</small><h1>{done.message||'نوبت شما ثبت شد.'}</h1><p>{done.business?.name}</p><section><span><b>{done.service?.title}</b><small>خدمت</small></span><span><b>{done.staff?.name}</b><small>پرسنل</small></span><span><b>{done.appointment?new Date(done.appointment.startsAt).toLocaleString('fa-IR',{dateStyle:'medium',timeStyle:'short'}):'—'}</b><small>زمان نوبت</small></span></section><button onClick={()=>window.location.reload()}>ثبت نوبت دیگر</button></div></Shell>;

  return <Shell><style>{styles}</style><div className="pb-wrap">
    <header className="pb-head"><div className="pb-logo">AP</div><div><small>رزرو آنلاین</small><h1>{data?.business?.name||'کسب‌وکار'}</h1><p>خدمت، متخصص و زمان مناسب را انتخاب کنید.</p></div></header>
    {error&&<div className="pb-error">{error}</div>}
    <form onSubmit={submit} className="pb-card">
      <section><div className="pb-step"><i>۱</i><span><b>انتخاب خدمت</b><small>خدمت موردنظر خود را انتخاب کنید</small></span></div><div className="pb-services">{(data?.services||[]).map(x=><button type="button" key={x.id} className={form.serviceId===x.id?'on':''} onClick={()=>setForm({...form,serviceId:x.id})}><i style={{background:x.color}}/><span><b>{x.title}</b><small>{nf.format(x.durationMinutes)} دقیقه</small></span><strong>{money(x.priceAmount)}</strong></button>)}</div></section>
      <section><div className="pb-step"><i>۲</i><span><b>انتخاب پرسنل</b><small>فرد ارائه‌دهنده خدمت</small></span></div><div className="pb-staff">{(data?.staff||[]).map(x=><button type="button" key={x.id} className={form.staffId===x.id?'on':''} onClick={()=>setForm({...form,staffId:x.id})}><i style={{background:x.color}}>{x.name[0]}</i><span><b>{x.name}</b><small>{x.roleTitle||'پرسنل'}</small></span></button>)}</div></section>
      <section><div className="pb-step"><i>۳</i><span><b>انتخاب تاریخ و ساعت</b><small>فقط زمان‌های آزاد نمایش داده می‌شوند</small></span></div><label className="pb-date">تاریخ<input type="date" min={minDate} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><div className="pb-slots">{slotsLoading?<span className="pb-muted">در حال بررسی ظرفیت...</span>:(data?.slots||[]).length?(data?.slots||[]).map(s=><button type="button" key={s.time} className={form.time===s.time?'on':''} onClick={()=>setForm({...form,time:s.time})}>{s.time}</button>):<span className="pb-muted">برای این روز زمان آزادی پیدا نشد.</span>}</div></section>
      <section><div className="pb-step"><i>۴</i><span><b>اطلاعات شما</b><small>برای ثبت پرونده مشتری</small></span></div><div className="pb-form"><label>نام و نام خانوادگی<input value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} required/></label><label>شماره موبایل<input dir="ltr" inputMode="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="09123456789" required/></label><label className="wide">توضیحات اختیاری<textarea rows={3} value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label><label className="trap">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>setForm({...form,website:e.target.value})}/></label></div></section>
      <aside className="pb-summary"><div><span><small>خدمت</small><b>{service?.title||'—'}</b></span><span><small>پرسنل</small><b>{staff?.name||'—'}</b></span><span><small>زمان</small><b>{form.time?`${form.date} · ${form.time}`:'انتخاب نشده'}</b></span></div><strong>{service?money(service.priceAmount):'—'}</strong></aside>
      {data?.booking?.requireDeposit&&<div className="pb-notice">این کسب‌وکار دریافت بیعانه را فعال کرده است. اتصال درگاه پرداخت در مرحله بعد پروژه تکمیل می‌شود؛ نوبت فعلاً در وضعیت انتظار ثبت خواهد شد.</div>}
      <button className="pb-submit" disabled={busy||!form.time}>{busy?'در حال ثبت...':'ثبت نهایی نوبت'}</button>
    </form>
    <footer>Powered by <b>AI PANEL</b></footer>
  </div></Shell>;
}

function Shell({children}:{children:React.ReactNode}){return <main className="pb-shell" dir="rtl">{children}</main>}

const styles=`
*{box-sizing:border-box}.pb-shell{min-height:100vh;background:radial-gradient(circle at 50% 0,#eef2ff 0,#f6f8fc 36%,#eef1f6 100%);color:#172033;font-family:Inter,Vazirmatn,Tahoma,Arial,sans-serif;padding:28px 12px 70px}.pb-shell button,.pb-shell input,.pb-shell textarea{font:inherit}.pb-wrap{width:min(760px,100%);margin:auto}.pb-head{display:flex;gap:13px;align-items:center;margin:9px 0 20px}.pb-logo{width:52px;height:52px;border-radius:15px;background:linear-gradient(135deg,#7567f0,#4e43cb);color:#fff;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 10px 30px rgba(91,76,220,.22)}.pb-head small{font-size:9px;color:#786be4;font-weight:900}.pb-head h1{font-size:25px;margin:3px 0 3px}.pb-head p{font-size:10px;color:#8690a0;margin:0}.pb-card{background:#fff;border:1px solid #e4e8f0;border-radius:22px;padding:21px;box-shadow:0 25px 70px rgba(31,43,68,.09)}.pb-card>section{padding:18px 0;border-bottom:1px solid #edf0f5}.pb-card>section:first-child{padding-top:0}.pb-step{display:flex;align-items:center;gap:9px;margin-bottom:13px}.pb-step>i{width:28px;height:28px;border-radius:9px;background:#eeecff;color:#5d51d8;display:grid;place-items:center;font-style:normal;font-size:10px;font-weight:900}.pb-step>span{display:flex;flex-direction:column}.pb-step b{font-size:11px}.pb-step small{font-size:8px;color:#929cab;margin-top:2px}.pb-services{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pb-services button,.pb-staff button{border:1px solid #e8ebf1;background:#fbfcfe;border-radius:12px;padding:11px;cursor:pointer;text-align:right;color:#273246}.pb-services button{display:grid;grid-template-columns:7px 1fr auto;align-items:center;gap:9px}.pb-services button>i{width:7px;height:38px;border-radius:99px}.pb-services span,.pb-staff span{display:flex;flex-direction:column}.pb-services b,.pb-staff b{font-size:9px}.pb-services small,.pb-staff small{font-size:8px;color:#98a1af;margin-top:4px}.pb-services strong{font-size:8px}.pb-services button.on,.pb-staff button.on{border-color:#7c70e9;background:#f5f3ff;box-shadow:0 0 0 3px rgba(101,87,224,.07)}.pb-staff{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pb-staff button{display:flex;align-items:center;gap:9px}.pb-staff button>i{width:34px;height:34px;border-radius:10px;color:#fff;display:grid;place-items:center;font-style:normal;font-size:10px;font-weight:900}.pb-date{display:block;font-size:8px;font-weight:800;color:#687487}.pb-date input{display:block;width:220px;margin-top:6px;border:1px solid #e3e7ef;border-radius:10px;padding:9px;background:#fafbfc;color:#273246}.pb-slots{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px;min-height:38px}.pb-slots button{border:1px solid #dfe4ec;background:#fff;border-radius:9px;padding:8px 12px;color:#596679;cursor:pointer}.pb-slots button.on{background:#5f53d9;color:#fff;border-color:#5f53d9}.pb-muted{font-size:9px;color:#9aa4b1;padding:10px 0}.pb-form{display:grid;grid-template-columns:1fr 1fr;gap:9px}.pb-form label{font-size:8px;font-weight:800;color:#657184}.pb-form label.wide{grid-column:1/-1}.pb-form input,.pb-form textarea{display:block;width:100%;margin-top:6px;border:1px solid #e3e7ef;background:#fafbfc;border-radius:10px;padding:10px;outline:0;color:#273246}.pb-form input:focus,.pb-form textarea:focus{border-color:#8176eb;box-shadow:0 0 0 3px rgba(101,87,224,.07)}.trap{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important}.pb-summary{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:15px;margin-top:18px;background:#111927;color:#fff;border-radius:14px}.pb-summary>div{display:flex;gap:20px}.pb-summary span{display:flex;flex-direction:column}.pb-summary small{font-size:7px;color:#7e8aa0}.pb-summary b{font-size:9px;margin-top:4px}.pb-summary>strong{font-size:13px;white-space:nowrap}.pb-notice{margin-top:11px;padding:10px;border-radius:10px;background:#fff8e7;color:#8d6a19;font-size:8px;line-height:1.8}.pb-submit{width:100%;margin-top:12px;border:0;border-radius:12px;background:linear-gradient(135deg,#6c60ec,#5549d0);color:#fff;padding:13px;font-weight:900;font-size:11px;cursor:pointer;box-shadow:0 12px 26px rgba(88,73,211,.2)}.pb-submit:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}.pb-error{padding:10px 12px;background:#fff0f2;border:1px solid #ffd5db;color:#c54155;border-radius:11px;font-size:9px;margin-bottom:10px}.pb-loading,.pb-fatal,.pb-success{width:min(620px,100%);margin:14vh auto 0;background:#fff;border:1px solid #e5e9f1;border-radius:20px;padding:34px;box-shadow:0 20px 70px rgba(30,42,66,.09);text-align:center}.pb-loading{display:grid;justify-items:center;gap:10px}.pb-loading i{width:30px;height:30px;border:3px solid #e5e7f4;border-top-color:#685ce5;border-radius:50%;animation:spin .8s linear infinite}.pb-loading span,.pb-fatal span{font-size:9px;color:#8b96a5}.pb-fatal{display:flex;flex-direction:column;gap:8px}.pb-success>div:first-child{width:64px;height:64px;border-radius:50%;background:#e7faf2;color:#13a472;display:grid;place-items:center;font-size:28px;font-weight:900;margin:0 auto 13px}.pb-success>small{font-size:9px;color:#13a472;font-weight:900}.pb-success h1{font-size:23px;margin:5px 0}.pb-success>p{font-size:10px;color:#8994a3}.pb-success section{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0}.pb-success section span{background:#f7f8fb;border-radius:11px;padding:11px;display:flex;flex-direction:column}.pb-success section b{font-size:9px}.pb-success section small{font-size:7px;color:#9aa3b0;margin-top:5px}.pb-success>button{border:1px solid #e0e4eb;background:#fff;border-radius:10px;padding:10px 14px;color:#5d52d7;font-size:9px;font-weight:800;cursor:pointer}.pb-wrap>footer{text-align:center;font-size:8px;color:#929cab;margin-top:16px}.pb-wrap>footer b{color:#6459de}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:620px){.pb-shell{padding:16px 8px 55px}.pb-head{padding:0 6px}.pb-head h1{font-size:21px}.pb-card{padding:14px;border-radius:18px}.pb-services{grid-template-columns:1fr}.pb-staff{grid-template-columns:1fr 1fr}.pb-form{grid-template-columns:1fr}.pb-form label.wide{grid-column:auto}.pb-summary{align-items:flex-start}.pb-summary>div{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pb-success section{grid-template-columns:1fr}.pb-date input{width:100%}}
`;
