"use client";

import { useState, useEffect } from 'react';
import { Share, Plus, X, Download } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { cn } from './lib/utils';
import { toast } from 'sonner';

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // 1. Check if already dismissed
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        // 2. Check if running in standalone mode (already installed)
        const isStandaloneQuery = window.matchMedia('(display-mode: standalone)');
        setIsStandalone(isStandaloneQuery.matches);

        const handleStandaloneChange = (e: MediaQueryListEvent) => {
            setIsStandalone(e.matches);
        };
        isStandaloneQuery.addEventListener('change', handleStandaloneChange);


        // 3. Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIos(isIosDevice);

        // 4. Capture beforeinstallprompt event (Android/Desktop)
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Only show if not standalone
            if (!isStandaloneQuery.matches) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Show for iOS if not standalone
        if (isIosDevice && !isStandaloneQuery.matches && !dismissed) {
            // Delay slightly to not annoy immediately on load
            setTimeout(() => setIsVisible(true), 2000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            isStandaloneQuery.removeEventListener('change', handleStandaloneChange);
        };
    }, []);

    // Don't render if:
    // - Already installed (standalone)
    // - Dismissed by user
    // - Not visible yet (waiting for event or timeout)
    // - Is iOS but we want to be sure (isVisible handles logic)
    if (isStandalone || isDismissed || !isVisible) return null;

    const handleInstallClick = async () => {
        if (!deferredPrompt && !isIos) return;

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsVisible(false);
                toast.success("¡Gracias por instalar la App!");
            }
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    return (
        <div className="fixed bottom-4 left-0 right-0 z-[100] px-4 md:px-0 flex justify-center">
            <Card className="w-full max-w-md shadow-2xl bg-zinc-950 border-zinc-800 text-white animate-in slide-in-from-bottom-10 fade-in duration-500">
                <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-lg flex items-center gap-2">
                                <Download className="h-5 w-5 text-primary" />
                                Instalar App
                            </h4>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={handleDismiss}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <p className="text-sm text-zinc-400 mb-4">
                            Instala nuestra aplicación para una experiencia más rápida y pantalla completa.
                        </p>

                        {isIos ? (
                            <div className="bg-zinc-900/50 p-3 rounded-lg text-sm space-y-2 border border-zinc-800">
                                <p className="flex items-center gap-2">
                                    1. Toca el botón
                                    <Share className="h-4 w-4 text-blue-500" />
                                    <span className="font-semibold">Compartir</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    2. Selecciona
                                    <Plus className="h-4 w-4 text-zinc-300" />
                                    <span className="font-semibold">Agregar a Inicio</span>
                                </p>
                            </div>
                        ) : (
                            <Button
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={handleInstallClick}
                            >
                                Instalar Ahora
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
