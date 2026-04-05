"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FacebookSDK } from "@/types/facebook-sdk";

const FB_SDK_URL = "https://connect.facebook.net/en_US/sdk.js";
const FB_SDK_SCRIPT_ID = "facebook-jssdk";

interface UseFacebookSdkOptions {
  appId: string;
  version?: string;
}

interface UseFacebookSdkReturn {
  /** The FB SDK instance, null until loaded */
  fb: FacebookSDK | null;
  /** Whether the SDK is currently loading */
  isLoading: boolean;
  /** Error during SDK load, if any */
  error: string | null;
}

/**
 * Hook para inyectar y obtener el Facebook JS SDK de forma segura.
 * Evita fugas de memoria con AbortController y ref de montaje.
 * Solo se ejecuta del lado del cliente (Client Component).
 */
export function useFacebookSdk({
  appId,
  version = "v21.0",
}: UseFacebookSdkOptions): UseFacebookSdkReturn {
  const [fb, setFb] = useState<FacebookSDK | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Guard: no appId → no SDK
    if (!appId) {
      setError("NEXT_PUBLIC_META_APP_ID no está configurado.");
      setIsLoading(false);
      return;
    }

    // If SDK already loaded (hot-reload scenario), just init
    if (window.FB) {
      window.FB.init({ appId, xfbml: true, version });
      if (isMountedRef.current) {
        setFb(window.FB);
        setIsLoading(false);
      }
      return;
    }

    // Define the global callback Meta calls after script loads
    window.fbAsyncInit = () => {
      if (!window.FB || !isMountedRef.current) return;

      window.FB.init({ appId, xfbml: true, version });
      setFb(window.FB);
      setIsLoading(false);
    };

    // Only inject the script tag if it doesn't exist yet
    if (!document.getElementById(FB_SDK_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = FB_SDK_SCRIPT_ID;
      script.src = FB_SDK_URL;
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        if (isMountedRef.current) {
          setError("Error al cargar el SDK de Facebook. Verifica tu conexión o bloqueadores de anuncios.");
          setIsLoading(false);
        }
      };

      document.head.appendChild(script);
    }

    // Cleanup: mark unmounted to prevent state updates on unmounted component
    return () => {
      isMountedRef.current = false;
    };
  }, [appId, version]);

  return { fb, isLoading, error };
}
