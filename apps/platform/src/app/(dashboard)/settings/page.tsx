import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@alvarosky/ui";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Configuración</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Configuración Global</CardTitle>
                    <CardDescription>Ajustes generales de la plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Opciones de administración global en construcción.</p>
                </CardContent>
            </Card>
        </div>
    );
}
