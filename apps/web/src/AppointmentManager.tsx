import { useEffect, useMemo, useState, type FormEvent } from 'react';

type Tab = 'overview' | 'calendar' | 'appointments' | 'customers' | 'services' | 'staff' | 'settings';
type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'DONE' | 'CANCELLED';

type Appointment = {
  id: string;
  date: string;
  time: string;
  customer: string;
  phone: string;
  service: string;
  staff: string;
  duration: number;
  amount: number;
  status: AppointmentStatus;
  note?: string;
};

type BookingForm = {
  customer: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  staff: string;
  note: string;
};

const fa = new Intl.NumberFormat('fa-IR');
const money = (value: number) => `${fa.format(value)} تومان`;

const services = [
  { id: 'consult', title: 'مشاوره و ارزیابی', duration: 30, price: 450000, color: '#6d5dfc' },
  { id: 'standard', title: 'سرویس استاندارد', duration: 60, price: 790000, color: '#11a779' },
  { id: 'followup', title: 'جلسه پیگیری', duration: 45, price: 590000, color: '#f59e0b' },
  { id: 'vip', title: 'سرویس VIP', duration: 90, price: 1290000, color: '#e34c8c' },
];

const staff = [
  { id: 'sara', name: 'سارا احمدی', role: 'متخصص ارشد', initials: 'س‌ا', today: 6, utilization: 78 },
  { id: 'mina', name: 'مینا رستگار', role: 'کارشناس', initials: 'م‌ر', today: 5, utilization: 64 },
  { id: 'roya', name: 'رویا زمانی', role: 'متخصص', initials: 'ر‌ز', today: 4, utilization: 52 },
];

const initialAppointments: Appointment[] = [
  { id: 'a-101', date: 'امروز', time: '09:30', customer: 'مهسا کریمی', phone: '0912 845 2210', service: 'مشاوره و ارزیابی', staff: 'سارا احمدی', duration: 30, amount: 450000, status: 'DONE' },
  { id: 'a-102', date: 'امروز', time: '10:30', customer: 'الهام یوسفی', phone: '0935 118 6742', service: 'سرویس استاندارد', staff: 'مینا رستگار', duration: 60, amount: 790000, status: 'CONFIRMED' },
  { id: 'a-103', date: 'امروز', time: '12:00', customer: 'نسترن احمدی', phone: '0910 733 0158', service: 'جلسه پیگیری', staff: 'رویا زمانی', duration: 45, amount: 590000, status: 'CONFIRMED' },
  { id: 'a-104', date: 'امروز', time: '14:30', customer: 'غزل مرادی', phone: '0901 250 9941', service: 'سرویس VIP', staff: 'سارا احمدی', duration: 90, amount: 1290000, status: 'PENDING' },
  { id: 'a-105', date: 'امروز', time: '16:15', customer: 'شادی امینی', phone: '0919 066 1724', service: 'سرویس استاندارد', staff: 'مینا رستگار', duration: 60, amount: 790000, status: 'CONFIRMED' },
  { id: 'a-106', date: 'فردا', time: '10:00', customer: 'آوا صادقی', phone: '0936 446 2271', service: 'سرویس VIP', staff: 'رویا زمانی', duration: 90, amount: 1290000, status: 'CONFIRMED' },
];

const weekDays = [
  { key: 'sat', title: 'شنبه', day: '۳۱', count: 3 },
  { key: 'sun', title: 'یکشنبه', day: '۱', count: 5, today: true },
  { key: 'mon', title: 'دوشنبه', day: '۲', count: 4 },
  { key: 'tue', title: 'سه‌شنبه', day: '۳', count: 6 },
  { key: 'wed', title: 'چهارشنبه', day: '۴', count: 3 },
  { key: 'thu', title: 'پنجشنبه', day: '۵', count: 5 },
  { key: 'fri', title: 'جمعه', day: '۶', count: 0 },
];

const calendarBlocks = [
  { day: 2, start: 0, span: 1, label: 'مشاوره · مهسا', tone: 'purple' },
  { day: 2, start: 2, span: 2, label: 'استاندارد · الهام', tone: 'green' },
  { day: 2, start: 5, span: 2, label: 'VIP · غزل', tone: 'pink' },
  { day: 3, start: 1, span: 1, label: 'پیگیری · نازنین', tone: 'amber' },
  { day: 3, start: 4, span: 2, label: 'استاندارد · آوا', tone: 'green' },
  { day: 4, start: 0, span: 2, label: 'VIP · سارا', tone: 'pink' },
  { day: 5, start: 3, span: 1, label: 'مشاوره · روژان', tone: 'purple' },
  { day: 6, start: 1, span: 2, label: 'استاندارد · مریم', tone: 'green' },
];

const statusLabel: Record<AppointmentStatus, string> = {
  CONFIRMED: 'تأیید شده',
  PENDING: 'در انتظار',
  DONE: 'انجام شده',
  CANCELLED: 'لغو شده',
};

const navItems: Array<{ key: Tab; icon: string; label: string }> = [
  { key: 'overview', icon: '⌂', label: 'نمای کلی' },
  { key: 'calendar', icon: '▦', label: 'تقویم' },
  { key: 'appointments', icon: '◷', label: 'نوبت‌ها' },
  { key: 'customers', icon: '◎', label: 'مشتریان' },
  { key: 'services', icon: '◇', label: 'خدمات' },
  { key: 'staff', icon: '♙', label: 'پرسنل' },
  { key: 'settings', icon: '⚙', label: 'تنظیمات' },
];

function currentDateLabel() {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  } catch {
    return 'امروز';
  }
}

