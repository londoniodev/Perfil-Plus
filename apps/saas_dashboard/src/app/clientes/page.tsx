import { redirect } from 'next/navigation';

export default function ClientesRedirectPage() {
    // Si la funcionalidad real de Clientes/Leads aún no está desarrollada,
    // o está en el admin principal, redirigimos al inicio del dashboard o mostramos WIP.
    // Por ahora, redirigimos a /admin/usuarios/leads si existiese, sino a home.
    redirect('/');
}
