"use client";

import { AttachmentManager as SharedAttachmentManager, type BlogAttachment as Attachment } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from "@/lib/config";

interface AttachmentManagerProps {
    postId: string;
    attachments: Attachment[];
    onUpdate: () => void;
    isPremium: boolean;
}

export default function AttachmentManager({ postId, attachments, onUpdate, isPremium }: AttachmentManagerProps) {
    return (
        <SharedAttachmentManager
            entityId={postId}
            attachments={attachments}
            onUpdate={onUpdate}
            isPremium={isPremium}
            apiBase={API_BASE}
            tenantId={TENANT_ID}
        />
    );
}
