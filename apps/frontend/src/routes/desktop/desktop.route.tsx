import TaskbarTexture from '../../assets/winxp/TaskbarBackground.png';
import TaskbarTrayTexture from '../../assets/winxp/TaskbarTray.png';
import BlissWallpaper from '../../assets/winxp/Bliss.png';
import UnexLogo from '../../assets/misc/logo-unex.png';
import {DesktopIcons} from "./desktop-icons.component.tsx";
import {StickyNote} from "../../components/sticky-note.component.tsx";
import {useEffect, useState} from "react";
import {useDesktop} from "../../hooks/desktop.hook.tsx";
import {useWindow} from "../../hooks/window.hook.tsx";
import {useAuth} from "../../hooks/auth.hook.tsx";

export const DesktopRoute = () => {
    const desktop = useDesktop();
    const window = useWindow();
    const auth = useAuth();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, [])

    return (
        <div className="flex flex-col w-screen h-screen overflow-hidden">
            <div className="relative grow">
                <img
                    className="absolute w-full h-full"
                    src={BlissWallpaper}
                    alt="Wallpaper"
                    draggable={false}
                    onClick={() => desktop.setSelectedIcon(undefined)}
                />
                <div className="relative z-10 w-fit">
                    <DesktopIcons />
                </div>
                <StickyNote />
            </div>
            <div className="relative w-full h-10 bg-black">
                <img className="absolute h-10 w-full" src={TaskbarTexture} alt="Taskbar" draggable={false} />
                <img className="absolute right-0 h-full" src={TaskbarTrayTexture} alt="Taskbar" draggable={false} />

                <div className="relative z-10">
                    <div className="flex">
                        <button
                            className="btn w-36"
                            style={{
                                backgroundImage: 'url("./StartButton.png")',
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}
                            onClick={auth.signout}
                        >
                            <img src={UnexLogo} className="w-6 h-6" alt="Unex" />
                            <p className="text-lg text-white font-bold italic">Inicio</p>
                        </button>

                        <div className="flex grow">
                            {
                                window.windows.filter(w => w.open).map(w =>
                                    <button className="w-36" onClick={() => window.toggleMinimize(w.id)} key={w.id}>
                                        {w.title}
                                    </button>
                                )
                            }
                        </div>

                        <div className="flex items-center p-2">
                            <p className="text-white text-sm">{time.toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
