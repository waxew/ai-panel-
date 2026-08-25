/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { useEffect, useMemo, useState, type FormEvent } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useEffect, useMemo, useState, type FormEvent } from 'react';

// راهنما: این Type با نام «Service» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Service = { id:string; title:string; description?:string|null; durationMinutes:number; priceAmount:number|string; currency:string; color:string; isActive:boolean };
// راهنما: این Type با نام «Staff» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Staff = { id:string; name:string; roleTitle?:string|null; isActive:boolean; color:string };
// راهنما: این Type با نام «Customer» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Customer = { id:string; fullName:string; phone:string; email?:string|null };
// راهنما: این Type با نام «Appointment» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Appointment = {
  id:string; customerId:string; serviceId:string; staffId:string; startsAt:string; endsAt:string; status:'PENDING'|'CONFIRMED'|'DONE'|'CANCELLED'|'NO_SHOW'; amount:number|string; currency:string; note?:string|null;
  BookingCustomer?: { fullName?:string; phone?:string } | null;
  BookingService?: { title?:string; durationMinutes?:number; color?:string } | null;
  BookingStaff?: { name?:string; roleTitle?:string } | null;
};
// راهنما: این Type با نام «Settings» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Settings = { slotIntervalMinutes:number; minBookingNoticeMinutes:number; cancellationNoticeMinutes:number; allowCustomerCancellation:boolean; requireDeposit:boolean; defaultDepositPercent:number; publicBookingEnabled:boolean; publicSlug?:string|null; reminders?:Record<string,boolean> };
// راهنما: این Type با نام «Dashboard» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Dashboard = { ok:boolean; services:Service[]; staff:Staff[]; customers:Customer[]; appointments:Appointment[]; settings:Settings|null; message?:string };

// راهنما: این Type با نام «Tab» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Tab='overview'|'appointments'|'services'|'staff'|'customers'|'settings';
// راهنما: این دستور متغیر/ثابت «nf» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const nf=new Intl.NumberFormat('fa-IR');
// راهنما: این دستور متغیر/ثابت «money» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const money=(v:number|string)=>`${nf.format(Number(v||0))} ریال`;
// راهنما: این دستور متغیر/ثابت «statusFa» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const statusFa:Record<Appointment['status'],string>={PENDING:'در انتظار',CONFIRMED:'تأیید شده',DONE:'انجام شده',CANCELLED:'لغو شده',NO_SHOW:'عدم حضور'};

// راهنما: این تابع «request» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function request(body?:Record<string,unknown>){
  // راهنما: این متغیر «res» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const res=await fetch('/api/booking',body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:undefined);
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data=await res.json().catch(()=>({})) as Dashboard;
  // راهنما: این شرط بررسی می‌کند آیا «!res.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if(!res.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(data.message||'خطا در نوبت‌دهی');
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data;
}

