import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TelegramMenuBuilder from './TelegramMenuBuilder';
import StoreOrders from './StoreOrders';
import InstagramControlCenter from './InstagramControlCenter';
import CommerceQuickNav from './CommerceQuickNav';
import './styles.css';

const rootView = window.location.pathname === '/app/telegram-builder'
  ? <TelegramMenuBuilder />
  : window.location.pathname === '/app/orders'
    ? <StoreOrders />
    : window.location.pathname === '/app/instagram'
      ? <InstagramControlCenter />
      : <App />;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {rootView}
    <CommerceQuickNav />
  </React.StrictMode>,
);
