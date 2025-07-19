import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import { Toaster } from './components/ui/sonner';
import { Web3Provider } from './Web3Provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3Provider>
      <RouterProvider router={router} />
    </Web3Provider>
    <Toaster
      closeButton
      expand={false}
      position="top-center"
      richColors
      duration={3000}
    />
  </StrictMode>
);
