import {useNavigate} from "react-router";

export const Whatsapp2Route = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen w-screen">
            <div className="flex gap-2 w-full bg-green-200 h-16 items-center justify-center p-2">
                <p className="text-xl">Whatsapp 2</p>
            </div>
            <div className="flex flex-col gap-2 grow p-2">
                <div className="flex gap-2 items-center bg-base-200 rounded-md p-2 hover:bg-base-300" onClick={() => navigate('id')}>
                    <img className="w-20 h-20"/>
                    <div className="flex flex-col gap-1 grow">
                        <p className="text-lg">P. Luis Robofonica</p>
                        <p className="text-sm">¿Que te parece?</p>
                    </div>
                    <div className="flex items-center justify-center rounded-full w-10 h-10 bg-green-500">
                        <p className="font-bold text-white ml-0.5 mt-0.5">34</p>
                    </div>
                </div>
            </div>
            <button className="absolute right-2 bottom-2 h-12">
                <p className="text-lg">+ Añadir</p>
            </button>
        </div>
    )
}