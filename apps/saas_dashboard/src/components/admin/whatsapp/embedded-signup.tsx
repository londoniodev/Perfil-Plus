"use client"

import { useState, useEffect } from "react"
import { Button } from "@alvarosky/ui"
import { toast } from "sonner"
import { Loader2, MessageSquare } from "lucide-react"
import axios from "axios"

interface WhatsAppEmbeddedSignupProps {
  onSuccess?: () => void
}

declare global {
  interface Window {
    FB: any
    fbAsyncInit: any
  }
}

export function WhatsAppEmbeddedSignup({ onSuccess }: WhatsAppEmbeddedSignupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSdkLoaded, setIsSdkLoaded] = useState(false)

  useEffect(() => {
    // Cargar SDK de Facebook
    const loadFbSdk = () => {
      // Función de inicialización
      const initSdk = () => {
        if (!window.FB) return;
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_META_APP_ID || "YOUR_APP_ID",
          cookie: true,
          xfbml: true,
          version: "v21.0"
        });
        setIsSdkLoaded(true)
      };

      if (window.FB) {
        initSdk();
      } else {
        window.fbAsyncInit = initSdk;
        
        // Inyectar script si no existe
        if (!document.getElementById("facebook-jssdk")) {
          (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s) as HTMLScriptElement;
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode?.insertBefore(js, fjs);
          }(document, "script", "facebook-jssdk"));
        }
      }
    }

    loadFbSdk()
  }, [])

  const handleSignup = () => {
    if (!window.FB) {
      toast.error("El SDK de Facebook no ha cargado correctamente")
      return
    }

    setIsLoading(true)

    // Lanzar el Login de Meta para WhatsApp Embedded Signup
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const code = response.authResponse.code
          if (code) {
            exchangeCodeForToken(code)
          } else {
            setIsLoading(false)
            toast.error("No se recibió el código de autorización de Meta")
          }
        } else {
          setIsLoading(false)
          console.warn("El usuario canceló el login o no autorizó los permisos")
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID || "YOUR_CONFIG_ID", // Config ID del flujo de Embedded Signup
        response_type: "code",
        override_default_response_type: true
      }
    )
  }

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await axios.post("/api/whatsapp/onboarding/callback", { code })
      
      if (response.data.success) {
        toast.success("¡Cuenta de WhatsApp vinculada exitosamente!")
        onSuccess?.()
      } else {
        toast.error(response.data.message || "Error al vincular la cuenta")
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error en la conexión con el servidor"
      toast.error(errorMsg)
      console.error("Error exchanging code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-xl bg-card shadow-sm">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
        <MessageSquare className="w-6 h-6" />
      </div>
      
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold">Vincular WhatsApp Business</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Conecta tu cuenta de Meta para empezar a usar el asistente inteligente de WhatsApp.
        </p>
      </div>

      <Button 
        onClick={handleSignup} 
        disabled={isLoading || !isSdkLoaded}
        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Vinculando...
          </>
        ) : (
          "Conectar con Meta"
        )}
      </Button>
      
      {!isSdkLoaded && (
        <p className="text-[10px] text-muted-foreground animate-pulse">
          Cargando SDK de Meta...
        </p>
      )}
    </div>
  )
}
