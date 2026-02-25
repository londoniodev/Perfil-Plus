"use client";

import { API_BASE, TENANT_ID } from "@/lib/config";
import { LeadForm as SharedLeadForm, type LeadFormProps as SharedLeadFormProps } from "@alvarosky/ui";

interface LeadFormProps extends Omit<SharedLeadFormProps, "apiConfig" | "onSubmit"> {
    // We can expose specific props if needed, or just extend standard props
}

export default function LeadForm(props: LeadFormProps) {
    return (
        <SharedLeadForm
            {...props}
            apiConfig={{
                baseUrl: API_BASE,
                tenantId: TENANT_ID
            }}
        />
    );
}
