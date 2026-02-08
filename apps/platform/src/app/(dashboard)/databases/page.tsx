import { Card, CardHeader, CardTitle, CardDescription, CardContent, AdminPageWrapper } from "@alvarosky/ui";

export const dynamic = "force-dynamic";

export default function DatabasesPage() {
    return (
        <AdminPageWrapper
            title="Bases de Datos"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Bases de Datos</CardTitle>
                    <CardDescription>Esta funcionalidad estará disponible próximamente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Aquí podrás gestionar las conexiones y backups de tus tenants.</p>
                </CardContent>
            </Card>
        </AdminPageWrapper>
    );
}
