import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TelegramMenuBuilder from './TelegramMenuBuilder';
import BaleControlCenter from './BaleControlCenter';
import StoreOrders from './StoreOrders';
import InstagramControlCenter from './InstagramControlCenter';
import BookingManagerV2 from './BookingManagerV2';
import BookingBusinessTools from './BookingBusinessTools';
import BookingAutomations from './BookingAutomations';
import BookingStaffManager from './BookingStaffManager';
import BookingCustomersCRM from './BookingCustomersCRM';
import BookingFinance from './BookingFinance';
import BookingReports from './BookingReports';
import BookingStaffAccess from './BookingStaffAccess';
import BookingFeedbackManager from './BookingFeedbackManager';
import BookingLoyalty from './BookingLoyalty';
import PublicBookingPage from './PublicBookingPage';
import PublicFeedbackPage from './PublicFeedbackPage';
import CommerceQuickNav from './CommerceQuickNav';
import './styles.css';

const path = window.location.pathname;

const rootView = path.startsWith('/book/')
  ? <PublicBookingPage />
  : path.startsWith('/feedback/')
    ? <PublicFeedbackPage />
    : path === '/app/telegram-builder'
      ? <TelegramMenuBuilder />
      : path === '/app/bale'
        ? <BaleControlCenter />
        : path === '/app/orders'
          ? <StoreOrders />
          : path === '/app/instagram'
            ? <InstagramControlCenter />
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
    {rootView}
    <CommerceQuickNav />
  </React.StrictMode>,
);
