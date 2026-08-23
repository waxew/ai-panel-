import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CommerceQuickNav from './CommerceQuickNav';
import './styles.css';

const TelegramMenuBuilder = lazy(() => import('./TelegramMenuBuilder'));
const BaleControlCenter = lazy(() => import('./BaleControlCenter'));
const StoreOrders = lazy(() => import('./StoreOrders'));
const InstagramControlCenter = lazy(() => import('./InstagramControlCenter'));
const WhatsAppControlCenter = lazy(() => import('./WhatsAppControlCenter'));
const RubikaControlCenter = lazy(() => import('./RubikaControlCenter'));
const DiscordControlCenter = lazy(() => import('./DiscordControlCenter'));
const BookingManagerV2 = lazy(() => import('./BookingManagerV2'));
const BookingBusinessTools = lazy(() => import('./BookingBusinessTools'));
const BookingAutomations = lazy(() => import('./BookingAutomations'));
const BookingStaffManager = lazy(() => import('./BookingStaffManager'));
const BookingCustomersCRM = lazy(() => import('./BookingCustomersCRM'));
const BookingFinance = lazy(() => import('./BookingFinance'));
const BookingReports = lazy(() => import('./BookingReports'));
const BookingStaffAccess = lazy(() => import('./BookingStaffAccess'));
const BookingFeedbackManager = lazy(() => import('./BookingFeedbackManager'));
const BookingLoyalty = lazy(() => import('./BookingLoyalty'));
const BookingBusinessSiteManager = lazy(() => import('./BookingBusinessSiteManager'));
const BookingInbox = lazy(() => import('./BookingInbox'));
const PublicBookingPage = lazy(() => import('./PublicBookingPage'));
const PublicFeedbackPage = lazy(() => import('./PublicFeedbackPage'));
const PublicBusinessSite = lazy(() => import('./PublicBusinessSite'));

async function adoptImplicitAuthSession() {
  if (!window.location.hash) return;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return;

  try {
    const response = await fetch('/api/auth/adopt-session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
    });
    if (response.ok) {
      window.history.replaceState({}, '', '/app');
    } else {
      window.history.replaceState({}, '', '/login?confirmation_error=1');
    }
  } catch {
    window.history.replaceState({}, '', '/login?confirmation_error=1');
  }
}

function RouteLoading() {
  return <div dir="rtl" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#070a0f', color: '#dbe4ef', fontFamily: 'Inter, system-ui, sans-serif' }}>در حال بارگذاری ماژول...</div>;
}

async function renderApp() {
  await adoptImplicitAuthSession();
  const path = window.location.pathname;

  const rootView = path.startsWith('/book/')
    ? <PublicBookingPage />
    : path.startsWith('/feedback/')
      ? <PublicFeedbackPage />
      : path.startsWith('/site/')
        ? <PublicBusinessSite />
        : path === '/app/telegram-builder'
          ? <TelegramMenuBuilder />
          : path === '/app/bale'
            ? <BaleControlCenter />
            : path === '/app/orders'
              ? <StoreOrders />
              : path === '/app/instagram'
                ? <InstagramControlCenter />
                : path === '/app/whatsapp'
                  ? <WhatsAppControlCenter />
                  : path === '/app/rubika'
                    ? <RubikaControlCenter />
                    : path === '/app/discord'
                      ? <DiscordControlCenter />
                      : path === '/app/booking/inbox'
                        ? <BookingInbox />
                        : path === '/app/booking/automations'
                          ? <BookingAutomations />
                          : path === '/app/booking/finance'
                            ? <BookingFinance />
                            : path === '/app/booking/reports'
                              ? <BookingReports />
                              : path === '/app/booking/feedback'
                                ? <BookingFeedbackManager />
                                : path === '/app/booking/loyalty'
                                  ? <BookingLoyalty />
                                  : path === '/app/booking/site'
                                    ? <BookingBusinessSiteManager />
                                    : path === '/app/booking/staff-access'
                                      ? <BookingStaffAccess />
                                      : path === '/app/booking/customers'
                                        ? <BookingCustomersCRM />
                                        : path === '/app/booking/staff'
                                          ? <BookingStaffManager />
                                          : path === '/app/booking/tools'
                                            ? <BookingBusinessTools />
                                            : path === '/app/booking'
                                              ? <BookingManagerV2 />
                                              : <App />;

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Suspense fallback={<RouteLoading />}>{rootView}</Suspense>
      <CommerceQuickNav />
    </React.StrictMode>,
  );
}

void renderApp();
