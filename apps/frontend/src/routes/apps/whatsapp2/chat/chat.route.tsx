import {useNavigate, useParams} from "react-router";

export const ChatRoute = () => {
    const { id } = useParams();
    const navigate = useNavigate();


    return (
        <div className="flex flex-col h-screen w-screen">
            <div className="flex gap-2 w-full bg-green-200 h-16 items-center justify-start p-2">
                <button className="" onClick={() => navigate('..')}>{'<-'}</button>
                <div className="flex gap-2 items-center grow justify-center">
                    <img className="w-10 h-10" />
                    <p className="text-lg">P. Luis Robofonica</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 grow p-2">
                <div className="flex flex-col-reverse grow">
                    <div className="flex items-center bg-green-100 h-10 rounded-sm p-2 w-fit">
                        <p className="text-sm">Hola!</p>
                    </div>
                    <div className="flex items-center bg-gray-100 h-10 rounded-sm p-2 w-fit self-end">
                        <p className="text-sm">Hola!</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input type="text" className="grow" placeholder="Escribe aquí..." />
                    <button>Enviar</button>
                </div>
            </div>
        </div>
    )
}