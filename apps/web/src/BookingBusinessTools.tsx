/**
 * AI-PANEL-FA-INLINE-GUIDE
 * این فایل توسط راهنمای فارسی AI Panel مستندسازی شده است.
 * کامنت‌های «راهنما» توضیح می‌دهند دستور یا بلوک بعدی چه نقشی دارد.
 * این توضیحات بخشی از Runtime نیستند و JavaScript آن‌ها را اجرا نمی‌کند.
 */
// راهنما: این دستور { useEffect, useMemo, useState } را از ماژول «react» وارد می‌کند تا در این فایل قابل استفاده باشد.
import { useEffect, useMemo, useState } from 'react';

// راهنما: این Type با نام «Service» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Service = { id:string; title:string; priceAmount:number|string; durationMinutes:number; isActive:boolean };
// راهنما: این Type با نام «Staff» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Staff = { id:string; name:string; roleTitle?:string|null; isActive:boolean };
// راهنما: این Type با نام «Customer» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Customer = { id:string; fullName:string; phone:string; email?:string|null };
// راهنما: این Type با نام «Appointment» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Appointment = {
  id:string;
  customerId:string;
  serviceId:string;
  staffId:string;
  startsAt:string;
  status:'PENDING'|'CONFIRMED'|'DONE'|'CANCELLED'|'NO_SHOW';
  amount:number|string;
};
// راهنما: این Type با نام «Settings» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Settings = {
  publicBookingEnabled:boolean;
  publicSlug?:string|null;
  reminders?:Record<string,boolean>;
  requireDeposit:boolean;
};
// راهنما: این Type با نام «Dashboard» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Dashboard = {
  ok:boolean;
  services:Service[];
  staff:Staff[];
  customers:Customer[];
  appointments:Appointment[];
  settings:Settings|null;
  message?:string;
};

// راهنما: این Type با نام «ToolKey» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type ToolKey =
  | 'finance' | 'reports' | 'staff-access' | 'staff-services' | 'customers' | 'booking'
  | 'inbox' | 'sms' | 'dedicated-number' | 'regional-sms' | 'birthday' | 'survey'
  | 'reminder' | 'winback' | 'online-booking' | 'website' | 'loyalty' | 'lottery';

// راهنما: این Type با نام «Tool» شکل و مقادیر مجاز داده را برای TypeScript مشخص می‌کند و در زمان اجرا کد مستقلی تولید نمی‌کند.
type Tool = {
  key:ToolKey;
  title:string;
  icon:string;
  color:string;
  premium?:boolean;
  badge?:string;
  description:string;
};

// راهنما: این دستور متغیر/ثابت «nf» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const nf = new Intl.NumberFormat('fa-IR');
// راهنما: این دستور متغیر/ثابت «money» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const money = (v:number) => `${nf.format(v)} ریال`;

