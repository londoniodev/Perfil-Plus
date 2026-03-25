"use client"

import { useMemo } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@alvarosky/ui"
import { BrandingForm } from "@/components/settings/BrandingForm"
import { GeneralSettingsForm } from "./tabs/general-settings-form"
import { FinanceSettingsForm } from "./tabs/finance-settings-form"
import { EmailSettingsForm } from "./tabs/email-settings-form"
import { ApiSettingsForm } from "./tabs/api-settings-form"
import { NavigationSettingsForm } from "./tabs/navigation-settings-form"

interface SettingsLayoutProps {
    initialData?: any
    brandingData?: any
}

export function SettingsLayout({ initialData, brandingData }: SettingsLayoutProps) {
    
    // Mapear datos para BrandingForm
    const mappedBrandingData = useMemo(() => {
        const bs = brandingData?.brandSettings;
        if (!bs) return undefined;
        return {
            primary: bs.primaryColor || "",
            radius: bs.borderRadius ?? 0.5,
            density: "default" as const,
            mode: "system" as const,
            logoUrl: bs.logoUrl || "",
            faviconUrl: bs.faviconUrl || "",
            secondaryColor: bs.secondaryColor || "",
            fontFamily: bs.fontFamily?.split(",")[0]?.trim() || "Inter",
        };
    }, [brandingData]);

    // Data mappings for specialized forms
    const generalData = useMemo(() => ({
        storeName: initialData?.storeName || "",
        storeEmail: initialData?.storeEmail || "",
        whatsapp: initialData?.contact?.whatsapp || initialData?.whatsapp || "",
        instagram: initialData?.contact?.instagram || initialData?.instagram || "",
        facebook: initialData?.contact?.facebook || initialData?.facebook || "",
        address: initialData?.contact?.address || initialData?.address || "",
        enableBlog: initialData?.enableBlog ?? true,
        enableStore: initialData?.enableStore ?? true,
        enableLMS: initialData?.enableLMS ?? false,
        orderTrackingEnabled: initialData?.orderTrackingEnabled ?? true,
        menuSlogan: initialData?.menu?.slogan || initialData?.menuSlogan || "",
    }), [initialData]);

    const financeData = useMemo(() => ({
        currency: initialData?.currency || "COP",
        mpPublicKey: initialData?.mp_public_key || initialData?.MERCADOPAGO_CONFIG?.publicKey || "",
        mpAccessToken: initialData?.mp_access_token || initialData?.MERCADOPAGO_CONFIG?.accessToken || "",
        mpWebhookSecret: initialData?.mpWebhookSecret || initialData?.MERCADOPAGO_CONFIG?.webhookSecret || "",
        mpClientId: initialData?.mpClientId || initialData?.MERCADOPAGO_CONFIG?.clientId || "",
        mpClientSecret: initialData?.mpClientSecret || initialData?.MERCADOPAGO_CONFIG?.clientSecret || "",
        deliveryFee: initialData?.deliveryFee || 0,
    }), [initialData]);

    const emailData = useMemo(() => ({
        smtpHost: initialData?.smtpHost || initialData?.smtp?.host || "",
        smtpPort: initialData?.smtpPort || initialData?.smtp?.port || 587,
        smtpSecure: initialData?.smtpSecure ?? initialData?.smtp?.secure ?? false,
        smtpUser: initialData?.smtpUser || initialData?.smtp?.auth?.user || "",
        smtpPass: initialData?.smtpPass || initialData?.smtp?.auth?.pass || "",
    }), [initialData]);

    const apiData = useMemo(() => ({
        apiKeyOpenAI: initialData?.api_key_openai || "",
    }), [initialData]);

    const navigationData = useMemo(() => ({
        headerLinks: initialData?.menu?.headerLinks || [],
        footerLinks: initialData?.menu?.footerLinks || [],
    }), [initialData]);

    return (
        <div className="max-w-4xl mx-auto w-full space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="branding">Branding</TabsTrigger>
                        <TabsTrigger value="finance">Finanzas</TabsTrigger>
                        <TabsTrigger value="navigation">Navegación</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="apis">API's</TabsTrigger>
                    </TabsList>
                </div>

            <TabsContent value="general">
                <GeneralSettingsForm initialData={generalData} />
            </TabsContent>

            <TabsContent value="branding">
                <div className="space-y-6">
                    <BrandingForm defaultValues={mappedBrandingData} />
                </div>
            </TabsContent>

            <TabsContent value="finance">
                <FinanceSettingsForm initialData={financeData} />
            </TabsContent>

            <TabsContent value="email">
                <EmailSettingsForm initialData={emailData} />
            </TabsContent>

            <TabsContent value="apis">
                <ApiSettingsForm 
                    initialData={apiData} 
                    waPhoneNumberId={initialData?.waPhoneNumberId}
                    wabaId={initialData?.wabaId}
                />
            </TabsContent>

            <TabsContent value="navigation">
                <NavigationSettingsForm initialData={navigationData} />
            </TabsContent>
            </Tabs>
        </div>
    )
}
