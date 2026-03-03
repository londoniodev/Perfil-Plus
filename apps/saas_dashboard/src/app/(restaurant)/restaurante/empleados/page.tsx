import { AdminPageWrapper } from "@alvarosky/ui";
import { EmployeesClient } from "./components/employees-client";

export default function EmployeesPage() {
    return (
        <AdminPageWrapper
            title="Gestión de Empleados"
            description="Administra el personal del restaurante (Meseros, Cocina, Cajeros)."
        >
            <EmployeesClient />
        </AdminPageWrapper>
    );
}