// راهنما: این دستور متغیر/ثابت «tools» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const tools:Tool[] = [
  { key:'customers', title:'پرونده مشتری', icon:'♙', color:'#21c9f3', description:'پرونده، شماره تماس و سابقه مراجعه مشتریان.' },
  { key:'booking', title:'نوبت دهی', icon:'▤', color:'#48e27e', description:'ثبت، مدیریت و پیگیری نوبت‌ها.' },
  { key:'inbox', title:'دریافت پیام', icon:'▣', color:'#ffe023', description:'صندوق پیام‌های ورودی مشتریان از کانال‌های متصل.' },
  { key:'sms', title:'سامانه پیامک', icon:'◉', color:'#ff8b2b', description:'ارسال پیامک خدماتی، گروهی و گزارش ارسال.' },
  { key:'dedicated-number', title:'شماره اختصاصی', icon:'▱', color:'#3d78ff', description:'اتصال خط اختصاصی برای ارسال و دریافت پیامک.', premium:true },
  { key:'regional-sms', title:'پیامک منطقه‌ای', icon:'◌', color:'#ffbf55', description:'کمپین پیامکی بر اساس محدوده و منطقه.', badge:'NEW' },
  { key:'birthday', title:'تبریک تولد', icon:'♨', color:'#ff3f91', description:'ارسال خودکار پیام تبریک در روز تولد مشتری.' },
  { key:'survey', title:'رضایت سنجی', icon:'☺', color:'#ffdc45', description:'ارسال فرم رضایت و جمع‌آوری امتیاز مشتری.' },
  { key:'reminder', title:'یادآوری ترمیم', icon:'♧', color:'#ff553a', description:'یادآوری خودکار برای مراجعه یا سرویس بعدی.' },
  { key:'winback', title:'بازگشت مشتری', icon:'↻', color:'#7755ff', description:'شناسایی مشتریان غیرفعال و کمپین بازگشت.' },
  { key:'online-booking', title:'رزرو نوبت آنلاین', icon:'↪', color:'#49eb79', description:'لینک عمومی برای رزرو مستقیم مشتری.', premium:true },
  { key:'website', title:'سایت اختصاصی', icon:'◎', color:'#4da1ff', description:'صفحه اختصاصی کسب‌وکار و خدمات.', premium:true },
  { key:'loyalty', title:'باشگاه مشتریان', icon:'◇', color:'#ff4e49', description:'امتیاز، سطح مشتری و مزایای وفاداری.', premium:true },
  { key:'lottery', title:'قرعه کشی', icon:'▣', color:'#a54dff', description:'قرعه‌کشی بین مشتریان یا اعضای باشگاه.' },
  { key:'finance', title:'مالی حسابداری', icon:'$', color:'#6bea49', description:'درآمد نوبت‌ها، پرداخت‌ها و گزارش مالی.', premium:true },
  { key:'reports', title:'گزارش سیستم', icon:'▥', color:'#4389ff', description:'گزارش عملکرد نوبت، مشتری و خدمات.' },
  { key:'staff-access', title:'دسترسی پرسنل', icon:'♟', color:'#ff4b49', description:'سطح دسترسی و نقش هر پرسنل.', premium:true },
  { key:'staff-services', title:'پرسنل و خدمات', icon:'⌘', color:'#ffaf38', description:'پرسنل، خدمات قابل ارائه و ظرفیت کاری.', premium:true },
];

// راهنما: این تابع «loadDashboard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
async function loadDashboard(){
  // راهنما: این متغیر «res» نتیجه یا Promise یک درخواست شبکه را نگه می‌دارد.
  const res = await fetch('/api/booking');
  // راهنما: این دستور متغیر/ثابت «data» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const data = await res.json().catch(()=>({})) as Dashboard;
  // راهنما: این شرط بررسی می‌کند آیا «!res.ok» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
  if(!res.ok) /* راهنما: این دستور عمداً یک خطا ایجاد می‌کند تا اجرای مسیر فعلی متوقف و کنترل خطا به لایه بالاتر منتقل شود. */ throw new Error(data.message || 'اطلاعات ابزارهای نوبت‌دهی دریافت نشد.');
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return data;
}

