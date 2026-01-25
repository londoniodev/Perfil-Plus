import { useState } from 'react';
import { toast } from 'sonner';

interface UseDigitalProductProps {
    apiUrl?: string;
    token?: string;
}

interface DownloadResponse {
    downloadUrl: string;
}

export function useDigitalProduct({ apiUrl, token }: UseDigitalProductProps = {}) {
    const [isLoading, setIsLoading] = useState(false);

    const downloadProduct = async (productId: string, productName: string = 'Archivo') => {
        setIsLoading(true);
        try {
            const baseUrl = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                // Try getting from localStorage if client-side
                const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (storedToken) {
                    headers['Authorization'] = `Bearer ${storedToken}`;
                }
            }

            // Also check for tenant-id if needed, but usually handled by domain/subdomain
            const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;
            if (tenantId) headers['x-tenant-id'] = tenantId;

            const response = await fetch(`${baseUrl}/products/${productId}/download`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('No tienes acceso a este producto. Debes comprarlo primero.');
                }
                throw new Error('Error al obtener el enlace de descarga');
            }

            const data: DownloadResponse = await response.json();

            // Open download directly
            window.open(data.downloadUrl, '_blank');
            toast.success(`Descarga iniciada: ${productName}`);

        } catch (error: any) {
            console.error('Download error:', error);
            toast.error(error.message || 'Error al descargar el producto');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        downloadProduct,
        isLoading
    };
}
