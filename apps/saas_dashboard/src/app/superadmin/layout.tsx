import { getSessionUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

interface Props {
    children: React.ReactNode;
}

export default async function SuperAdminLayout({ children }: Props) {
    const user = await getSessionUser();

    // Redirigir si no hay usuario o no es SUPERADMIN
    if (!user || user.role !== "SUPERADMIN") {
        return redirect("/dashboard");
    }

    return <>{children}</>;
}
