import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from "react-redux";
import { noticesStore } from './storage/notices-store.ts';
import NoticesManager from './NoticesManager.tsx';
import { registerSW } from 'virtual:pwa-register';
import ClientLogsService from './services/LogsService.ts';
import SafeAreaView from './atoms/SafeAreaView/SafeAreaView.tsx';
import PathsModule from './tools/paths.ts';
import AuthEmailVerification from './components/AuthEmailVerification/AuthEmailVerification.tsx';
import App from './App.tsx';
import Background from './atoms/Background/Background.tsx';
import AuthLogin from './components/AuthLogin/AuthLogin.tsx';
import AuthSessionExpired from './components/AuthSessionExpired/AuthSessionExpired.tsx';
import AuthRegistering from './components/AuthRegistering/AuthRegistering.tsx';
import AuthRequestPasswordChange from './components/AuthRequestPasswordChange/AuthRequestPasswordChange.tsx';
import AuthChangePassword from './components/AuthChangePassword/AuthChangePassword.tsx';
;

registerSW();

let page: JSX.Element = <>Invalid path</>;

const rootElement = document.getElementById('root')!;

switch (window.location.pathname) {
  case PathsModule.Paths.EmailVerification: {
    page = (
      <Provider store={noticesStore}>
        <SafeAreaView>
          <Background>
            <AuthEmailVerification />
          </Background>
        </SafeAreaView>
        <NoticesManager />
      </Provider>
    )
    break;
  }

  case PathsModule.Paths.Login: {
    page = (
      <Provider store={noticesStore}>
        <SafeAreaView>
          <Background>
            <AuthLogin />
          </Background>
        </SafeAreaView>
        <NoticesManager />
      </Provider>
    );
    break;
  }

  case PathsModule.Paths.Register: {
    page = (
      <Provider store={noticesStore}>
        <SafeAreaView>
          <Background>
            <AuthRegistering />
          </Background>
        </SafeAreaView>
        <NoticesManager />
      </Provider>
    );
    break;
  }

  case PathsModule.Paths.SessionExpired: {
    page = (
      <SafeAreaView>
        <Background>
          <AuthSessionExpired />
        </Background>
      </SafeAreaView>
    );
    break;
  }

  case PathsModule.Paths.ForgotPassword: {
    page = (
      <StrictMode>
        <Provider store={noticesStore}>
          <SafeAreaView>
            <Background>
              <AuthRequestPasswordChange />
            </Background>
          </SafeAreaView>
          <NoticesManager />
        </Provider>
      </StrictMode>
    );
    break;
  }

  case PathsModule.Paths.ResetPassword: {
    page = (
      <Provider store={noticesStore}>
        <SafeAreaView>
          <Background>
            <AuthChangePassword />
          </Background>
        </SafeAreaView>
        <NoticesManager />
      </Provider>
    );
    break;
  }

  case PathsModule.Paths.Root: {
    page = <App />
    break;
  }

  default: {
    page = <App />
    break;
  }
}

createRoot(rootElement).render(page);

// if (window.location.pathname === '/verify-email') {
//   const { token } = getQueryParams();

//   createRoot(document.getElementById('root')!).render(
//     <SafeAreaView>
//       <Background>
//         <style>{`
//           .verify-email {
//             width: 100%;
//             max-width: 350px;
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             text-align: center;
//             gap: 30px;
//             background-color: rgba(255, 255, 255, 1);
//             border-radius: 30px;
//             box-shadow: 0 0 4px 4px rgba(10, 10, 10, .1);
//             position: relative;
//             overflow: hidden;
//             padding: 30px;
//             margin: 30px;
//           }

//           .verify-email-container {
//             align-self: stretch;
//           }

//           .verify-email-button {
//             width: 100%;
//             cursor: pointer;
//           }
//         `}</style>
//         <div className="verify-email">
//           <span>
//             Kliknij w przycisk poniżej,<br />aby zweryfikować swój email
//           </span>
//           <div className="verify-email-container">
//             <button
//               className="verify-email-button"
//               onClick={async () => {
//                 if (token) {
//                   window.localStorage.setItem(Config.sessionKeys.Token, token);
//                   apiService.fetch('auth/verify-email', {
//                     method: 'GET',
//                   }).then(() => {
//                     window.localStorage.removeItem(Config.sessionKeys.Token);
//                     window.location.replace(window.location.origin);
//                   }).catch(() => {
//                     window.localStorage.removeItem(Config.sessionKeys.Token);
//                   });
//                   window.localStorage.removeItem(Config.sessionKeys.Token);
//                 }
//               }}
//             >
//               Zweryfikuj email
//             </button>
//           </div>
//         </div>
//       </Background>
//     </SafeAreaView>
//   );
// } else {

//   createRoot(document.getElementById('root')!).render(
//     <BrowserRouter>
//       <StrictMode>
//         <Provider store={noticesStore}>
//           <Provider store={store}>
//             <LiveUpdateProvider>
//               <SafeAreaView>
//                 <SplashScreen />
//               </SafeAreaView>
//             </LiveUpdateProvider>
//           </Provider>
//           <NoticesManager />
//         </Provider>
//       </StrictMode>
//     </BrowserRouter>
//   )
// }

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


