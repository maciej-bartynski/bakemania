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

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register("/sw.js")
//     .then(reg => console.log("SW zarejestrowany:", reg))
//     .catch(err => console.error("Błąd rejestracji SW:", err));
// }

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

