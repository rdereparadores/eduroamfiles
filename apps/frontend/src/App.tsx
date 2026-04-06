import './App.css'
import {Route, Routes} from "react-router";
import {DesktopRoute} from "./routes/desktop/desktop.route.tsx";
import {AuthRoute} from "./routes/auth/auth.route.tsx";
import {SigninRoute} from "./routes/auth/signin/signin.route.tsx";
import {SignupRoute} from "./routes/auth/signup/signup.route.tsx";
import {Whatsapp2Route} from "./routes/apps/whatsapp2/whatsapp2.route.tsx";
import {ChatRoute} from "./routes/apps/whatsapp2/chat/chat.route.tsx";
import {BrowserRoute} from "./routes/apps/browser/browser.route.tsx";
import {LsbToolRoute} from "./routes/apps/lsbtool/lsbtool.route.tsx";
import {ReglamentosRoute} from "./routes/apps/reglamentos/reglamentos.route.tsx";
import {AuthContainer} from "./components/auth-container.component.tsx";

function App() {

  return (
    <Routes>
        <Route path="/auth" element={<AuthRoute />}>
            <Route path="signin" element={<SigninRoute />} />
            <Route path="signup" element={<SignupRoute />} />
        </Route>
        <Route element={<AuthContainer />}>
            <Route path="/desktop" element={<DesktopRoute />} />
            <Route path="/apps">
                <Route path="whatsapp2">
                    <Route index element={<Whatsapp2Route />} />
                    <Route path=":id" element={<ChatRoute />} />
                </Route>
                <Route path="browser" element={<BrowserRoute />} />
                <Route path="lsbtool" element={<LsbToolRoute />} />
                <Route path="reglamentos" element={<ReglamentosRoute />} />
            </Route>
        </Route>
    </Routes>
  )
}

export default App
