"use client"

import { useState } from "react"
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@alvarosky/ui"
import { toast } from "sonner"
import { Loader2, MessageSquare, CheckCircle2, ExternalLink } from "lucide-react"
import { useFacebookSdk } from "@/hooks/useFacebookSdk"
import type { FBCodeAuthResponse } from "@/types/facebook-sdk"
import { API_BASE } from "@/lib/config"

interface WhatsAppEmbeddedSignupProps {
  /** CUID del tenant que se está conectando */
  tenantId: string
  /** URL a la que redirigir al completar el flujo */
  returnUrl?: string
  /** Callback interno cuando el signup es exitoso */
  onSuccess?: () => void
}

type SignupStatus = "idle" | "connecting" | "sending" | "success" | "error"

export function WhatsAppEmbeddedSignup({
  tenantId,
  returnUrl,
  onSuccess,
}: WhatsAppEmbeddedSignupProps) {
  const [status, setStatus] = useState<SignupStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID || ""
  const metaConfigId = process.env.NEXT_PUBLIC_META_CONFIG_ID || ""

  const { fb, isLoading: isSdkLoading, error: sdkError } = useFacebookSdk({
    appId: metaAppId,
    version: "v21.0",
  })

  const handleSignup = () => {
    console.log("[Embedded Signup] Botón clickeado. Iniciando flujo...");
    
    if (!fb) {
      const msg = "El SDK de Facebook no ha cargado correctamente";
      console.warn(msg);
      toast.error(msg);
      alert(msg);
      return;
    }

    if (!metaConfigId) {
      const msg = "NEXT_PUBLIC_META_CONFIG_ID no está configurado (Vacío en env)";
      console.warn(msg);
      toast.error(msg);
      alert(msg);
      return;
    }

    console.log("[Embedded Signup] Cambiando estado a connecting, llamando FB.login con Config ID:", metaConfigId);
    setStatus("connecting")
    setErrorMessage(null)

    // FB.login() abre el popup de Meta Embedded Signup
    try {
      fb.login(
        (response) => {
          console.log("[Embedded Signup] Respuesta de fb.login:", response);
          if (response.authResponse && "code" in response.authResponse) {
            const { code } = response.authResponse as FBCodeAuthResponse
            exchangeCode(code).catch((err) => {
               console.error("Unhandleable error calling exchangeCode", err)
            });
          } else {
            setStatus("idle")
            // El usuario cerró el popup o no autorizó
            const cancelMsg = "El usuario canceló o no autorizó los permisos"
            console.warn("[Embedded Signup]", cancelMsg)
            toast.error(cancelMsg);
          }
        },
        {
          config_id: metaConfigId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            // features: ["whatsapp_embedded_signup"] <- Algunos docs usan esto, dejémoslo limpio por ahora pero con el extras presente
          }
        }
      )
    } catch (err) {
      const catchMsg = "Error al ejecutar fb.login() - ¿Popups bloqueados?";
      console.error(catchMsg, err);
      toast.error(catchMsg);
      setStatus("idle");
      alert(catchMsg);
    }
  }

  const exchangeCode = async (code: string) => {
    setStatus("sending")

    try {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("auth_token")
        : null

      const response = await fetch(`${API_BASE}/whatsapp/onboarding/callback`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": tenantId,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        toast.success("¡Cuenta de WhatsApp vinculada exitosamente!")
        onSuccess?.()

        // Redirigir de vuelta al panel del tenant
        if (returnUrl) {
          setTimeout(() => {
            window.location.href = returnUrl
          }, 2000)
        }
      } else {
        setStatus("error")
        const msg = data.message || "Error al vincular la cuenta"
        setErrorMessage(msg)
        toast.error(msg)
      }
    } catch (error: unknown) {
      setStatus("error")
      const msg = error instanceof Error
        ? error.message
        : "Error en la conexión con el servidor"
      setErrorMessage(msg)
      toast.error(msg)
      console.error("[Embedded Signup] Error exchanging code:", error)
    }
  }

  // ── Estado de éxito ──
  if (status === "success") {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardContent className="flex flex-col items-center gap-3 p-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            ¡Cuenta vinculada exitosamente!
          </p>
          {returnUrl && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Redirigiendo a tu panel...
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  // ── Error del SDK ──
  if (sdkError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <p className="text-sm text-destructive" role="alert">
            {sdkError}
          </p>
        </CardContent>
      </Card>
    )
  }

  const isDisabled = isSdkLoading || status === "connecting" || status === "sending"

  return (
    <section aria-labelledby="whatsapp-signup-title">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30">
            <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <CardTitle id="whatsapp-signup-title" className="text-base">
              Vincular WhatsApp Business
            </CardTitle>
            <CardDescription>
              Conecta tu cuenta de Meta para habilitar el asistente de WhatsApp.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={handleSignup}
            disabled={isDisabled}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white focus-visible:ring-green-500"
            aria-busy={status === "connecting" || status === "sending"}
          >
            {status === "connecting" || status === "sending" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                {status === "connecting" ? "Autenticando con Meta..." : "Vinculando cuenta..."}
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                Conectar con Meta
              </>
            )}
          </Button>

          {isSdkLoading && (
            <p className="text-center text-[10px] text-muted-foreground animate-pulse" aria-live="polite">
              Cargando SDK de Meta...
            </p>
          )}

          {errorMessage && (
            <p className="text-sm text-destructive text-center" role="alert">
              {errorMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
