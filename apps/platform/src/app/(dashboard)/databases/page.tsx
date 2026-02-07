import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@alvarosky/ui";

export const dynamic = "force-dynamic";

export default function DatabasesPage() {
    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Bases de Datos</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Bases de Datos</CardTitle>
                    <CardDescription>Esta funcionalidad estará disponible próximamente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Aquí podrás gestionar las conexiones y backups de tus tenants.</p>
                </CardContent>
            </Card>
        </div>
    );
}