// راهنما: این تابع «BookingManagerV2» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function BookingManagerV2(){
  // راهنما: این دستور متغیر/ثابت «[tab,setTab]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [tab,setTab]=useState<Tab>('overview');
  // راهنما: این دستور متغیر/ثابت «[data,setData]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [data,setData]=useState<Dashboard|null>(null);
  // راهنما: این دستور State محلی React برای «[error,setError]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [error,setError]=useState('');
  // راهنما: این دستور State محلی React برای «[busy,setBusy]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [busy,setBusy]=useState(false);
  // راهنما: این دستور State محلی React برای «[showNew,setShowNew]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [showNew,setShowNew]=useState(false);
  // راهنما: این دستور State محلی React برای «[showService,setShowService]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [showService,setShowService]=useState(false);
  // راهنما: این دستور State محلی React برای «[showStaff,setShowStaff]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [showStaff,setShowStaff]=useState(false);
  // راهنما: این دستور State محلی React برای «[search,setSearch]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [search,setSearch]=useState('');
  // راهنما: این دستور State محلی React برای «[booking,setBooking]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [booking,setBooking]=useState({customerName:'',phone:'',serviceId:'',staffId:'',date:new Date().toISOString().slice(0,10),time:'10:00',note:''});
  // راهنما: این دستور State محلی React برای «[service,setService]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [service,setService]=useState({title:'',durationMinutes:'60',priceAmount:'0'});
  // راهنما: این دستور State محلی React برای «[staffForm,setStaffForm]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [staffForm,setStaffForm]=useState({name:'',roleTitle:''});

  // راهنما: این تابع «load» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function load(){
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try{
      // راهنما: این دستور متغیر/ثابت «fresh» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
      const fresh=await request();
      // راهنما: این شرط بررسی می‌کند آیا «!fresh.services.length||!fresh.staff.length||!fresh.settings» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
      if(!fresh.services.length||!fresh.staff.length||!fresh.settings){
        // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(await request({action:'bootstrap'}))».
        setData(await request({action:'bootstrap'}));
      } else /* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(fresh)». */ setData(fresh);
    }catch(e){/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setError(e instanceof Error?e.message:'خطا در دریافت اطلاعات')». */ setError(e instanceof Error?e.message:'خطا در دریافت اطلاعات');}
  }
  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(()=>{/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void load()». */ void load();},[]);

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(()=>{
    // راهنما: این شرط بررسی می‌کند آیا «!data» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(!data) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «بدون مقدار» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return;
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBooking(v=>({...v,serviceId:v.serviceId||data.services[0]?.id||'',staffId:v.staffId||d…».
    setBooking(v=>({...v,serviceId:v.serviceId||data.services[0]?.id||'',staffId:v.staffId||data.staff[0]?.id||''}));
  },[data]);

  // راهنما: این دستور مقدار «filtered» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const filtered=useMemo(()=>{
    // راهنما: این شرط بررسی می‌کند آیا «!data» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(!data) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «[]» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return [];
    // راهنما: این دستور متغیر/ثابت «q» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const q=search.trim().toLowerCase();
    // راهنما: این شرط بررسی می‌کند آیا «!q» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(!q) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data.appointments» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return data.appointments;
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data.appointments.filter(a=>`${a.BookingCustomer?.fullName||''} ${a.Bookin…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return data.appointments.filter(a=>`${a.BookingCustomer?.fullName||''} ${a.BookingCustomer?.phone||''} ${a.BookingService?.title||''} ${a.BookingStaff?.name||''}`.toLowerCase().includes(q));
  },[data,search]);

  // راهنما: این دستور مقدار «today» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const today=useMemo(()=>{
    // راهنما: این دستور متغیر/ثابت «d» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const d=new Date().toDateString();
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «(data?.appointments||[]).filter(a=>new Date(a.startsAt).toDateString()===d)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return (data?.appointments||[]).filter(a=>new Date(a.startsAt).toDateString()===d);
  },[data]);
  // راهنما: این دستور متغیر/ثابت «revenue» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const revenue=today.filter(a=>a.status==='CONFIRMED'||a.status==='DONE').reduce((s,a)=>s+Number(a.amount||0),0);

  // راهنما: این تابع «act» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function act(body:Record<string,unknown>){
    // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(true)».
    setBusy(true);/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setError('')». */ setError('');
    // راهنما: این بلوک عملیات دارای احتمال خطا را اجرا می‌کند؛ اگر خطایی رخ دهد بخش catch می‌تواند آن را مدیریت کند و finally در صورت وجود همیشه اجرا می‌شود.
    try{/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setData(await request(body))». */ setData(await request(body));/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «true» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return true;}catch(e){/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setError(e instanceof Error?e.message:'عملیات انجام نشد')». */ setError(e instanceof Error?e.message:'عملیات انجام نشد');/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «false» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return false;}finally{/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBusy(false)». */ setBusy(false);}
  }

  // راهنما: این تابع «createAppointment» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function createAppointment(e:FormEvent){
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «e.preventDefault()».
    e.preventDefault();
    // راهنما: این دستور متغیر/ثابت «startsAt» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const startsAt=new Date(`${booking.date}T${booking.time}:00`).toISOString();
    // راهنما: این شرط بررسی می‌کند آیا «await act({action:'create_appointment',...booking,startsAt})» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(await act({action:'create_appointment',...booking,startsAt})){
      // راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setShowNew(false)».
      setShowNew(false);/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setBooking(v=>({...v,customerName:'',phone:'',note:''}))». */ setBooking(v=>({...v,customerName:'',phone:'',note:''}));/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setTab('appointments')». */ setTab('appointments');
    }
  }
  // راهنما: این تابع «createService» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function createService(e:FormEvent){/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «e.preventDefault()». */ e.preventDefault();/* راهنما: این شرط بررسی می‌کند آیا «await act({action:'create_service',title:service.title,durationMinutes:Number(s…» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if(await act({action:'create_service',title:service.title,durationMinutes:Number(service.durationMinutes),priceAmount:Number(service.priceAmount)})){/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setShowService(false)». */ setShowService(false);/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setService({title:'',durationMinutes:'60',priceAmount:'0'})». */ setService({title:'',durationMinutes:'60',priceAmount:'0'});}}
  // راهنما: این تابع «createStaff» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function createStaff(e:FormEvent){/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «e.preventDefault()». */ e.preventDefault();/* راهنما: این شرط بررسی می‌کند آیا «await act({action:'create_staff',...staffForm})» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if(await act({action:'create_staff',...staffForm})){/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setShowStaff(false)». */ setShowStaff(false);/* راهنما: این دستور با فراخوانی Setter، State مربوط را تغییر می‌دهد تا داده جدید در UI اعمال شود: «setStaffForm({name:'',roleTitle:''})». */ setStaffForm({name:'',roleTitle:''});}}
  // راهنما: این تابع «status» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  async function status(id:string,status:Appointment['status']){/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «await act({action:'update_appointment_status',id,status})». */ await act({action:'update_appointment_status',id,status});}

  // راهنما: این شرط بررسی می‌کند آیا «!data&&!error» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if(!data&&!error)/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<Loading/>» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <Loading/>;

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="bv" dir="rtl"><style>{styles}</style> <aside><a href="/app…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="bv" dir="rtl"><style>{styles}</style>
    <aside><a href="/app" className="brand"><b>AP</b><span>AI PANEL<small>Booking OS</small></span></a><nav>{[['overview','داشبورد'],['appointments','نوبت‌ها'],['services','خدمات'],['staff','پرسنل'],['customers','مشتریان'],['settings','تنظیمات']].map(([k,l])=><button key={k} className={tab===k?'on':''} onClick={()=>setTab(k as Tab)}>{l}</button>)}</nav><a className="back" href="/app">← پنل اصلی</a></aside>
    <main><header><div><small>نوبت‌دهی هوشمند</small><h1>{tab==='overview'?'داشبورد نوبت‌دهی':tab==='appointments'?'نوبت‌ها':tab==='services'?'خدمات':tab==='staff'?'پرسنل':tab==='customers'?'مشتریان':'تنظیمات'}</h1></div><button onClick={()=>setShowNew(true)}>＋ نوبت جدید</button></header>
      {error&&<div className="err">{error}</div>}
      {data&&tab==='overview'&&<Overview data={data} today={today} revenue={revenue} openNew={()=>setShowNew(true)} status={status}/>} 
      {data&&tab==='appointments'&&<Appointments items={filtered} search={search} setSearch={setSearch} status={status}/>} 
      {data&&tab==='services'&&<Services items={data.services} open={()=>setShowService(true)}/>} 
      {data&&tab==='staff'&&<StaffView items={data.staff} open={()=>setShowStaff(true)}/>} 
      {data&&tab==='customers'&&<Customers items={data.customers}/>} 
      {data&&tab==='settings'&&<SettingsView settings={data.settings} save={act}/>} 
    </main>
    {showNew&&data&&<Modal title="ثبت نوبت جدید" close={()=>setShowNew(false)}><form onSubmit={createAppointment} className="form"><label>نام مشتری<input value={booking.customerName} onChange={e=>setBooking({...booking,customerName:e.target.value})} required/></label><label>موبایل<input dir="ltr" value={booking.phone} onChange={e=>setBooking({...booking,phone:e.target.value})} required/></label><label>تاریخ<input type="date" value={booking.date} onChange={e=>setBooking({...booking,date:e.target.value})} required/></label><label>ساعت<input type="time" value={booking.time} onChange={e=>setBooking({...booking,time:e.target.value})} required/></label><label>خدمت<select value={booking.serviceId} onChange={e=>setBooking({...booking,serviceId:e.target.value})}>{data.services.filter(x=>x.isActive).map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label><label>پرسنل<select value={booking.staffId} onChange={e=>setBooking({...booking,staffId:e.target.value})}>{data.staff.filter(x=>x.isActive).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label className="wide">یادداشت<textarea rows={3} value={booking.note} onChange={e=>setBooking({...booking,note:e.target.value})}/></label><button disabled={busy}>{busy?'در حال ثبت...':'ثبت نوبت'}</button></form></Modal>}
    {showService&&<Modal title="خدمت جدید" close={()=>setShowService(false)}><form onSubmit={createService} className="form one"><label>نام خدمت<input value={service.title} onChange={e=>setService({...service,title:e.target.value})} required/></label><label>مدت (دقیقه)<input type="number" min="5" value={service.durationMinutes} onChange={e=>setService({...service,durationMinutes:e.target.value})} required/></label><label>قیمت (ریال)<input type="number" min="0" value={service.priceAmount} onChange={e=>setService({...service,priceAmount:e.target.value})} required/></label><button disabled={busy}>ثبت خدمت</button></form></Modal>}
    {showStaff&&<Modal title="پرسنل جدید" close={()=>setShowStaff(false)}><form onSubmit={createStaff} className="form one"><label>نام<input value={staffForm.name} onChange={e=>setStaffForm({...staffForm,name:e.target.value})} required/></label><label>عنوان شغلی<input value={staffForm.roleTitle} onChange={e=>setStaffForm({...staffForm,roleTitle:e.target.value})}/></label><button disabled={busy}>ثبت پرسنل</button></form></Modal>}
  </div>;
}

// راهنما: این تابع «Overview» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Overview({data,today,revenue,openNew,status}:{data:Dashboard;today:Appointment[];revenue:number;openNew:()=>void;status:(id:string,s:Appointment['status'])=>void}){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<><section className="metrics"><Card label="نوبت امروز" value={nf.format(t…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <><section className="metrics"><Card label="نوبت امروز" value={nf.format(today.length)} note="برنامه امروز"/><Card label="تأییدشده" value={nf.format(today.filter(x=>x.status==='CONFIRMED').length)} note="در انتظار انجام"/><Card label="درآمد امروز" value={money(revenue)} note="تأییدشده + انجام‌شده"/><Card label="مشتریان" value={nf.format(data.customers.length)} note="ثبت‌شده در CRM"/></section><section className="grid"><article className="panel"><div className="ph"><div><small>امروز</small><h2>نوبت‌های امروز</h2></div><button onClick={openNew}>＋ افزودن</button></div><List items={today} status={status}/></article><article className="panel"><div className="ph"><div><small>ظرفیت</small><h2>تیم فعال</h2></div></div>{data.staff.map(s=><div className="staffrow" key={s.id}><i>{s.name[0]}</i><span><b>{s.name}</b><small>{s.roleTitle||'پرسنل'}</small></span><em>{nf.format(today.filter(a=>a.staffId===s.id).length)} نوبت</em></div>)}</article></section></>}
// راهنما: این تابع «Card» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Card({label,value,note}:{label:string;value:string;note:string}){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<article className="card"><small>{label}</small><strong>{value}</strong><p…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <article className="card"><small>{label}</small><strong>{value}</strong><p>{note}</p></article>}
// راهنما: این تابع «Appointments» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Appointments({items,search,setSearch,status}:{items:Appointment[];search:string;setSearch:(v:string)=>void;status:(id:string,s:Appointment['status'])=>void}){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<article className="panel"><div className="toolbar"><input value={search} …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <article className="panel"><div className="toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جست‌وجوی نام، شماره، خدمت یا پرسنل"/><span>{nf.format(items.length)} مورد</span></div><List items={items} status={status}/></article>}
// راهنما: این تابع «List» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function List({items,status}:{items:Appointment[];status:(id:string,s:Appointment['status'])=>void}){/* راهنما: این شرط بررسی می‌کند آیا «!items.length» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if(!items.length)/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="empty">نوبتی ثبت نشده است.</div>» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <div className="empty">نوبتی ثبت نشده است.</div>;/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div>{items.map(a=><div className="row" key={a.id}><time><b>{new Date(a.st…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <div>{items.map(a=><div className="row" key={a.id}><time><b>{new Date(a.startsAt).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}</b><small>{new Date(a.startsAt).toLocaleDateString('fa-IR')}</small></time><i>{(a.BookingCustomer?.fullName||'م')[0]}</i><span><b>{a.BookingCustomer?.fullName||'مشتری'}</b><small>{a.BookingCustomer?.phone||''}</small></span><span><b>{a.BookingService?.title||'خدمت'}</b><small>{a.BookingStaff?.name||'—'}</small></span><strong>{money(a.amount)}</strong><em className={'s '+a.status.toLowerCase()}>{statusFa[a.status]}</em><div><button onClick={()=>void status(a.id,'DONE')}>✓</button><button onClick={()=>void status(a.id,'CANCELLED')}>×</button></div></div>)}</div>}
// راهنما: این تابع «Services» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Services({items,open}:{items:Service[];open:()=>void}){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<><div className="actionline"><p>خدمت‌ها، مدت و قیمت رزرو را مدیریت کن.</p…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <><div className="actionline"><p>خدمت‌ها، مدت و قیمت رزرو را مدیریت کن.</p><button onClick={open}>＋ خدمت جدید</button></div><section className="tiles">{items.map(x=><article className="panel tile" key={x.id}><i style={{background:x.color}}>◇</i><h2>{x.title}</h2><p>{x.description||'خدمت قابل رزرو در سامانه'}</p><dl><div><dt>مدت</dt><dd>{nf.format(x.durationMinutes)} دقیقه</dd></div><div><dt>قیمت</dt><dd>{money(x.priceAmount)}</dd></div></dl></article>)}</section></>}
// راهنما: این تابع «StaffView» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function StaffView({items,open}:{items:Staff[];open:()=>void}){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<><div className="actionline"><p>پرسنل و ظرفیت تیم را مدیریت کن.</p><butto…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <><div className="actionline"><p>پرسنل و ظرفیت تیم را مدیریت کن.</p><button onClick={open}>＋ پرسنل جدید</button></div><section className="tiles">{items.map(x=><article className="panel tile" key={x.id}><i style={{background:x.color}}>{x.name[0]}</i><h2>{x.name}</h2><p>{x.roleTitle||'پرسنل'}</p><span className="ok">فعال</span></article>)}</section></>}
// راهنما: این تابع «Customers» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Customers({items}:{items:Customer[]}){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<section className="tiles">{items.map(x=><article className="panel tile" k…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <section className="tiles">{items.map(x=><article className="panel tile" key={x.id}><i>{x.fullName[0]}</i><h2>{x.fullName}</h2><p>{x.phone}</p>{x.email&&<small>{x.email}</small>}</article>)}</section>}
// راهنما: این تابع «SettingsView» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function SettingsView({settings,save}:{settings:Settings|null;save:(b:Record<string,unknown>)=>Promise<boolean>}){/* راهنما: این دستور State محلی React برای «[v,setV]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود. */ const [v,setV]=useState(settings||{slotIntervalMinutes:15,minBookingNoticeMinutes:120,cancellationNoticeMinutes:360,allowCustomerCancellation:true,requireDeposit:false,defaultDepositPercent:30,publicBookingEnabled:true});/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<article className="panel settings"><h2>قوانین رزرو</h2><label>فاصله زمانی…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <article className="panel settings"><h2>قوانین رزرو</h2><label>فاصله زمانی اسلات‌ها<select value={v.slotIntervalMinutes} onChange={e=>setV({...v,slotIntervalMinutes:Number(e.target.value)})}><option value="15">۱۵ دقیقه</option><option value="30">۳۰ دقیقه</option><option value="60">۶۰ دقیقه</option></select></label><label>حداقل زمان قبل از رزرو<input type="number" value={v.minBookingNoticeMinutes} onChange={e=>setV({...v,minBookingNoticeMinutes:Number(e.target.value)})}/></label><label className="check"><input type="checkbox" checked={v.allowCustomerCancellation} onChange={e=>setV({...v,allowCustomerCancellation:e.target.checked})}/> اجازه لغو توسط مشتری</label><label className="check"><input type="checkbox" checked={v.requireDeposit} onChange={e=>setV({...v,requireDeposit:e.target.checked})}/> دریافت بیعانه</label><label>درصد بیعانه<input type="number" min="0" max="100" value={v.defaultDepositPercent} onChange={e=>setV({...v,defaultDepositPercent:Number(e.target.value)})}/></label><button onClick={()=>void save({action:'save_settings',...v})}>ذخیره تنظیمات</button></article>}
// راهنما: این تابع «Modal» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Modal({title,close,children}:{title:string;close:()=>void;children:React.ReactNode}){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="modalbg"><div className="modal"><div className="mh"><h2>{t…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <div className="modalbg"><div className="modal"><div className="mh"><h2>{title}</h2><button onClick={close}>×</button></div>{children}</div></div>}
// راهنما: این تابع «Loading» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Loading(){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="loading" dir="rtl">در حال دریافت اطلاعات نوبت‌دهی...</div>» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <div className="loading" dir="rtl">در حال دریافت اطلاعات نوبت‌دهی...</div>}

// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles=`*{box-sizing:border-box}.bv{--ink:#172033;--muted:#7e8999;--line:#e7ebf1;--brand:#6357e8;min-height:100vh;background:#f5f7fb;color:var(--ink);font-family:Inter,Vazirmatn,Tahoma,sans-serif}.bv aside{position:fixed;right:0;top:0;bottom:0;width:220px;background:#111827;padding:22px 15px;display:flex;flex-direction:column}.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;margin-bottom:28px}.brand>b{width:38px;height:38px;border-radius:10px;background:#6558e8;display:grid;place-items:center}.brand span{font-size:12px;font-weight:900}.brand small{display:block;color:#7f8aa0;font-size:8px;margin-top:3px}.bv nav{display:flex;flex-direction:column;gap:5px}.bv nav button{border:0;background:transparent;color:#8995a9;padding:11px;border-radius:9px;text-align:right;cursor:pointer;font-weight:800;font-size:11px}.bv nav button.on,.bv nav button:hover{background:#6659e5;color:#fff}.back{margin-top:auto;color:#8390a3;text-decoration:none;font-size:9px}.bv main{margin-right:220px;padding:28px 30px 90px}.bv header{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}.bv header small{color:#6b5fe7;font-weight:900}.bv header h1{margin:4px 0 0;font-size:24px}.bv button{font:inherit}.bv header>button,.actionline button,.form>button,.settings>button{border:0;background:#6659e5;color:#fff;border-radius:9px;padding:10px 14px;font-weight:900;cursor:pointer;font-size:10px}.err{background:#fff0f1;color:#c74457;border:1px solid #ffd7dd;border-radius:10px;padding:10px 12px;margin-bottom:14px;font-size:10px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.card,.panel{background:#fff;border:1px solid var(--line);border-radius:14px}.card{padding:16px}.card small{color:var(--muted);font-size:9px}.card strong{display:block;font-size:21px;margin:8px 0}.card p{margin:0;color:#a0a8b4;font-size:8px}.grid{display:grid;grid-template-columns:1.7fr .8fr;gap:14px}.ph,.toolbar,.actionline{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 16px;border-bottom:1px solid var(--line)}.ph h2,.tile h2,.settings h2{margin:3px 0 0;font-size:13px}.ph small{color:#766be9;font-size:8px;font-weight:900}.ph button{border:0;background:transparent;color:#6558e7;font-size:9px;font-weight:900}.row{display:grid;grid-template-columns:78px 34px 1fr 1fr 110px 80px 58px;gap:9px;align-items:center;padding:11px 14px;border-top:1px solid #f0f2f5}.row time,.row span{display:flex;flex-direction:column}.row time b,.row span b{font-size:9px}.row time small,.row span small{font-size:8px;color:#9ba4b1;margin-top:3px}.row>i,.staffrow>i,.tile>i{width:31px;height:31px;border-radius:9px;background:#efedff;color:#5e52d9;display:grid;place-items:center;font-style:normal;font-weight:900}.row>strong{font-size:9px}.row>div button{width:25px;height:25px;border:1px solid var(--line);background:#fff;border-radius:7px;cursor:pointer}.s{font-style:normal;border-radius:99px;padding:5px 7px;font-size:8px;text-align:center}.s.confirmed,.ok{background:#eaf9f3;color:#0b9568}.s.pending{background:#fff7df;color:#9c6a00}.s.done{background:#eef1f5;color:#687485}.s.cancelled,.s.no_show{background:#fff0f1;color:#d04a5d}.staffrow{display:flex;align-items:center;gap:9px;padding:11px 14px;border-top:1px solid #f0f2f5}.staffrow span{display:flex;flex:1;flex-direction:column}.staffrow b{font-size:9px}.staffrow small,.staffrow em{font-size:8px;color:#8d98a8}.staffrow em{font-style:normal}.toolbar input{width:min(430px,100%);border:1px solid var(--line);background:#f8fafc;border-radius:9px;padding:10px;font-size:10px}.toolbar span{font-size:9px;color:#8c96a6}.empty{padding:35px;text-align:center;color:#9aa4b1;font-size:9px}.actionline{border:0;padding:0 0 15px}.actionline p{margin:0;color:#7f8a9a;font-size:10px}.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.tile{padding:16px}.tile>i{color:#fff;margin-bottom:12px}.tile p{font-size:9px;color:#8994a4}.tile dl{display:grid;grid-template-columns:1fr 1fr;gap:8px}.tile dl>div{background:#f8fafc;border-radius:8px;padding:9px}.tile dt{font-size:7px;color:#98a1ad}.tile dd{margin:4px 0 0;font-size:8px;font-weight:900}.ok{display:inline-block;border-radius:99px;padding:5px 8px;font-size:8px}.settings{max-width:600px;padding:18px}.settings label{display:block;font-size:9px;font-weight:800;margin-top:14px}.settings input,.settings select{display:block;width:100%;border:1px solid var(--line);border-radius:9px;padding:10px;margin-top:6px}.settings .check{display:flex;gap:8px;align-items:center}.settings .check input{width:auto;margin:0}.settings>button{margin-top:18px}.modalbg{position:fixed;inset:0;background:rgba(10,16,28,.58);display:grid;place-items:center;z-index:200;padding:18px}.modal{width:min(620px,100%);background:#fff;border-radius:16px;padding:18px}.mh{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.mh h2{font-size:17px;margin:0}.mh button{width:31px;height:31px;border:1px solid var(--line);background:#fff;border-radius:8px;font-size:18px}.form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.form.one{grid-template-columns:1fr}.form label{font-size:8px;font-weight:900}.form input,.form select,.form textarea{display:block;width:100%;border:1px solid var(--line);background:#fbfcfd;border-radius:8px;padding:10px;margin-top:6px}.form .wide{grid-column:1/-1}.form>button{grid-column:1/-1}.loading{min-height:100vh;background:#111827;color:#fff;display:grid;place-items:center;font:700 12px Inter,Vazirmatn,Tahoma}.bv .commerce-quick-nav{direction:rtl}@media(max-width:1000px){.metrics{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}.tiles{grid-template-columns:1fr 1fr}.row{grid-template-columns:65px 30px 1fr 1fr 75px}.row>strong,.row>div{display:none}}@media(max-width:720px){.bv aside{display:none}.bv main{margin-right:0;padding:20px 12px 85px}.tiles{grid-template-columns:1fr}.row{grid-template-columns:60px 30px 1fr 72px}.row>span:nth-of-type(2){display:none}.form{grid-template-columns:1fr}.form .wide,.form>button{grid-column:auto}.bv header h1{font-size:20px}}`;
