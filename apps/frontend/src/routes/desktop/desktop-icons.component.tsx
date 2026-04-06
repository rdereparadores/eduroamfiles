import WavacityIcon from '../../assets/icons/wavacity-icon.webp';
import Metadata2GoIcon from '../../assets/icons/metadata2go-icon.png';
import Whatsapp2Icon from '../../assets/icons/whatsapp2-icon.webp';
import FolderIcon from '../../assets/winxp/folder-icon.png';
import HexeditIcon from '../../assets/icons/hexedit-icon.png';
import FileIcon from '../../assets/winxp/file_icon.png';
import {useDesktop} from "../../hooks/desktop.hook.tsx";
import {useWindow} from "../../hooks/window.hook.tsx";

const IEIcon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='4' fill='%23ffffff'/><text x='50%25' y='56%25' font-size='52' text-anchor='middle' dominant-baseline='middle' fill='%230055cc' font-family='Arial' font-style='italic' font-weight='bold'>e</text></svg>`;

const LsbIcon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='4' fill='%23111111'/><rect x='8' y='8' width='12' height='12' fill='%23ffffff'/><rect x='22' y='8' width='12' height='12' fill='%23000000'/><rect x='36' y='8' width='12' height='12' fill='%23ffffff'/><rect x='8' y='22' width='12' height='12' fill='%23000000'/><rect x='22' y='22' width='12' height='12' fill='%23ffffff'/><rect x='36' y='22' width='12' height='12' fill='%23000000'/><rect x='8' y='36' width='12' height='12' fill='%23ffffff'/><rect x='22' y='36' width='12' height='12' fill='%23000000'/><rect x='36' y='36' width='12' height='12' fill='%23ffffff'/><text x='50%25' y='88%25' font-size='13' text-anchor='middle' dominant-baseline='middle' fill='%2300ff88' font-family='monospace' font-weight='bold'>LSB</text></svg>`;

const MetaSealIcon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='4' fill='%230f172a'/><polygon points='32,6 56,18 56,46 32,58 8,46 8,18' fill='none' stroke='%2338bdf8' stroke-width='3'/><text x='50%25' y='54%25' font-size='15' text-anchor='middle' dominant-baseline='middle' fill='%2338bdf8' font-family='monospace' font-weight='bold'>META</text></svg>`;

const HashIcon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='4' fill='%231a1a2e'/><text x='50%25' y='54%25' font-size='38' text-anchor='middle' dominant-baseline='middle' fill='%23e94560' font-family='monospace' font-weight='bold'>%23</text></svg>`;

const OnlineToolsIcon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='4' fill='%23f0f4ff'/><rect x='8' y='14' width='48' height='36' rx='2' fill='%23c8d8ff' stroke='%234466cc' stroke-width='2'/><rect x='8' y='14' width='48' height='8' rx='2' fill='%234466cc'/><circle cx='14' cy='18' r='2' fill='%23ff6b6b'/><circle cx='22' cy='18' r='2' fill='%23ffd93d'/><circle cx='30' cy='18' r='2' fill='%236bcb77'/><text x='50%25' y='70%25' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23223388' font-family='monospace' font-weight='bold'>SHA</text></svg>`;

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
            <DesktopIcon name="LSB Tool" icon={LsbIcon} onClick={() => windowManager.open('lsbtool')} />
            <DesktopIcon name="Whatsapp 2" icon={Whatsapp2Icon} onClick={() => windowManager.open('whatsapp2')} />
            <DesktopIcon name="Reglamentos" icon={FolderIcon} onClick={() => windowManager.open('reglamentos')} />
            <DesktopIcon name="Explorador" icon={IEIcon} onClick={() => windowManager.open('browser')} />
            <DesktopIcon name="key.png" icon={FileIcon} onClick={() => window.open('https://eduroamfiles.t3.tigrisfiles.io/ctf/step1/key.png')} />
            <DesktopIcon name="MetaSeal" icon={MetaSealIcon} onClick={() => windowManager.open('metaseal')} />
            <DesktopIcon name="HashIdentifier" icon={HashIcon} onClick={() => window.open('https://hashes.com/en/tools/hash_identifier')} />
            <DesktopIcon name="Online Tools" icon={OnlineToolsIcon} onClick={() => window.open('https://emn178.github.io/online-tools/')} />
        </div>
    )
}