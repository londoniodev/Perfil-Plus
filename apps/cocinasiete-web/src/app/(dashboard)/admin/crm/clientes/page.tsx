"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminPageWrapper } from "@alvarosky/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Lead {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    source: string | null;
    status: string;
    createdAt: string;
}

export default function AdminCRMClientesPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAdmin) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchLeads = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/leads`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error("Error fetching leads");
                const data = await res.json();

                // La API devuelve: { data: Lead[], meta: { total: number } } 
                // O puede ser un arreglo directamente dependiendo de LeadsService. 
                // Normalmente NestJS devuelve arreglo directo si no hay paginación, ajustaremos asumiendo arreglo
                const dataArray = Array.isArray(data) ? data : data.data || [];
                setLeads(dataArray);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [isAdmin]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-muted-foreground">Cargando clientes...</div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <AdminPageWrapper
            title="CRM - Clientes / Leads"
            description={`Lista de clientes obtenidos a través del sistema de pedidos`}
        >
            <div className="bg-white rounded-lg border shadow-sm">
                {error && (
                    <div className="p-4 text-red-600 bg-red-50 border-b">
                        Error: {error}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Celular</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Origen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No hay clientes registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {format(new Date(lead.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {lead.name || <span className="text-slate-400 italic">No provisto</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.phone ? (
                                                <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                    {lead.phone}
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {lead.email || <span className="text-slate-400 italic">-</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                                {lead.source || "Menu Checkout"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminPageWrapper>
    );
}
