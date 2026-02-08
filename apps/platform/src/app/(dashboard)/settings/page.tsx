import { Card, CardHeader, CardTitle, CardDescription, CardContent, AdminPageWrapper } from "@alvarosky/ui";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
    return (
        <AdminPageWrapper
            title="Configuración"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Configuración Global</CardTitle>
                    <CardDescription>Ajustes generales de la plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Opciones de administración global en construcción.</p>
                </CardContent>
            </Card>
        </AdminPageWrapper>
    );
}
