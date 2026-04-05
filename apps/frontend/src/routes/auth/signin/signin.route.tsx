import ProfileImage from '../../../assets/winxp/profile-image.jpg';
import ArrowButton from '../../../assets/winxp/arrow-button.png';
import {Link} from "react-router";
import {useState} from "react";
import {useAuth} from "../../../hooks/auth.hook.tsx";

export const SigninRoute = () => {
    const auth = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const onSubmit = async () => {
        try {
            await auth.signin(email, password);
            window.location.href = '/desktop';
        } catch {

        }
    }

    return (
        <div className="flex flex-col gap-2 w-96">
            <div className="flex gap-2 items-center">
                <img src={ProfileImage} alt="Profile image" className="w-20 h-20 rounded-md border-4 border-blue-300" />
                <div className="flex flex-col gap-1 grow">
                    <input type="email" placeholder="Usuario" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <img role="button" src={ArrowButton} alt="LoginButton" className="w-10 h-10 rotate-180" onClick={onSubmit} />
            </div>
            <div className="flex gap-1 items-center w-full">
                <p className="text-sm">¿Sin cuenta?</p>
                <Link to="/auth/signup" className="grow">
                    <button className="w-full">Regístrate aquí</button>
                </Link>
            </div>
        </div>
    )
}