export default function AppointmentManager() {
  const [tab, setTab] = useState<Tab>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [form, setForm] = useState<BookingForm>({ customer: '', phone: '', date: 'امروز', time: '11:00', service: services[0].title, staff: staff[0].name, note: '' });

  useEffect(() => {
    let active = true;
    fetch('/api/session')
      .then((response) => {
        if (!response.ok) {
          window.location.replace('/login');
          return;
        }
        if (active) setSessionReady(true);
      })
      .catch(() => {
        if (active) setSessionReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('ai-panel-booking-demo');
      if (saved) {
        const parsed = JSON.parse(saved) as Appointment[];
        if (Array.isArray(parsed) && parsed.length) setAppointments(parsed);
      }
    } catch {
      // Demo persistence is intentionally best-effort.
    }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem('ai-panel-booking-demo', JSON.stringify(appointments)); } catch { /* ignore */ }
  }, [appointments]);

  const todayAppointments = appointments.filter((item) => item.date === 'امروز');
  const confirmedToday = todayAppointments.filter((item) => item.status === 'CONFIRMED' || item.status === 'DONE');
  const todayRevenue = confirmedToday.reduce((sum, item) => sum + item.amount, 0);
  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return appointments;
    return appointments.filter((item) => `${item.customer} ${item.phone} ${item.service} ${item.staff}`.toLowerCase().includes(query));
  }, [appointments, search]);

  function changeStatus(id: string, status: AppointmentStatus) {
    setAppointments((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  }

  function submitBooking(event: FormEvent) {
    event.preventDefault();
    const selectedService = services.find((item) => item.title === form.service) ?? services[0];
    setAppointments((items) => [{
      id: `a-${Date.now()}`,
      date: form.date,
      time: form.time,
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      service: form.service,
      staff: form.staff,
      duration: selectedService.duration,
      amount: selectedService.price,
      status: 'CONFIRMED',
      note: form.note.trim(),
    }, ...items]);
    setForm({ customer: '', phone: '', date: 'امروز', time: '11:00', service: services[0].title, staff: staff[0].name, note: '' });
    setModalOpen(false);
    setTab('appointments');
  }

  if (!sessionReady) {
    return <div className="bk-loading" dir="rtl"><style>{styles}</style><div className="bk-loader" /><b>AI PANEL</b><span>در حال باز کردن نوبت‌دهی...</span></div>;
  }

  return (
    <div className="bk-app" dir="rtl">
      <style>{styles}</style>
      <aside className="bk-sidebar">
        <a className="bk-brand" href="/app"><span>AP</span><div><b>AI PANEL</b><small>Appointment OS</small></div></a>
        <div className="bk-business"><div className="bk-business-logo">T</div><div><b>کسب‌وکار نمونه</b><small>شعبه مرکزی</small></div><em>⌄</em></div>
        <nav>
          <small>نوبت‌دهی</small>
          {navItems.map((item) => <button key={item.key} type="button" className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)}><i>{item.icon}</i><span>{item.label}</span>{item.key === 'appointments' && <em>{fa.format(todayAppointments.length)}</em>}</button>)}
        </nav>
        <div className="bk-sidebar-foot"><div><span className="bk-online" /><div><b>سیستم آنلاین</b><small>همه سرویس‌ها فعال</small></div></div><a href="/app">← بازگشت به پنل اصلی</a></div>
      </aside>

      <main className="bk-main">
        <header className="bk-topbar">
          <div><button className="bk-mobile-home" onClick={() => window.location.assign('/app')}>AP</button><span>{currentDateLabel()}</span></div>
          <div className="bk-top-actions"><label className="bk-search">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی مشتری یا نوبت..." /></label><button className="bk-icon-btn" type="button">◌<b>2</b></button><button className="bk-primary" type="button" onClick={() => setModalOpen(true)}>＋ ثبت نوبت جدید</button></div>
        </header>

        <div className="bk-content">
          {tab === 'overview' && <Overview appointments={todayAppointments} revenue={todayRevenue} onNew={() => setModalOpen(true)} onOpenCalendar={() => setTab('calendar')} changeStatus={changeStatus} />}
          {tab === 'calendar' && <CalendarView />}
          {tab === 'appointments' && <AppointmentsView appointments={filteredAppointments} search={search} setSearch={setSearch} changeStatus={changeStatus} onNew={() => setModalOpen(true)} />}
          {tab === 'customers' && <CustomersView appointments={appointments} />}
          {tab === 'services' && <ServicesView />}
          {tab === 'staff' && <StaffView />}
          {tab === 'settings' && <SettingsView />}
        </div>
      </main>

      {modalOpen && <BookingModal form={form} setForm={setForm} close={() => setModalOpen(false)} submit={submitBooking} />}
    </div>
  );
}

