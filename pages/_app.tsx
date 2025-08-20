import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ToastProvider } from '../src/hooks/useToast';
import { ToastContainer } from '../src/components/Toast';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <Component {...pageProps} />
      <ToastContainer />
    </ToastProvider>
  );
}

