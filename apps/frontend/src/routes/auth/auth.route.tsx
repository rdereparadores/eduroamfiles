import LoginBackground from '../../assets/winxp/login-background.jpg';
import UnexLogo from '../../assets/misc/logo-unex.png';
import {Outlet} from "react-router";

export const AuthRoute = () => {
    return (
        <div className="relative w-screen h-screen">
            <img src={LoginBackground} alt="Background" className="absolute top-0 w-screen h-screen" />
            <div className="relative h-screen">
                <div className="flex gap-2 items-center justify-center h-full">
                    <div className="flex gap-2">
                        <div className="flex flex-col gap-2 items-end">
                            <img src={UnexLogo} alt="Logo UNEX" className="w-32" />
                            <p className="text-2xl font-bold text-white">Bienvenido de nuevo</p>
                        </div>
                        <div className="divider divider-horizontal" />
                    </div>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}