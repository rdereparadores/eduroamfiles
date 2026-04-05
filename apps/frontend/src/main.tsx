import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router";
import {DesktopProvider} from "./hooks/desktop.hook.tsx";
import {WindowProvider} from "./hooks/window.hook.tsx";
import {AuthProvider} from "./hooks/auth.hook.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
        <WindowProvider>
            <DesktopProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </DesktopProvider>
        </WindowProvider>
    </AuthProvider>
  </StrictMode>,
)
