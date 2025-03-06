import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx';
import { Provider } from "react-redux";
import { store } from "./storage/store";
import LiveUpdateProvider from './LiveUpdate/LiveUpdateProvider.tsx';
import { noticesStore } from './storage/notices-store.ts';
import NoticesManager from './NoticesManager.tsx';
import SplashScreen from './SplashScreen/SplashScreen.tsx';
import { registerSW } from 'virtual:pwa-register';
import ClientLogsService from './services/LogsService.ts';

registerSW();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={noticesStore}>
      <Provider store={store}>
        <LiveUpdateProvider>
          <SplashScreen />
        </LiveUpdateProvider>
      </Provider>
      <NoticesManager />
    </Provider>
  </StrictMode>
)

const decodeReasonAndError = (reasonOrError: string | { message: unknown, stack: unknown }): {
  message: unknown,
  stack: unknown
} => {

  try {
    const reason = {
      message: reasonOrError ?? '-',
      stack: '-',
    }

    if (reasonOrError && typeof reasonOrError != 'string') {
      if (reasonOrError?.message) {
        reason.message = reasonOrError.message as string;
      }

      if (reasonOrError?.stack) {
        reason.stack = reasonOrError.stack as string;
      }
    }
    return reason;
  } catch {
    return {
      message: reasonOrError ?? '-',
      stack: '-',
    }
  }

}

window.addEventListener('unhandledrejection', (event) => {
  const cLog = new ClientLogsService();
  cLog.report("Bakemania-spa unhandled rejection", decodeReasonAndError(event.reason))
});

window.addEventListener('error', (event) => {
  const cLog = new ClientLogsService();
  let reason: Record<string, unknown>;

  try {
    reason = {
      message: event.message,
      error: decodeReasonAndError(event.error),
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
    }
  } catch {
    reason = {
      message: "Something went wrong",
      error: event.error,
    }
  }

  cLog.report("Bakemania-spa error", reason)
});


