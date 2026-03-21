"use client";

import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    Separator,
} from "../../.."; // Ajustar según estructura de exports de @alvarosky/ui

interface AdminDataSheetField {
    label: string;
    value: React.ReactNode;
    render?: () => React.ReactNode;
}

interface AdminDataSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    image?: string;
    fields: AdminDataSheetField[];
    actions?: React.ReactNode;
    children?: React.ReactNode;
}

export function AdminDataSheet({
    open,
    onOpenChange,
    title,
    description,
    image,
    fields,
    actions,
    children,
}: AdminDataSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Imagen opcional */}
                    {image && (
                        <div className="aspect-video relative overflow-hidden rounded-lg border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Campos dinámicos */}
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <React.Fragment key={index}>
                                <div>
                                    <p className="text-sm text-muted-foreground">{field.label}</p>
                                    <div className="mt-1 font-medium italic">
                                        {field.render ? field.render() : field.value}
                                    </div>
                                </div>
                                {index < fields.length - 1 && <Separator className="opacity-50" />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Contenido extra */}
                    {children}

                    {/* Acciones */}
                    {actions && (
                        <div className="flex flex-col gap-2 pt-4">
                            {actions}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
