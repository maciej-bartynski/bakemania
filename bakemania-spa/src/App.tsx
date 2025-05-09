import { StrictMode, useEffect } from "react"
import { Provider } from "react-redux"
import LiveUpdateProvider from "./LiveUpdate/LiveUpdateProvider"
import SafeAreaView from "./atoms/SafeAreaView/SafeAreaView"
import SplashScreen from "./views/SplashScreen/SplashScreen"
import NoticesManager from "./NoticesManager"
import { noticesStore } from "./storage/notices-store"
import { store } from "./storage/store"
import PathsModule from "./tools/paths"

function App() {

    useEffect(() => {
        PathsModule.inPageCheckNoTokenAndRedirectLogin();
    });

    return (
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
    )
}

export default App
