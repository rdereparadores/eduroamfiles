import {Link} from "react-router";
import {useState} from "react";
import {useAuth} from "../../../hooks/auth.hook.tsx";

export const SignupRoute = () => {
    const auth = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const onSubmit = async () => {
        if (password === '' || email === '') {
            return alert('Rellena el formulario');
        }
        if (password !== confirmPassword) {
            return alert('Las contraseñas no coinciden');
        }

        try {
            await auth.signup(email, password);
            alert('Usuario registrado con éxito');
            window.location.href = '/auth/signin';
        } catch {

        }
    }

    return (
        <div className="flex flex-col gap-2 w-96">
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button onClick={onSubmit}>Registrarse</button>

            <div className="flex gap-2 w-full items-center">
                <p>¿Ya tienes cuenta?</p>
                <Link to="/auth/signin" className="grow">
                    <button className="w-full">Iniciar sesión</button>
                </Link>
            </div>
        </div>
    )
}