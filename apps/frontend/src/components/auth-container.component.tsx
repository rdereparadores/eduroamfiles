import { useAuth } from "../hooks/auth.hook";
import { Navigate, Outlet } from "react-router";

export function AuthContainer() {
    const { user } = useAuth();

    if (user === undefined) return null;
    if (user === null) return <Navigate to="/auth/signin" />;

    return <Outlet />;
}