// راهنما: این تابع «BookingBusinessTools» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
export default function BookingBusinessTools(){
  // راهنما: این دستور متغیر/ثابت «[data,setData]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [data,setData]=useState<Dashboard|null>(null);
  // راهنما: این دستور State محلی React برای «[error,setError]» می‌سازد تا مقدار آن در UI نگهداری و با تغییرش صفحه دوباره Render شود.
  const [error,setError]=useState('');
  // راهنما: این دستور متغیر/ثابت «[active,setActive]» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const [active,setActive]=useState<ToolKey|null>(null);

  // راهنما: این useEffect یک اثر جانبی React را اجرا می‌کند؛ معمولاً برای دریافت داده، افزودن Listener یا هماهنگی با سیستم بیرونی استفاده می‌شود.
  useEffect(()=>{
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «void loadDashboard().then(setData).catch((e)=>setError(e instanceof Error?e.message:'خطا …».
    void loadDashboard().then(setData).catch((e)=>setError(e instanceof Error?e.message:'خطا در دریافت اطلاعات'));
  },[]);

  // راهنما: این دستور مقدار «stats» را با useMemo محاسبه و Cache می‌کند تا محاسبه غیرضروری در Renderهای بعدی تکرار نشود.
  const stats = useMemo(()=>{
    // راهنما: این دستور متغیر/ثابت «appointments» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const appointments = data?.appointments || [];
    // راهنما: این دستور متغیر/ثابت «completed» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const completed = appointments.filter(x=>x.status==='DONE'||x.status==='CONFIRMED');
    // راهنما: این دستور متغیر/ثابت «revenue» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const revenue = completed.reduce((s,x)=>s+Number(x.amount||0),0);
    // راهنما: این دستور متغیر/ثابت «customerCounts» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const customerCounts = new Map<string,number>();
    // راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «appointments.forEach(a=>customerCounts.set(a.customerId,(customerCounts.get(a.customerId)…».
    appointments.forEach(a=>customerCounts.set(a.customerId,(customerCounts.get(a.customerId)||0)+1));
    // راهنما: این دستور متغیر/ثابت «returning» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const returning = [...customerCounts.values()].filter(v=>v>1).length;
    // راهنما: این دستور متغیر/ثابت «month» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const month = new Date().getMonth();
    // راهنما: این دستور متغیر/ثابت «thisMonth» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
    const thisMonth = appointments.filter(a=>new Date(a.startsAt).getMonth()===month).length;
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «{ revenue, returning, thisMonth }» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return { revenue, returning, thisMonth };
  },[data]);

  // راهنما: این دستور متغیر/ثابت «activeTool» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const activeTool = tools.find(t=>t.key===active) || null;

  // راهنما: این تابع «metricFor» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
  function metricFor(key:ToolKey){
    // راهنما: این شرط بررسی می‌کند آیا «!data» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(!data) /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'—'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return '—';
    // راهنما: این شرط بررسی می‌کند آیا «key==='customers'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(key==='customers') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «nf.format(data.customers.length)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return nf.format(data.customers.length);
    // راهنما: این شرط بررسی می‌کند آیا «key==='booking'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(key==='booking') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «nf.format(data.appointments.length)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return nf.format(data.appointments.length);
    // راهنما: این شرط بررسی می‌کند آیا «key==='staff-access'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(key==='staff-access') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «nf.format(data.staff.length)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return nf.format(data.staff.length);
    // راهنما: این شرط بررسی می‌کند آیا «key==='staff-services'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(key==='staff-services') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «nf.format(data.services.length)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return nf.format(data.services.length);
    // راهنما: این شرط بررسی می‌کند آیا «key==='winback'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(key==='winback') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «nf.format(stats.returning)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return nf.format(stats.returning);
    // راهنما: این شرط بررسی می‌کند آیا «key==='finance'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(key==='finance') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «money(stats.revenue)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return money(stats.revenue);
    // راهنما: این شرط بررسی می‌کند آیا «key==='reports'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(key==='reports') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «nf.format(stats.thisMonth)» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return nf.format(stats.thisMonth);
    // راهنما: این شرط بررسی می‌کند آیا «key==='online-booking'» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود.
    if(key==='online-booking') /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data.settings?.publicBookingEnabled ? 'فعال' : 'خاموش'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return data.settings?.publicBookingEnabled ? 'فعال' : 'خاموش';
    // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «undefined» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
    return undefined;
  }

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="bt" dir="rtl"><style>{styles}</style> <header className="b…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="bt" dir="rtl"><style>{styles}</style>
    <header className="bt-top">
      <a href="/app/booking" className="bt-brand"><i>AP</i><span><b>AI PANEL</b><small>Business Tools</small></span></a>
      <div><span className="bt-live">● سیستم آنلاین</span><a href="/app/booking">بازگشت به نوبت‌دهی</a></div>
    </header>

    <main>
      <section className="bt-intro">
        <div><small>CRM · پیامک · مالی · وفادارسازی</small><h1>ابزارهای کسب‌وکار</h1><p>همان مجموعه قابلیت‌هایی که در نمونه TikTime مشخص کردی، داخل ماژول نوبت‌دهی AI Panel.</p></div>
        <div className="bt-mini"><span>مشتری <b>{data?nf.format(data.customers.length):'—'}</b></span><span>نوبت <b>{data?nf.format(data.appointments.length):'—'}</b></span><span>خدمت <b>{data?nf.format(data.services.length):'—'}</b></span></div>
      </section>

      {error&&<div className="bt-error">{error}</div>}

      <section className="bt-grid bt-top-grid">
        <BigChartCard tool={tools.find(t=>t.key==='finance')!} value={data?money(stats.revenue):'—'} line="green" onClick={()=>setActive('finance')}/>
        <BigChartCard tool={tools.find(t=>t.key==='reports')!} value={data?`${nf.format(stats.thisMonth)} رویداد این ماه`:'—'} line="blue" onClick={()=>setActive('reports')}/>
      </section>

      <section className="bt-grid bt-main-grid">
        {tools.filter(t=>!['finance','reports'].includes(t.key)).map(tool=><ToolCard key={tool.key} tool={tool} metric={metricFor(tool.key)} onClick={()=>setActive(tool.key)}/>)}
      </section>

      <SmsBalanceCard onClick={()=>setActive('sms')}/>
    </main>

    {activeTool&&<ToolDrawer tool={activeTool} data={data} stats={stats} close={()=>setActive(null)}/>} 
  </div>;
}

// راهنما: این تابع «BigChartCard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function BigChartCard({tool,value,line,onClick}:{tool:Tool;value:string;line:'green'|'blue';onClick:()=>void}){
  // راهنما: این دستور متغیر/ثابت «points» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const points=line==='green'?'0,70 30,92 60,54 90,74 120,42 150,58 180,28 210,48 240,34 280,18':'0,42 30,80 60,50 90,32 120,60 150,48 180,18 210,44 240,30 280,22';
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<button className="bt-chart-card" onClick={onClick}> <div className="bt-sp…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <button className="bt-chart-card" onClick={onClick}>
    <div className="bt-spark"><svg viewBox="0 0 280 110" preserveAspectRatio="none"><defs><linearGradient id={`g-${line}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={line==='green'?'#6bea49':'#4389ff'} stopOpacity=".65"/><stop offset="1" stopColor={line==='green'?'#6bea49':'#4389ff'} stopOpacity="0"/></linearGradient></defs><polyline points={points} fill="none" stroke={line==='green'?'#75ee51':'#5297ff'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><polygon points={`${points} 280,110 0,110`} fill={`url(#g-${line})`}/></svg></div>
    <div className="bt-chart-title"><Icon tool={tool}/><span><b>{tool.title}</b><small>{value}</small></span>{tool.premium&&<Crown/>}</div>
  </button>;
}

// راهنما: این تابع «ToolCard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function ToolCard({tool,metric,onClick}:{tool:Tool;metric?:string;onClick:()=>void}){
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<button className="bt-tool" onClick={onClick}> {tool.badge&&<span classNam…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <button className="bt-tool" onClick={onClick}>
    {tool.badge&&<span className="bt-new">{tool.badge}</span>}
    <Icon tool={tool}/>
    <span className="bt-tool-title">{tool.title}</span>
    {metric&&<strong>{metric}</strong>}
    {tool.premium&&<Crown/>}
    <em>‹</em>
  </button>;
}

// راهنما: این تابع «Icon» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Icon({tool}:{tool:Tool}){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<i className="bt-icon" style={{color:tool.color,boxShadow:`inset 0 0 0 1px…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <i className="bt-icon" style={{color:tool.color,boxShadow:`inset 0 0 0 1px ${tool.color}55,0 0 22px ${tool.color}18`}}>{tool.icon}</i>}
// راهنما: این تابع «Crown» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function Crown(){/* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<span className="bt-crown">♛</span>» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return <span className="bt-crown">♛</span>}

// راهنما: این تابع «SmsBalanceCard» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function SmsBalanceCard({onClick}:{onClick:()=>void}){
  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<section className="bt-sms-wallet"> <div className="bt-ring"><div><small>م…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <section className="bt-sms-wallet">
    <div className="bt-ring"><div><small>موجودی</small><strong>۰</strong><span>پیامک باقی‌مانده</span></div></div>
    <div className="bt-package"><div><span><b>بسته اشتراک</b><small>پس از اتصال سرویس پیامک</small></span><strong>۰</strong></div><div><span><b>بسته پیامک انبوه</b><small>بدون بسته فعال</small></span><strong>۰</strong></div><div className="bt-wallet-actions"><button onClick={onClick}>＋ شارژ بسته</button><button onClick={onClick}>▥ گزارش پیامک</button></div></div>
  </section>;
}

// راهنما: این تابع «ToolDrawer» یک بخش مستقل از منطق برنامه را تعریف می‌کند؛ ورودی‌ها را می‌گیرد و منطق داخل بدنه را اجرا می‌کند.
function ToolDrawer({tool,data,stats,close}:{tool:Tool;data:Dashboard|null;stats:{revenue:number;returning:number;thisMonth:number};close:()=>void}){
  // راهنما: این دستور متغیر/ثابت «real» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const real = ['finance','reports','staff-access','staff-services','customers','booking','online-booking'].includes(tool.key);
  // راهنما: این دستور متغیر/ثابت «detail» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
  const detail = (()=>{
    // راهنما: این Switch مقدار «tool.key» را با چند حالت مقایسه می‌کند و شاخه مناسب را اجرا می‌کند.
    switch(tool.key){
      case 'finance': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`درآمد فعلی ثبت‌شده از نوبت‌های تأییدشده و انجام‌شده: ${money(stats.revenu…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `درآمد فعلی ثبت‌شده از نوبت‌های تأییدشده و انجام‌شده: ${money(stats.revenue)}`;
      case 'reports': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${nf.format(stats.thisMonth)} نوبت در ماه جاری در دیتابیس ثبت شده است.`» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `${nf.format(stats.thisMonth)} نوبت در ماه جاری در دیتابیس ثبت شده است.`;
      case 'customers': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${nf.format(data?.customers.length||0)} پرونده مشتری در CRM موجود است.`» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `${nf.format(data?.customers.length||0)} پرونده مشتری در CRM موجود است.`;
      case 'booking': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${nf.format(data?.appointments.length||0)} نوبت در سیستم ثبت شده است.`» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `${nf.format(data?.appointments.length||0)} نوبت در سیستم ثبت شده است.`;
      case 'staff-access': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${nf.format(data?.staff.length||0)} پرسنل فعال/ثبت‌شده برای تعریف سطح دست…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `${nf.format(data?.staff.length||0)} پرسنل فعال/ثبت‌شده برای تعریف سطح دسترسی داریم.`;
      case 'staff-services': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${nf.format(data?.staff.length||0)} پرسنل و ${nf.format(data?.services.le…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `${nf.format(data?.staff.length||0)} پرسنل و ${nf.format(data?.services.length||0)} خدمت ثبت شده است.`;
      case 'online-booking': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «data?.settings?.publicBookingEnabled ? 'رزرو آنلاین در تنظیمات فعال است؛ م…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return data?.settings?.publicBookingEnabled ? 'رزرو آنلاین در تنظیمات فعال است؛ مرحله بعد صفحه عمومی مشتری است.' : 'رزرو آنلاین فعلاً خاموش است.';
      case 'sms': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'هسته پنل پیامک در UI آماده است؛ برای ارسال واقعی باید سرویس‌دهنده پیامک و…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'هسته پنل پیامک در UI آماده است؛ برای ارسال واقعی باید سرویس‌دهنده پیامک و API Key متصل شود.';
      case 'birthday': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'برای فعال‌سازی کامل، تاریخ تولد باید به پرونده مشتری اضافه و یک زمان‌بند …» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'برای فعال‌سازی کامل، تاریخ تولد باید به پرونده مشتری اضافه و یک زمان‌بند ارسال ساخته شود.';
      case 'survey': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'مرحله بعد: ساخت لینک نظرسنجی و ذخیره امتیاز/نظر هر مشتری بعد از مراجعه.'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'مرحله بعد: ساخت لینک نظرسنجی و ذخیره امتیاز/نظر هر مشتری بعد از مراجعه.';
      case 'reminder': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'مرحله بعد: تعریف فاصله مراجعه برای هر خدمت و ساخت یادآوری زمان‌بندی‌شده.'» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'مرحله بعد: تعریف فاصله مراجعه برای هر خدمت و ساخت یادآوری زمان‌بندی‌شده.';
      case 'winback': /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «`${nf.format(stats.returning)} مشتری در داده فعلی بیش از یک نوبت دارند؛ من…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return `${nf.format(stats.returning)} مشتری در داده فعلی بیش از یک نوبت دارند؛ منطق بازگشت مشتری بر اساس آخرین مراجعه اضافه می‌شود.`;
      default: /* راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «'این ماژول در هاب محصول قرار گرفت و در فاز اتصال بک‌اند اختصاصی تکمیل می‌ش…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد. */ return 'این ماژول در هاب محصول قرار گرفت و در فاز اتصال بک‌اند اختصاصی تکمیل می‌شود.';
    }
  })();

  // راهنما: این Return اجرای تابع را در این نقطه تمام می‌کند و «<div className="bt-backdrop" onMouseDown={e=>{if(e.currentTarget===e.targe…» را به فراخواننده برمی‌گرداند؛ در کامپوننت React می‌تواند UI خروجی باشد.
  return <div className="bt-backdrop" onMouseDown={e=>{/* راهنما: این شرط بررسی می‌کند آیا «e.currentTarget===e.target» برقرار است؛ فقط در صورت درست بودن، شاخه مربوط اجرا می‌شود. */ if(e.currentTarget===e.target)/* راهنما: این دستور یک عملیات اجرایی انجام می‌دهد: «close()». */ close();}}><section className="bt-drawer">
    <button className="bt-close" onClick={close}>×</button>
    <div className="bt-drawer-head"><Icon tool={tool}/><div><span>{real?'متصل به هسته فعلی':'ماژول بعدی'}</span><h2>{tool.title}</h2></div>{tool.premium&&<Crown/>}</div>
    <p>{tool.description}</p><div className={`bt-state ${real?'ready':'next'}`}>{real?'بخش پایه فعال است':'نیازمند توسعه/اتصال بعدی'}</div><article>{detail}</article>
    <div className="bt-drawer-actions">{['booking','customers','staff-access','staff-services','online-booking'].includes(tool.key)&&<a href="/app/booking">باز کردن مدیریت نوبت‌دهی</a>}<button onClick={close}>بستن</button></div>
  </section></div>;
}

// راهنما: این دستور متغیر/ثابت «styles» را تعریف می‌کند و مقدار موردنیاز این بخش از برنامه را نگه می‌دارد.
const styles=`
*{box-sizing:border-box}.bt{min-height:100vh;background:radial-gradient(circle at 50% -20%,#162236 0,#09111d 34%,#050a12 72%);color:#f4f7fb;font-family:Inter,Vazirmatn,Tahoma,Arial,sans-serif;padding-bottom:110px}.bt button,.bt a{font:inherit}.bt-top{height:72px;padding:0 26px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:20;background:rgba(5,10,18,.88);backdrop-filter:blur(16px)}.bt-brand{color:#fff;text-decoration:none;display:flex;align-items:center;gap:10px}.bt-brand>i{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#7a69ff,#4d42c9);display:grid;place-items:center;font-style:normal;font-weight:900;font-size:12px}.bt-brand>span{display:flex;flex-direction:column}.bt-brand b{font-size:12px}.bt-brand small{font-size:8px;color:#77849b;margin-top:2px}.bt-top>div{display:flex;align-items:center;gap:14px}.bt-top a{font-size:9px;color:#9ca9bd;text-decoration:none}.bt-live{font-size:8px;color:#51dca9}.bt main{width:min(880px,calc(100% - 26px));margin:0 auto;padding-top:28px}.bt-intro{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:18px}.bt-intro small{font-size:9px;color:#78869c}.bt-intro h1{font-size:28px;margin:5px 0 6px}.bt-intro p{margin:0;color:#8390a5;font-size:10px;line-height:1.8}.bt-mini{display:flex;gap:7px}.bt-mini span{background:#101a28;border:1px solid #1c2a3c;border-radius:10px;padding:8px 10px;font-size:8px;color:#7f8da3}.bt-mini b{display:block;color:#fff;font-size:13px;margin-top:2px}.bt-error{padding:10px 12px;border:1px solid #6b2d3a;background:#2a1118;color:#ff9ead;border-radius:11px;font-size:9px;margin-bottom:12px}.bt-grid{display:grid;gap:11px}.bt-top-grid{grid-template-columns:1fr 1fr;margin-bottom:11px}.bt-main-grid{grid-template-columns:1fr 1fr}.bt-chart-card,.bt-tool{position:relative;border:1px solid rgba(173,190,215,.13);background:linear-gradient(145deg,rgba(27,35,48,.94),rgba(14,20,30,.94));color:#fff;border-radius:22px;cursor:pointer;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 16px 38px rgba(0,0,0,.18)}.bt-chart-card{height:180px;display:flex;align-items:center;padding:18px}.bt-chart-card:hover,.bt-tool:hover{border-color:rgba(124,110,255,.4);transform:translateY(-1px)}.bt-spark{width:54%;height:105px}.bt-spark svg{width:100%;height:100%;overflow:visible}.bt-chart-title{margin-right:auto;display:flex;align-items:center;gap:10px;text-align:right}.bt-chart-title>span{display:flex;flex-direction:column}.bt-chart-title b{font-size:18px;line-height:1.4}.bt-chart-title small{margin-top:6px;font-size:8px;color:#8f9bae}.bt-icon{width:51px;height:51px;border-radius:50%;background:#0a1019;display:grid;place-items:center;font-size:24px;font-style:normal;font-weight:900;flex:0 0 auto}.bt-crown{position:absolute;top:12px;left:12px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#e5a54b,#8f5517);color:#ffe2a4;font-size:17px;box-shadow:0 5px 15px rgba(209,137,40,.25)}.bt-tool{min-height:128px;display:grid;grid-template-columns:60px 1fr auto;align-items:center;text-align:right;padding:17px 19px}.bt-tool-title{font-size:16px;font-weight:900;line-height:1.45}.bt-tool strong{position:absolute;bottom:14px;right:95px;color:var(--metric,#55d7ff);font-size:21px}.bt-tool>em{position:absolute;bottom:14px;left:17px;font-style:normal;color:#667287;font-size:26px}.bt-new{position:absolute;top:8px;right:9px;background:#ed2875;color:#fff;font:900 8px/1 Arial;padding:5px 7px;border-radius:9px}.bt-sms-wallet{margin-top:12px;border:1px solid rgba(73,236,177,.32);background:linear-gradient(180deg,rgba(16,39,39,.98),rgba(12,78,57,.94));min-height:280px;border-radius:26px;padding:24px;display:grid;grid-template-columns:240px 1fr;align-items:center;gap:24px;box-shadow:0 18px 55px rgba(0,173,119,.14),inset 0 1px 0 rgba(255,255,255,.05)}.bt-ring{width:205px;height:205px;border:10px solid #55efbd;border-radius:50%;display:grid;place-items:center;box-shadow:0 0 30px rgba(53,240,184,.22),inset 0 0 30px rgba(53,240,184,.09);margin:auto}.bt-ring>div{text-align:center;display:flex;flex-direction:column}.bt-ring small{font-size:11px;color:#a5b4b6}.bt-ring strong{font-size:49px;margin:3px 0}.bt-ring span{font-size:10px;color:#b2c1c2}.bt-package>div:not(.bt-wallet-actions){display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.12)}.bt-package span{display:flex;flex-direction:column}.bt-package b{font-size:13px}.bt-package small{font-size:9px;color:#91aaa5;margin-top:5px}.bt-package strong{font-size:20px}.bt-wallet-actions{display:flex;gap:8px;margin-top:18px}.bt-wallet-actions button{flex:1;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.1);color:#d8fff2;padding:12px;border-radius:13px;font-size:10px;font-weight:800;cursor:pointer}.bt-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.68);z-index:120;display:flex;justify-content:flex-start;align-items:stretch;backdrop-filter:blur(6px)}.bt-drawer{width:min(430px,92vw);height:100%;background:#0d1521;border-right:1px solid #263449;padding:26px;position:relative;box-shadow:30px 0 80px rgba(0,0,0,.38)}.bt-close{position:absolute;top:18px;left:18px;width:34px;height:34px;border:1px solid #29374b;border-radius:10px;background:#121e2d;color:#aeb9c8;font-size:20px;cursor:pointer}.bt-drawer-head{display:flex;align-items:center;gap:12px;margin-top:36px;position:relative}.bt-drawer-head>div{display:flex;flex-direction:column}.bt-drawer-head span{font-size:8px;color:#75849a}.bt-drawer-head h2{font-size:22px;margin:4px 0 0}.bt-drawer>p{font-size:10px;line-height:2;color:#8997aa;margin:22px 0}.bt-state{display:inline-block;padding:7px 10px;border-radius:99px;font-size:8px;font-weight:900}.bt-state.ready{background:#11382c;color:#5ee7b5}.bt-state.next{background:#2c263b;color:#bca8ff}.bt-drawer article{margin-top:18px;padding:15px;background:#111d2b;border:1px solid #223147;border-radius:13px;color:#b9c5d3;font-size:10px;line-height:2}.bt-drawer-actions{display:flex;gap:8px;margin-top:18px}.bt-drawer-actions a,.bt-drawer-actions button{flex:1;text-align:center;text-decoration:none;border:1px solid #334259;background:#172438;color:#dce5f2;padding:10px;border-radius:10px;font-size:9px;font-weight:800;cursor:pointer}
@media(max-width:720px){.bt-top{height:62px;padding:0 13px}.bt-live{display:none}.bt main{width:calc(100% - 16px);padding-top:18px}.bt-intro{display:block;padding:0 4px}.bt-intro h1{font-size:23px}.bt-mini{margin-top:12px}.bt-mini span{flex:1}.bt-top-grid{grid-template-columns:1fr}.bt-chart-card{height:155px}.bt-main-grid{gap:8px}.bt-tool{min-height:112px;padding:13px;grid-template-columns:49px 1fr}.bt-icon{width:43px;height:43px;font-size:20px}.bt-tool-title{font-size:13px}.bt-tool strong{right:70px;font-size:18px}.bt-crown{width:26px;height:26px;font-size:14px;top:8px;left:8px}.bt-sms-wallet{grid-template-columns:1fr;padding:19px}.bt-ring{width:175px;height:175px}.bt-ring strong{font-size:42px}.bt-package b{font-size:11px}.bt-wallet-actions{flex-direction:column}.bt-drawer{padding:20px}}
@media(max-width:430px){.bt-tool-title{font-size:12px}.bt-tool{min-height:106px}.bt-icon{width:39px;height:39px;font-size:18px}.bt-main-grid{gap:7px}.bt-intro p{font-size:9px}.bt-chart-title b{font-size:15px}.bt-chart-card{padding:13px}.bt-spark{width:50%}.bt-tool strong{font-size:16px;bottom:10px}.bt-tool>em{bottom:8px}.bt-new{font-size:7px}.bt-sms-wallet{border-radius:20px}}
`;
