import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx';
import { Provider } from "react-redux";
import { store } from "./storage/store";
import LiveUpdateProvider from './LiveUpdate/LiveUpdateProvider.tsx';
import { noticesStore } from './storage/notices-store.ts';
import NoticesManager from './NoticesManager.tsx';
import SplashScreen from './views/SplashScreen/SplashScreen.tsx';
import { registerSW } from 'virtual:pwa-register';
import ClientLogsService from './services/LogsService.ts';
import SafeAreaView from './atoms/SafeAreaView/SafeAreaView.tsx';
import { BrowserRouter } from 'react-router-dom';
import Background from './atoms/Background/Background.tsx';
import Config from './config.ts';
import apiService from './services/ApiService.ts';

registerSW();

const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    token: params.get('token')
  };
};

if (window.location.pathname === '/verify-email') {
  const { token } = getQueryParams();

  createRoot(document.getElementById('root')!).render(
    <SafeAreaView>
      <Background>
        <style>{`
          .verify-email {
            width: 100%;
            max-width: 350px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 30px;
            background-color: rgba(255, 255, 255, 1);
            border-radius: 30px;
            box-shadow: 0 0 4px 4px rgba(10, 10, 10, .1);
            position: relative;
            overflow: hidden;
            padding: 30px;
            margin: 30px;
          }

          .verify-email-container {
            align-self: stretch;
          }

          .verify-email-button {
            width: 100%;
            cursor: pointer;
          }
        `}</style>
        <div className="verify-email">
          <span>
            Kliknij w przycisk poniżej,<br />aby zweryfikować swój email
          </span>
          <div className="verify-email-container">
            <button
              className="verify-email-button"
              onClick={async () => {
                if (token) {
                  window.localStorage.setItem(Config.sessionKeys.Token, token);
                  apiService.fetch('auth/verify-email', {
                    method: 'GET',
                  }).then(() => {
                    window.localStorage.removeItem(Config.sessionKeys.Token);
                    window.location.replace(window.location.origin);
                  }).catch(() => {
                    window.localStorage.removeItem(Config.sessionKeys.Token);
                  });
                  window.localStorage.removeItem(Config.sessionKeys.Token);
                }
              }}
            >
              Zweryfikuj email
            </button>
          </div>
        </div>
      </Background>
    </SafeAreaView>
  );
} else {

  createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <StrictMode>
        <Provider store={noticesStore}>
          <Provider store={store}>
            <LiveUpdateProvider>
              <SafeAreaView>
                <SplashScreen />
              </SafeAreaView>
            </LiveUpdateProvider>
          </Provider>
          <NoticesManager />
        </Provider>
      </StrictMode>
    </BrowserRouter>
  )
}

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


