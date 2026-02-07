"use client";

import { useRouter } from "next/navigation";
import { ThemeCard as SharedThemeCard, LmsTheme } from "@alvarosky/ui";

interface ThemeCardProps {
    theme: LmsTheme;
    onDelete: (id: string) => void;
}

export default function ThemeCard({ theme, onDelete }: ThemeCardProps) {
    const router = useRouter();

    return (
        <SharedThemeCard
            theme={theme}
            onEdit={(id) => router.push(`/admin/cursos/temas/${id}`)}
            onDelete={onDelete}
        />
    );
}