function Overview({ appointments, revenue, onNew, onOpenCalendar, changeStatus }: { appointments: Appointment[]; revenue: number; onNew: () => void; onOpenCalendar: () => void; changeStatus: (id: string, status: AppointmentStatus) => void }) {
  const active = appointments.filter((item) => item.status !== 'CANCELLED');
  const pending = appointments.filter((item) => item.status === 'PENDING').length;
  return <>
    <section className="bk-title-row"><div><span className="bk-kicker">داشبورد روزانه</span><h1>سلام، روز کاری آماده است.</h1><p>نوبت‌ها، درآمد و وضعیت تیم را از همین‌جا کنترل کن.</p></div><div className="bk-title-actions"><button className="bk-secondary" onClick={onOpenCalendar}>مشاهده تقویم</button><button className="bk-primary" onClick={onNew}>＋ نوبت جدید</button></div></section>

    <section className="bk-metrics">
      <Metric icon="◷" label="نوبت امروز" value={fa.format(active.length)} note={`${fa.format(pending)} مورد در انتظار تأیید`} trend="+۱۲٪ این هفته" />
      <Metric icon="✓" label="انجام‌شده" value={fa.format(appointments.filter((item) => item.status === 'DONE').length)} note="از برنامه امروز" trend="نرخ حضور ۹۲٪" />
      <Metric icon="◈" label="درآمد امروز" value={money(revenue)} note="براساس نوبت‌های تأییدشده" trend="+۸٪ نسبت به دیروز" />
      <Metric icon="◎" label="مشتری جدید" value="۷" note="در ۷ روز اخیر" trend="۳۱ مشتری فعال" />
    </section>

    <section className="bk-dashboard-grid">
      <article className="bk-card bk-schedule-card">
        <div className="bk-card-head"><div><span className="bk-kicker">برنامه امروز</span><h2>نوبت‌های پیشِ رو</h2></div><button onClick={onOpenCalendar}>تقویم کامل ←</button></div>
        <div className="bk-timeline">
          {appointments.length === 0 ? <Empty text="برای امروز نوبتی ثبت نشده است." /> : appointments.slice(0, 5).map((item) => <AppointmentRow key={item.id} item={item} changeStatus={changeStatus} compact />)}
        </div>
      </article>

      <article className="bk-card bk-side-summary">
        <div className="bk-card-head"><div><span className="bk-kicker">ظرفیت</span><h2>امروز تیم</h2></div><span className="bk-soft-pill">۷۱٪ پر</span></div>
        <div className="bk-capacity-ring"><div><strong>۷۱٪</strong><span>رزرو شده</span></div></div>
        <div className="bk-team-mini">{staff.map((member) => <div key={member.id}><i>{member.initials}</i><span><b>{member.name}</b><small>{fa.format(member.today)} نوبت امروز</small></span><em>{fa.format(member.utilization)}٪</em></div>)}</div>
        <button className="bk-secondary full" onClick={onOpenCalendar}>مدیریت ظرفیت و ساعات کاری</button>
      </article>
    </section>

    <section className="bk-bottom-grid">
      <article className="bk-card"><div className="bk-card-head"><div><span className="bk-kicker">هفته جاری</span><h2>تعداد نوبت‌ها</h2></div><span className="bk-soft-pill">۲۶ نوبت</span></div><div className="bk-bars">{weekDays.map((day, index) => <div key={day.key}><span style={{ height: `${18 + day.count * 10 + (index % 2) * 5}px` }} /><b>{day.title.slice(0, 1)}</b></div>)}</div></article>
      <article className="bk-card"><div className="bk-card-head"><div><span className="bk-kicker">عملکرد</span><h2>خدمات پرفروش</h2></div><button>گزارش کامل ←</button></div><div className="bk-service-rank">{services.slice(0, 3).map((service, index) => <div key={service.id}><i style={{ background: service.color }}>{index + 1}</i><span><b>{service.title}</b><small>{fa.format(9 - index * 2)} رزرو این هفته</small></span><strong>{money(service.price)}</strong></div>)}</div></article>
    </section>
  </>;
}

function Metric({ icon, label, value, note, trend }: { icon: string; label: string; value: string; note: string; trend: string }) {
  return <article className="bk-card bk-metric"><div className="bk-metric-top"><i>{icon}</i><span>{trend}</span></div><small>{label}</small><strong>{value}</strong><p>{note}</p></article>;
}

function CalendarView() {
  const times = ['۰۹:۰۰', '۱۰:۰۰', '۱۱:۰۰', '۱۲:۰۰', '۱۳:۰۰', '۱۴:۰۰', '۱۵:۰۰', '۱۶:۰۰'];
  return <>
    <section className="bk-title-row"><div><span className="bk-kicker">تقویم کاری</span><h1>برنامه هفتگی</h1><p>ظرفیت خالی، نوبت‌ها و برنامه پرسنل در یک نمای واحد.</p></div><div className="bk-title-actions"><button className="bk-secondary">امروز</button><button className="bk-secondary">‹</button><button className="bk-secondary">›</button></div></section>
    <article className="bk-card bk-calendar-shell">
      <div className="bk-calendar-head"><div className="bk-time-head">ساعت</div>{weekDays.map((day) => <div key={day.key} className={day.today ? 'today' : ''}><span>{day.title}</span><b>{day.day}</b><small>{day.count ? `${fa.format(day.count)} نوبت` : 'تعطیل'}</small></div>)}</div>
      <div className="bk-calendar-grid">
        <div className="bk-time-col">{times.map((time) => <div key={time}>{time}</div>)}</div>
        {weekDays.map((day, dayIndex) => <div key={day.key} className={`bk-day-col ${day.today ? 'today' : ''}`}>{times.map((time) => <div key={time} className="bk-slot" />)}{calendarBlocks.filter((block) => block.day === dayIndex).map((block, index) => <div key={`${day.key}-${index}`} className={`bk-event ${block.tone}`} style={{ top: `${block.start * 62 + 8}px`, height: `${block.span * 62 - 10}px` }}><b>{block.label}</b><small>{times[block.start]}</small></div>)}</div>)}
      </div>
    </article>
  </>;
}

function AppointmentsView({ appointments, search, setSearch, changeStatus, onNew }: { appointments: Appointment[]; search: string; setSearch: (value: string) => void; changeStatus: (id: string, status: AppointmentStatus) => void; onNew: () => void }) {
  return <>
    <section className="bk-title-row"><div><span className="bk-kicker">مدیریت نوبت‌ها</span><h1>همه نوبت‌ها</h1><p>جست‌وجو، تأیید، تکمیل یا لغو نوبت‌ها.</p></div><button className="bk-primary" onClick={onNew}>＋ ثبت نوبت جدید</button></section>
    <article className="bk-card bk-table-card">
      <div className="bk-table-toolbar"><label className="bk-search wide">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="نام، شماره تماس، خدمت یا پرسنل..." /></label><div><button className="bk-filter active">همه</button><button className="bk-filter">امروز</button><button className="bk-filter">تأییدشده</button><button className="bk-filter">در انتظار</button></div></div>
      <div className="bk-appointment-list">{appointments.length === 0 ? <Empty text="موردی مطابق جست‌وجو پیدا نشد." /> : appointments.map((item) => <AppointmentRow key={item.id} item={item} changeStatus={changeStatus} />)}</div>
    </article>
  </>;
}

