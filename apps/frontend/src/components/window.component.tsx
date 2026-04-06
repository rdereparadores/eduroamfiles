import React from "react";
import {Rnd} from "react-rnd";
import {useWindow} from "../hooks/window.hook.tsx";

export const WindowComponent = ({ id }: { id: string }) => {
    const window = useWindow();

    return (
        <Rnd
            default={{
                x: 100,
                y: 100,
                width: 400,
                height: 300,
            }}
            minWidth={200}
            minHeight={150}
            bounds="window"
            dragHandleClassName="title-bar"
            className="window"
        >
            <div className="flex flex-col h-full">
                <div className="title-bar">
                    <div className="title-bar-text">{window.get(id).title}</div>
                    <div className="title-bar-controls">
                        <button aria-label="Minimize" onClick={() => window.toggleMinimize(id)}></button>
                        <button aria-label="Maximize"></button>
                        <button aria-label="Close" onClick={() => window.close(id)}></button>
                    </div>
                </div>
                <div className="window-body h-full">
                    <iframe
                        className="w-full h-full"
                        src={window.get(id).link}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                </div>
            </div>
        </Rnd>
    )
}