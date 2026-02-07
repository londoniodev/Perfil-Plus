"use client";

import { ImageUploader as SharedImageUploader, ImageUploaderProps } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from "@/lib/config";

interface LocalImageUploaderProps extends Omit<ImageUploaderProps, 'apiBase' | 'tenantId'> { }

export default function ImageUploader(props: LocalImageUploaderProps) {
    return (
        <SharedImageUploader
            {...props}
            apiBase={API_BASE}
            tenantId={TENANT_ID}
        />
    );
}
