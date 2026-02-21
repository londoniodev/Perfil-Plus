import { Separator } from "@alvarosky/ui";
import { EmployeesClient } from "./components/employees-client";

export default function EmployeesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Gestión de Empleados</h3>
                <p className="text-sm text-muted-foreground">
                    Administra el personal del restaurante (Meseros, Cocina, Cajeros).
                </p>
            </div>
            <Separator />
            <EmployeesClient />
        </div>
    );
}
