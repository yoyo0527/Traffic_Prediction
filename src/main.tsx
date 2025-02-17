import ReactDOM from 'react-dom/client';
import { Suspense, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from './app';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const HOMEPAGE = import.meta.env.VITE_PUBLIC_URL || '';  // 使用 Vite 的環境變數
root.render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={HOMEPAGE}>
        <Suspense>
          <App />
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
