"use client";

import { useRouter } from "next/navigation";
import { Button } from "@alvarosky/ui";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

interface LogoutButtonProps extends React.ComponentProps<typeof Button> { }

export function LogoutButton({ className, variant = "ghost", ...props }: LogoutButtonProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    return (
        <Button
            variant={variant}
            onClick={handleLogout}
            className={cn("gap-2", className)}
            {...props}
        >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
        </Button>
    );
}
