"use client"

import { useMemo } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@alvarosky/ui"
import { BrandingForm } from "@/components/settings/BrandingForm"
import { GeneralSettingsForm } from "./tabs/general-settings-form"
import { FinanceSettingsForm } from "./tabs/finance-settings-form"
import { EmailSettingsForm } from "./tabs/email-settings-form"
import { ApiSettingsForm } from "./tabs/api-settings-form"
import { NavigationSettingsForm } from "./tabs/navigation-settings-form"
import { BusinessHoursSettingsForm } from "./tabs/business-hours-settings-form"
import { useBranchStore } from "@/store/use-branch-store"
import { useEffect, useState, useCallback } from "react"
import { fetchAPI } from "@/lib/api"
import { Loader2, Globe, Building } from "lucide-react"

interface SettingsLayoutProps {
    initialData?: any
    brandingData?: any
}

export function SettingsLayout({ initialData: propsInitialData, brandingData }: SettingsLayoutProps) {
    const { currentBranchId } = useBranchStore()
    const [initialData, setInitialData] = useState(propsInitialData)
    const [isLoading, setIsLoading] = useState(false)

    const fetchConfig = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await fetchAPI<any>('/settings/tenant-config')
            setInitialData(data)
        } catch (error) {
            console.error("Error fetching branch config:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        // Solo refetch si ya estamos montados y el branchId cambió
        if (currentBranchId) {
            fetchConfig()
        }
    }, [currentBranchId, fetchConfig])
    
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
            metaTitle: bs.metaTitle || "",
            metaDescription: bs.metaDescription || "",
            authBgUrl: bs.authBgUrl || "",
            authQuote: bs.authQuote || "",
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
        heroImage: initialData?.hero_image || "",
    }), [initialData]);

    const financeData = useMemo(() => ({
        activePaymentProvider: initialData?.activePaymentProvider || "NONE",
        currency: initialData?.currency || "COP",
        mpPublicKey: initialData?.mp_public_key || initialData?.MERCADOPAGO_CONFIG?.publicKey || "",
        mpAccessToken: initialData?.mp_access_token || initialData?.MERCADOPAGO_CONFIG?.accessToken || "",
        mpWebhookSecret: initialData?.mpWebhookSecret || initialData?.MERCADOPAGO_CONFIG?.webhookSecret || "",
        mpClientId: initialData?.mpClientId || initialData?.MERCADOPAGO_CONFIG?.clientId || "",
        mpClientSecret: initialData?.mpClientSecret || initialData?.MERCADOPAGO_CONFIG?.clientSecret || "",
        boldApiKey: initialData?.boldApiKey || "",
        boldSecretKey: initialData?.boldSecretKey || "",
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
        apiKeyOpenAI: initialData?.apiKeyOpenAI || "",
        tiktokPixelId: initialData?.tiktokPixelId || "",
        tiktokAccessToken: initialData?.tiktokAccessToken || "",
    }), [initialData]);

    const navigationData = useMemo(() => ({
        headerLinks: initialData?.menu?.headerLinks || [],
        footerLinks: initialData?.menu?.footerLinks || [],
    }), [initialData]);

    const businessHoursData = useMemo(() => {
        const bh = initialData?.businessHours;
        if (!bh) return undefined;
        return bh;
    }, [initialData]);

    return (
        <div className="max-w-4xl mx-auto w-full space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <Globe className="h-3 w-3" /> Configuración Global (Tenant)
                    </div>
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="branding">Branding</TabsTrigger>
                        <TabsTrigger value="navigation">Navegación</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="apis">API's</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary uppercase tracking-wider mt-4">
                        <Building className="h-3 w-3" /> Configuración de Sucursal
                    </div>
                    <TabsList className="bg-primary/5">
                        <TabsTrigger value="finance">Operación y Pagos</TabsTrigger>
                        <TabsTrigger value="hours">Horarios de Atención</TabsTrigger>
                    </TabsList>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Cargando configuración de la sucursal...</p>
                    </div>
                )}

                <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>


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

            <TabsContent value="hours">
                </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
