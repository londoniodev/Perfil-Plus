"use client";

import { API_BASE } from "@/lib/config";
import { useTenant } from "@/app/providers";
import { LeadForm as SharedLeadForm, type LeadFormProps as SharedLeadFormProps } from "@alvarosky/ui";

interface LeadFormProps extends Omit<SharedLeadFormProps, "apiConfig" | "onSubmit"> {
    // We can expose specific props if needed, or just extend standard props
}

export default function LeadForm(props: LeadFormProps) {
    const { tenantId } = useTenant();

    return (
        <SharedLeadForm
            {...props}
            apiConfig={{
                baseUrl: API_BASE,
                tenantId: tenantId
            }}
        />
    );
}