function AppointmentRow({ item, changeStatus, compact = false }: { item: Appointment; changeStatus: (id: string, status: AppointmentStatus) => void; compact?: boolean }) {
  return <div className={`bk-appt-row ${compact ? 'compact' : ''}`}>
    <div className="bk-appt-time"><b>{item.time}</b><small>{item.date}</small></div>
    <div className="bk-avatar">{item.customer.slice(0, 1)}</div>
    <div className="bk-appt-person"><b>{item.customer}</b><small>{item.phone}</small></div>
    <div className="bk-appt-service"><b>{item.service}</b><small>{fa.format(item.duration)} دقیقه · {item.staff}</small></div>
    {!compact && <strong className="bk-appt-price">{money(item.amount)}</strong>}
    <span className={`bk-status ${item.status.toLowerCase()}`}>{statusLabel[item.status]}</span>
    <div className="bk-row-actions"><button title="تأیید" onClick={() => changeStatus(item.id, item.status === 'DONE' ? 'CONFIRMED' : 'DONE')}>✓</button><button title="لغو" onClick={() => changeStatus(item.id, 'CANCELLED')}>×</button></div>
  </div>;
}

function CustomersView({ appointments }: { appointments: Appointment[] }) {
  const customers = Array.from(new Map(appointments.map((item) => [item.phone, item])).values());
  return <><section className="bk-title-row"><div><span className="bk-kicker">CRM مشتریان</span><h1>مشتریان</h1><p>سوابق رزرو، میزان خرید و آخرین مراجعه هر مشتری.</p></div><button className="bk-secondary">＋ مشتری جدید</button></section><section className="bk-customer-grid">{customers.map((item, index) => <article className="bk-card bk-customer" key={item.phone}><div><i>{item.customer.slice(0, 1)}</i><span><b>{item.customer}</b><small>{item.phone}</small></span><em>•••</em></div><dl><div><dt>نوبت‌ها</dt><dd>{fa.format(index % 3 + 2)}</dd></div><div><dt>مجموع خرید</dt><dd>{money(item.amount * (index % 3 + 1))}</dd></div></dl><p>آخرین مراجعه: {item.date} · {item.service}</p><button>مشاهده پرونده مشتری ←</button></article>)}</section></>;
}

function ServicesView() {
  return <><section className="bk-title-row"><div><span className="bk-kicker">کاتالوگ خدمات</span><h1>خدمات و قیمت‌ها</h1><p>مدت زمان، قیمت، بیعانه و ظرفیت هر خدمت را مدیریت کن.</p></div><button className="bk-primary">＋ خدمت جدید</button></section><section className="bk-service-grid">{services.map((service, index) => <article className="bk-card bk-service-card" key={service.id}><div><i style={{ background: service.color }}>◇</i><span className="bk-status confirmed">فعال</span></div><h2>{service.title}</h2><p>خدمت قابل رزرو آنلاین با زمان‌بندی خودکار و فاصله بین نوبت‌ها.</p><dl><div><dt>مدت</dt><dd>{fa.format(service.duration)} دقیقه</dd></div><div><dt>قیمت</dt><dd>{money(service.price)}</dd></div><div><dt>بیعانه</dt><dd>{index % 2 ? '۳۰٪' : 'بدون بیعانه'}</dd></div></dl><button className="bk-secondary full">ویرایش تنظیمات</button></article>)}</section></>;
}

function StaffView() {
  return <><section className="bk-title-row"><div><span className="bk-kicker">تیم و شیفت‌ها</span><h1>پرسنل</h1><p>ساعت کاری، مرخصی، خدمات قابل ارائه و ظرفیت هر نفر.</p></div><button className="bk-primary">＋ افزودن پرسنل</button></section><section className="bk-staff-grid">{staff.map((member) => <article className="bk-card bk-staff-card" key={member.id}><div className="bk-staff-head"><i>{member.initials}</i><span><b>{member.name}</b><small>{member.role}</small></span><em className="bk-status confirmed">فعال</em></div><div className="bk-progress"><div><span>ظرفیت امروز</span><b>{fa.format(member.utilization)}٪</b></div><i><span style={{ width: `${member.utilization}%` }} /></i></div><dl><div><dt>نوبت امروز</dt><dd>{fa.format(member.today)}</dd></div><div><dt>شیفت</dt><dd>۹:۰۰ تا ۱۸:۰۰</dd></div></dl><button className="bk-secondary full">برنامه و دسترسی‌ها</button></article>)}</section></>;
}

function SettingsView() {
  return <><section className="bk-title-row"><div><span className="bk-kicker">تنظیمات نوبت‌دهی</span><h1>قوانین رزرو</h1><p>قوانین زمان‌بندی، پیام‌های یادآوری و صفحه رزرو عمومی.</p></div><button className="bk-primary">ذخیره تغییرات</button></section><section className="bk-settings-grid"><article className="bk-card bk-settings-card"><h2>صفحه رزرو آنلاین</h2><p>یک لینک اختصاصی برای رزرو مستقیم مشتریان.</p><label>آدرس صفحه رزرو<div className="bk-copy-field"><input value="booking.ai-panel.ir/demo" readOnly dir="ltr"/><button>کپی</button></div></label><Toggle title="نمایش قیمت خدمات" text="قیمت هر خدمت در مرحله انتخاب نمایش داده شود." defaultOn/><Toggle title="رزرو بدون حساب کاربری" text="مشتری فقط با شماره موبایل بتواند نوبت بگیرد." defaultOn/></article><article className="bk-card bk-settings-card"><h2>قوانین زمان‌بندی</h2><label>فاصله بین دو نوبت<select defaultValue="15"><option value="0">بدون فاصله</option><option value="10">۱۰ دقیقه</option><option value="15">۱۵ دقیقه</option><option value="30">۳۰ دقیقه</option></select></label><label>حداقل زمان رزرو قبل از نوبت<select defaultValue="2"><option value="1">۱ ساعت</option><option value="2">۲ ساعت</option><option value="24">۲۴ ساعت</option></select></label><Toggle title="اجازه لغو توسط مشتری" text="مشتری تا ۶ ساعت قبل بتواند نوبت را لغو کند." defaultOn/></article><article className="bk-card bk-settings-card"><h2>یادآوری خودکار</h2><Toggle title="پیامک تأیید رزرو" text="بلافاصله بعد از ثبت نوبت ارسال شود." defaultOn/><Toggle title="یادآوری ۲۴ ساعت قبل" text="برای کاهش فراموشی و کنسلی نوبت‌ها." defaultOn/><Toggle title="یادآوری واتساپ" text="ارسال پیام واتساپ در صورت اتصال سرویس." /></article><article className="bk-card bk-settings-card"><h2>پرداخت و بیعانه</h2><Toggle title="دریافت بیعانه آنلاین" text="رزرو پس از پرداخت بیعانه قطعی شود."/><label>مهلت پرداخت<select defaultValue="15"><option value="10">۱۰ دقیقه</option><option value="15">۱۵ دقیقه</option><option value="30">۳۰ دقیقه</option></select></label><button className="bk-secondary full">اتصال درگاه پرداخت</button></article></section></>;
}

