

import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
                </div >
            }
        >
    { children }
        </DashboardLayout >
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DashboardProvider>
                <DashboardWithAuth>{children}</DashboardWithAuth>
            </DashboardProvider>
        </AuthProvider>
    );
}
