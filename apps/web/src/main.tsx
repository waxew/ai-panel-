import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TelegramMenuBuilder from './TelegramMenuBuilder';
import './styles.css';

const rootView = window.location.pathname === '/app/telegram-builder'
  ? <TelegramMenuBuilder />
  : <App />;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {rootView}
  </React.StrictMode>,
);
