import WavacityIcon from '../../assets/icons/wavacity-icon.webp';
import Metadata2GoIcon from '../../assets/icons/metadata2go-icon.png';
import Whatsapp2Icon from '../../assets/icons/whatsapp2-icon.webp';
import FolderIcon from '../../assets/winxp/folder-icon.png';
import HexeditIcon from '../../assets/icons/hexedit-icon.png';
import {useDesktop} from "../../hooks/desktop.hook.tsx";
import {useWindow} from "../../hooks/window.hook.tsx";

export const DesktopIcon = (
    { name, icon, onClick }:
    { name: string, icon: string, onClick: () => void }
) => {
    const desktop = useDesktop();

    return (
        <div
            className="flex flex-col items-center justify-center w-20 h-24 gap-1"
            onClick={() => desktop.setSelectedIcon(name)}
            onDoubleClick={onClick}
        >
            <div className={`absolute w-20 h-24 bg-blue-400 -z-10 ${desktop.selectedIcon === name ? '' : 'hidden'}`} />
            <img src={icon} alt="img" className="w-16 h-16" />
            <p className="text-white text-sm select-none">{name}</p>
        </div>
    )
}

export const DesktopIcons = () => {
    const windowManager = useWindow();

    return (
        <div className="flex flex-col flex-wrap p-3 max-h-[95dvh] w-fit">
            <DesktopIcon name="Wavacity" icon={WavacityIcon} onClick={() => window.open('https://wavacity.com')} />
            <DesktopIcon name="Metadata2Go" icon={Metadata2GoIcon} onClick={() => window.open('https://www.metadata2go.com/es')} />
            <DesktopIcon name="Hexed.it" icon={HexeditIcon} onClick={() => window.open('https://hexed.it')} />
            <DesktopIcon name="Whatsapp 2" icon={Whatsapp2Icon} onClick={() => windowManager.open('whatsapp2')} />
            <DesktopIcon name="Reglamentos" icon={FolderIcon} onClick={() => windowManager.open('eduroamfiles')} />
        </div>
    )
}