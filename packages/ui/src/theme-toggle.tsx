"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const [theme, setThemeState] = React.useState<string>("light");
    const [mounted, setMounted] = React.useState(false);

    // Dynamically import useTheme to avoid SSR issues
    const useTheme = React.useMemo(() => {
        try {
            return require("next-themes").useTheme;
        } catch {
            return null;
        }
    }, []);

    const themeHook = useTheme?.();

    React.useEffect(() => {
        setMounted(true);
        if (themeHook?.theme) {
            setThemeState(themeHook.theme);
        }
    }, [themeHook?.theme]);

    const toggleTheme = React.useCallback(() => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setThemeState(newTheme);
        themeHook?.setTheme(newTheme);
    }, [theme, themeHook]);

    // Avoid hydration mismatch
    if (!mounted) {
        return (
            <button
                className={`inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${className || ""}`}
                aria-label="Cambiar tema"
            >
                <Sun className="h-4 w-4" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${className || ""}`}
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
            {theme === "dark" ? (
                <Sun className="h-4 w-4 transition-transform duration-300" />
            ) : (
                <Moon className="h-4 w-4 transition-transform duration-300" />
            )}
        </button>
    );
}