function Toggle({ title, text, defaultOn = false }: { title: string; text: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return <button className="bk-toggle-row" type="button" onClick={() => setOn((value) => !value)}><span><b>{title}</b><small>{text}</small></span><i className={on ? 'on' : ''}><em /></i></button>;
}

function BookingModal({ form, setForm, close, submit }: { form: BookingForm; setForm: (form: BookingForm) => void; close: () => void; submit: (event: FormEvent) => void }) {
  return <div className="bk-modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}><form className="bk-modal" onSubmit={submit}><div className="bk-modal-head"><div><span className="bk-kicker">ثبت سریع</span><h2>نوبت جدید</h2></div><button type="button" onClick={close}>×</button></div><div className="bk-form-grid"><label>نام مشتری<input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} required placeholder="مثلاً نازنین محمدی"/></label><label>شماره موبایل<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required dir="ltr" placeholder="09xx xxx xxxx"/></label><label>روز<select value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })}><option>امروز</option><option>فردا</option><option>پس‌فردا</option></select></label><label>ساعت<input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required dir="ltr"/></label><label>خدمت<select value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>{services.map((service) => <option key={service.id}>{service.title}</option>)}</select></label><label>پرسنل<select value={form.staff} onChange={(event) => setForm({ ...form, staff: event.target.value })}>{staff.map((member) => <option key={member.id}>{member.name}</option>)}</select></label><label className="wide">یادداشت<textarea rows={3} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="توضیحات اختیاری..."/></label></div><div className="bk-modal-actions"><button type="button" className="bk-secondary" onClick={close}>انصراف</button><button className="bk-primary">ثبت و تأیید نوبت</button></div></form></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="bk-empty"><i>◌</i><span>{text}</span></div>;
}

const styles = `
*{box-sizing:border-box}.bk-app{--bg:#f5f7fb;--panel:#fff;--ink:#152033;--muted:#778399;--line:#e8ecf3;--brand:#6257ee;--brand2:#7c6ff4;--green:#13a878;min-height:100vh;background:var(--bg);color:var(--ink);font-family:Inter,Vazirmatn,Tahoma,Arial,sans-serif}.bk-app button,.bk-app input,.bk-app select,.bk-app textarea{font:inherit}.bk-sidebar{position:fixed;right:0;top:0;bottom:0;width:238px;background:#101827;color:#fff;padding:22px 16px;z-index:30;display:flex;flex-direction:column}.bk-brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none;padding:0 7px 21px}.bk-brand>span{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#8578ff,#5b4de5);font:900 13px/1 Inter}.bk-brand div{display:flex;flex-direction:column;gap:2px}.bk-brand b{font-size:13px;letter-spacing:.05em}.bk-brand small{font-size:9px;color:#8290a5}.bk-business{display:flex;align-items:center;gap:9px;padding:11px;border:1px solid #273348;background:#182235;border-radius:12px;margin-bottom:22px}.bk-business-logo{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:#e9e6ff;color:#5146c9;font-weight:900}.bk-business div:nth-child(2){min-width:0;display:flex;flex:1;flex-direction:column}.bk-business b{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bk-business small{font-size:9px;color:#7f8ba0;margin-top:3px}.bk-business em{font-style:normal;color:#8490a4}.bk-sidebar nav{display:flex;flex-direction:column;gap:4px}.bk-sidebar nav>small{font-size:9px;color:#67758b;padding:0 11px 7px}.bk-sidebar nav button{display:flex;align-items:center;gap:11px;width:100%;border:0;background:transparent;color:#8793a7;padding:10px 11px;border-radius:10px;cursor:pointer;text-align:right;font-size:11px;font-weight:700}.bk-sidebar nav button:hover{background:#182235;color:#fff}.bk-sidebar nav button.active{background:linear-gradient(135deg,#6658ee,#5a4dd7);color:#fff;box-shadow:0 9px 24px rgba(92,78,221,.22)}.bk-sidebar nav button i{width:20px;text-align:center;font-style:normal;font-size:14px}.bk-sidebar nav button span{flex:1}.bk-sidebar nav button em{font-style:normal;background:rgba(255,255,255,.13);padding:2px 6px;border-radius:99px;font-size:9px}.bk-sidebar-foot{margin-top:auto;border-top:1px solid #243044;padding-top:15px}.bk-sidebar-foot>div{display:flex;align-items:center;gap:8px;margin-bottom:12px}.bk-sidebar-foot>div>div{display:flex;flex-direction:column}.bk-sidebar-foot b{font-size:9px}.bk-sidebar-foot small{font-size:8px;color:#68768b;margin-top:2px}.bk-online{width:8px;height:8px;border-radius:50%;background:#26d99d;box-shadow:0 0 0 4px rgba(38,217,157,.1)}.bk-sidebar-foot>a{font-size:9px;color:#8793a7;text-decoration:none}.bk-main{margin-right:238px;min-height:100vh}.bk-topbar{height:70px;background:rgba(255,255,255,.92);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:20;backdrop-filter:blur(14px)}.bk-topbar>div:first-child{display:flex;align-items:center;gap:10px;color:#7c8798;font-size:10px}.bk-mobile-home{display:none}.bk-top-actions{display:flex;align-items:center;gap:8px}.bk-search{height:36px;width:240px;border:1px solid var(--line);border-radius:10px;background:#f8fafc;display:flex;align-items:center;gap:7px;padding:0 10px;color:#9ba5b5}.bk-search input{border:0;outline:0;background:transparent;min-width:0;width:100%;font-size:10px;color:var(--ink)}.bk-icon-btn{position:relative;width:36px;height:36px;border:1px solid var(--line);background:#fff;border-radius:10px;color:#5f6b7b;cursor:pointer}.bk-icon-btn b{position:absolute;top:-5px;left:-4px;background:#ef4f70;color:#fff;width:15px;height:15px;border-radius:50%;font-size:8px;display:grid;place-items:center}.bk-primary,.bk-secondary{border-radius:10px;padding:9px 13px;font-size:10px;font-weight:800;cursor:pointer}.bk-primary{border:1px solid #5a4fdf;background:linear-gradient(135deg,#6d61ef,#584bd5);color:#fff;box-shadow:0 8px 20px rgba(89,75,216,.18)}.bk-secondary{border:1px solid var(--line);background:#fff;color:#536074}.bk-primary:hover{filter:brightness(1.04)}.bk-secondary:hover{background:#f8f9fc}.bk-content{padding:26px 28px 100px;max-width:1500px;margin:auto}.bk-title-row{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:23px}.bk-title-row h1{font-size:25px;line-height:1.35;margin:5px 0 5px;letter-spacing:-.02em}.bk-title-row p{margin:0;color:var(--muted);font-size:10px}.bk-kicker{display:block;color:#7367e9;font-size:9px;font-weight:900}.bk-title-actions{display:flex;gap:8px}.bk-card{background:var(--panel);border:1px solid var(--line);border-radius:15px;box-shadow:0 5px 18px rgba(23,35,57,.025)}.bk-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:14px}.bk-metric{padding:16px}.bk-metric-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px}.bk-metric-top i{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#f0eeff;color:#6358e6;font-style:normal;font-size:15px}.bk-metric-top span{font-size:8px;color:#12a574;background:#eafaf4;border-radius:99px;padding:4px 7px}.bk-metric>small{display:block;color:#7e899b;font-size:9px;margin-bottom:7px}.bk-metric>strong{display:block;font-size:20px;letter-spacing:-.02em}.bk-metric>p{margin:5px 0 0;color:#98a1af;font-size:8px}.bk-dashboard-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(280px,.65fr);gap:14px;margin-bottom:14px}.bk-card-head{display:flex;justify-content:space-between;align-items:center;padding:16px 17px 13px}.bk-card-head h2{font-size:13px;margin:4px 0 0}.bk-card-head button{border:0;background:transparent;color:#665add;font-weight:800;font-size:9px;cursor:pointer}.bk-soft-pill{font-size:8px;color:#6458dc;background:#f0eeff;border-radius:99px;padding:5px 8px}.bk-timeline{padding:0 12px 11px}.bk-appt-row{display:grid;grid-template-columns:70px 34px minmax(110px,1fr) minmax(160px,1.2fr) 110px 82px 58px;align-items:center;gap:9px;padding:11px 8px;border-top:1px solid #f0f2f6}.bk-appt-row.compact{grid-template-columns:62px 32px minmax(95px,1fr) minmax(130px,1.15fr) 78px 58px}.bk-appt-time{display:flex;flex-direction:column}.bk-appt-time b{font-size:11px}.bk-appt-time small,.bk-appt-person small,.bk-appt-service small{font-size:8px;color:#97a0ae;margin-top:3px}.bk-avatar{display:grid;place-items:center;width:31px;height:31px;background:#eef0ff;color:#6155df;border-radius:9px;font-weight:900;font-size:10px}.bk-appt-person,.bk-appt-service{min-width:0;display:flex;flex-direction:column}.bk-appt-person b,.bk-appt-service b{font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bk-appt-price{font-size:9px;white-space:nowrap}.bk-status{justify-self:start;border-radius:99px;padding:5px 8px;font-size:8px;font-weight:800;white-space:nowrap}.bk-status.confirmed{background:#eafaf4;color:#0b9267}.bk-status.pending{background:#fff7df;color:#a96e00}.bk-status.done{background:#eef1f5;color:#6e7887}.bk-status.cancelled{background:#fff0f1;color:#d84c60}.bk-row-actions{display:flex;gap:4px}.bk-row-actions button{width:25px;height:25px;border:1px solid var(--line);border-radius:7px;background:#fff;color:#778294;cursor:pointer}.bk-row-actions button:first-child:hover{border-color:#20b987;color:#0c9c6e}.bk-row-actions button:last-child:hover{border-color:#ef8090;color:#d9475b}.bk-side-summary{padding-bottom:13px}.bk-capacity-ring{width:126px;height:126px;margin:4px auto 15px;border-radius:50%;background:conic-gradient(#6659e5 0 71%,#edf0f5 71%);display:grid;place-items:center}.bk-capacity-ring:before{content:"";position:absolute}.bk-capacity-ring>div{width:94px;height:94px;background:#fff;border-radius:50%;display:grid;place-content:center;text-align:center}.bk-capacity-ring strong{font-size:21px}.bk-capacity-ring span{font-size:8px;color:#8a95a5;margin-top:3px}.bk-team-mini{padding:0 15px}.bk-team-mini>div{display:flex;align-items:center;gap:8px;padding:9px 0;border-top:1px solid #f1f3f6}.bk-team-mini i{width:29px;height:29px;border-radius:8px;background:#eef0ff;color:#6256df;display:grid;place-items:center;font-style:normal;font-size:8px;font-weight:900}.bk-team-mini span{display:flex;flex:1;flex-direction:column}.bk-team-mini b{font-size:9px}.bk-team-mini small{font-size:8px;color:#96a0ae;margin-top:3px}.bk-team-mini em{font-size:8px;font-style:normal;color:#667185}.full{width:calc(100% - 30px);margin:8px 15px 0}.bk-bottom-grid{display:grid;grid-template-columns:1fr 1.25fr;gap:14px}.bk-bars{height:150px;display:flex;align-items:flex-end;justify-content:space-around;padding:18px 20px}.bk-bars>div{height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:7px}.bk-bars span{width:22px;min-height:14px;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,#7669ee,#b8b1ff)}.bk-bars b{font-size:8px;color:#8e98a8}.bk-service-rank{padding:0 16px 11px}.bk-service-rank>div{display:flex;align-items:center;gap:10px;padding:11px 0;border-top:1px solid #f0f2f5}.bk-service-rank i{width:27px;height:27px;border-radius:8px;color:#fff;display:grid;place-items:center;font-style:normal;font-weight:900;font-size:9px}.bk-service-rank span{display:flex;flex:1;flex-direction:column}.bk-service-rank b{font-size:9px}.bk-service-rank small{font-size:8px;color:#98a1af;margin-top:3px}.bk-service-rank strong{font-size:9px}.bk-calendar-shell{overflow:auto}.bk-calendar-head{min-width:920px;display:grid;grid-template-columns:70px repeat(7,1fr);border-bottom:1px solid var(--line)}.bk-calendar-head>div{padding:12px 8px;text-align:center;border-left:1px solid #f0f2f5}.bk-calendar-head>div.today{background:#f3f1ff}.bk-calendar-head span{display:block;font-size:8px;color:#8691a2}.bk-calendar-head b{display:block;font-size:15px;margin:4px 0}.bk-calendar-head small{font-size:7px;color:#a0a8b5}.bk-time-head{display:grid!important;place-items:center;color:#919bab;font-size:8px}.bk-calendar-grid{min-width:920px;display:grid;grid-template-columns:70px repeat(7,1fr);position:relative}.bk-time-col>div,.bk-slot{height:62px;border-bottom:1px solid #f0f2f5}.bk-time-col>div{padding:9px 8px;color:#98a1af;font-size:8px;text-align:left}.bk-day-col{position:relative;border-left:1px solid #f0f2f5}.bk-day-col.today{background:#fbfaff}.bk-event{position:absolute;right:6px;left:6px;border-radius:8px;padding:7px;overflow:hidden;border-right:3px solid}.bk-event b{display:block;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bk-event small{font-size:7px;opacity:.65}.bk-event.purple{background:#eeecff;color:#5549cc;border-color:#6659e5}.bk-event.green{background:#e8faf3;color:#087d59;border-color:#11aa78}.bk-event.pink{background:#fff0f7;color:#b73c75;border-color:#e55293}.bk-event.amber{background:#fff7e4;color:#9c6806;border-color:#e8a520}.bk-table-card{overflow:hidden}.bk-table-toolbar{padding:13px 15px;display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid var(--line)}.bk-search.wide{width:min(340px,100%)}.bk-table-toolbar>div{display:flex;gap:4px}.bk-filter{border:1px solid var(--line);background:#fff;color:#7c8798;border-radius:8px;padding:8px 10px;font-size:8px;cursor:pointer}.bk-filter.active{background:#101827;color:#fff;border-color:#101827}.bk-appointment-list{padding:0 10px 10px}.bk-customer-grid,.bk-service-grid,.bk-staff-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.bk-customer,.bk-service-card,.bk-staff-card{padding:15px}.bk-customer>div:first-child{display:flex;align-items:center;gap:9px}.bk-customer>div:first-child i,.bk-staff-head>i{width:36px;height:36px;border-radius:10px;background:#eeecff;color:#5e52db;display:grid;place-items:center;font-style:normal;font-size:11px;font-weight:900}.bk-customer>div:first-child span,.bk-staff-head>span{display:flex;flex:1;flex-direction:column}.bk-customer b,.bk-staff-head b{font-size:10px}.bk-customer small,.bk-staff-head small{font-size:8px;color:#96a0af;margin-top:3px}.bk-customer em{font-style:normal;color:#9ca5b2}.bk-customer dl,.bk-service-card dl,.bk-staff-card dl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0}.bk-customer dl>div,.bk-service-card dl>div,.bk-staff-card dl>div{background:#f8f9fc;border-radius:9px;padding:9px}.bk-customer dt,.bk-service-card dt,.bk-staff-card dt{font-size:7px;color:#98a1af}.bk-customer dd,.bk-service-card dd,.bk-staff-card dd{font-size:8px;font-weight:800;margin:4px 0 0}.bk-customer>p{font-size:8px;color:#8893a3;border-top:1px solid var(--line);padding-top:11px}.bk-customer>button{width:100%;border:0;background:transparent;color:#6256de;font-size:8px;font-weight:800;cursor:pointer;text-align:right;padding:5px 0}.bk-service-card>div:first-child{display:flex;justify-content:space-between;align-items:center}.bk-service-card>div:first-child i{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;color:#fff;font-style:normal}.bk-service-card h2{font-size:13px;margin:15px 0 5px}.bk-service-card p{font-size:8px;line-height:1.8;color:#8994a4}.bk-service-card dl{grid-template-columns:repeat(3,1fr)}.bk-staff-head{display:flex;align-items:center;gap:9px}.bk-progress{margin:17px 0}.bk-progress>div{display:flex;justify-content:space-between;font-size:8px;margin-bottom:7px}.bk-progress>i{height:6px;background:#edf0f5;border-radius:99px;display:block;overflow:hidden}.bk-progress>i>span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#675ae8,#8e84f4)}.bk-settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.bk-settings-card{padding:17px}.bk-settings-card h2{font-size:13px;margin:0 0 5px}.bk-settings-card>p{font-size:8px;color:#929cab;margin:0 0 16px}.bk-settings-card label{display:block;font-size:8px;font-weight:800;margin-top:13px}.bk-settings-card label>select{display:block;width:100%;margin-top:6px;border:1px solid var(--line);border-radius:9px;padding:9px;background:#fff;color:#4f5d70;font-size:9px}.bk-copy-field{display:flex;margin-top:6px}.bk-copy-field input{flex:1;border:1px solid var(--line);border-left:0;border-radius:0 9px 9px 0;padding:9px;background:#f9fafc;font-size:8px}.bk-copy-field button{border:1px solid var(--line);border-radius:9px 0 0 9px;background:#fff;color:#6256df;font-size:8px;font-weight:800}.bk-toggle-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;border-top:1px solid #f0f2f5;background:transparent;padding:12px 0;text-align:right;cursor:pointer}.bk-toggle-row>span{display:flex;flex-direction:column}.bk-toggle-row b{font-size:9px}.bk-toggle-row small{font-size:7px;color:#929cab;margin-top:4px}.bk-toggle-row>i{width:34px;height:19px;border-radius:99px;background:#d8dde6;padding:2px;transition:.2s}.bk-toggle-row>i em{display:block;width:15px;height:15px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.12);transition:.2s}.bk-toggle-row>i.on{background:#675ae7}.bk-toggle-row>i.on em{transform:translateX(-15px)}.bk-modal-backdrop{position:fixed;inset:0;background:rgba(14,22,35,.58);z-index:120;display:grid;place-items:center;padding:20px;backdrop-filter:blur(5px)}.bk-modal{width:min(620px,100%);background:#fff;border-radius:18px;box-shadow:0 30px 100px rgba(0,0,0,.25);padding:20px}.bk-modal-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}.bk-modal-head h2{margin:4px 0 0;font-size:20px}.bk-modal-head>button{width:32px;height:32px;border:1px solid var(--line);background:#fff;border-radius:9px;color:#7d8796;font-size:18px;cursor:pointer}.bk-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.bk-form-grid label{font-size:8px;font-weight:800}.bk-form-grid label.wide{grid-column:1/-1}.bk-form-grid input,.bk-form-grid select,.bk-form-grid textarea{display:block;width:100%;margin-top:6px;border:1px solid var(--line);border-radius:9px;padding:10px;background:#fbfcfd;outline:0;color:#334055;font-size:10px}.bk-form-grid input:focus,.bk-form-grid select:focus,.bk-form-grid textarea:focus{border-color:#8d83ee;box-shadow:0 0 0 3px rgba(103,90,231,.08)}.bk-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.bk-empty{min-height:120px;display:grid;place-content:center;justify-items:center;gap:6px;color:#9aa4b2;font-size:9px}.bk-empty i{font-style:normal;font-size:20px;color:#c1c8d2}.bk-loading{min-height:100vh;background:#101827;color:#fff;display:grid;place-content:center;justify-items:center;gap:8px;font-family:Inter,Vazirmatn,Tahoma,sans-serif}.bk-loading b{font-size:13px}.bk-loading span{font-size:9px;color:#7f8ba0}.bk-loader{width:26px;height:26px;border-radius:50%;border:3px solid #273249;border-top-color:#786bf0;animation:bkSpin .8s linear infinite}@keyframes bkSpin{to{transform:rotate(360deg)}}
@media(max-width:1150px){.bk-metrics{grid-template-columns:1fr 1fr}.bk-dashboard-grid{grid-template-columns:1fr}.bk-customer-grid,.bk-service-grid,.bk-staff-grid{grid-template-columns:1fr 1fr}.bk-appt-row{grid-template-columns:60px 30px 1fr 1.2fr 82px 55px}.bk-appt-price{display:none}}
@media(max-width:820px){.bk-sidebar{display:none}.bk-main{margin-right:0}.bk-topbar{padding:0 12px;height:62px}.bk-mobile-home{display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:10px;background:#101827;color:#fff;font-weight:900}.bk-topbar>div:first-child>span{display:none}.bk-search{width:180px}.bk-top-actions>.bk-icon-btn{display:none}.bk-content{padding:20px 13px 92px}.bk-title-row{align-items:flex-start}.bk-bottom-grid,.bk-settings-grid{grid-template-columns:1fr}.bk-customer-grid,.bk-service-grid,.bk-staff-grid{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.bk-topbar .bk-search{display:none}.bk-primary,.bk-secondary{padding:9px 10px}.bk-title-row{display:block}.bk-title-row h1{font-size:21px}.bk-title-actions{margin-top:12px}.bk-metrics{grid-template-columns:1fr 1fr;gap:8px}.bk-metric{padding:13px}.bk-metric>strong{font-size:16px}.bk-appt-row,.bk-appt-row.compact{grid-template-columns:52px 30px 1fr 70px;padding:10px 3px}.bk-appt-service,.bk-appt-price,.bk-row-actions{display:none}.bk-table-toolbar{display:block}.bk-table-toolbar>div{margin-top:9px;overflow:auto}.bk-customer-grid,.bk-service-grid,.bk-staff-grid{grid-template-columns:1fr}.bk-form-grid{grid-template-columns:1fr}.bk-form-grid label.wide{grid-column:auto}.bk-modal{padding:16px}.bk-modal-actions{justify-content:stretch}.bk-modal-actions button{flex:1}.bk-service-card dl{grid-template-columns:1fr 1fr}.bk-metric-top span{display:none}}
`;
