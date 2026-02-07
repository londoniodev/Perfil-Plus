"use client";

import { VideoUploader as SharedVideoUploader, VideoUploaderProps } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from "@/lib/config";

interface LocalVideoUploaderProps extends Omit<VideoUploaderProps, 'apiBase' | 'tenantId'> { }

export default function VideoUploader(props: LocalVideoUploaderProps) {
    return (
        <SharedVideoUploader
            {...props}
            apiBase={API_BASE}
            tenantId={TENANT_ID}
        />
    );
}
