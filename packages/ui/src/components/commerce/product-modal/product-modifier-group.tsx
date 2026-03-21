"use client"

import { formatCurrency } from "@alvarosky/shared"

export function ProductModifierGroup({
    group,
    selectedModifiers,
    toggleModifier
}: {
    group: any
    selectedModifiers: Record<string, Record<string, { price: number; qty: number; name: string }>>
    toggleModifier: (groupId: string, modifier: any, maxSelect: number) => void
}) {
    const minSelections = group.minSelect ?? group.minSelections ?? 0;
    const maxSelections = group.maxSelect ?? group.maxSelections ?? 1;

    // Use ARIA radiogroup for maxSelection 1, group for multiple
    const roleId = maxSelections === 1 ? "radiogroup" : "group";

    return (
        <fieldset 
            className="p-4 bg-slate-50 border border-slate-100 rounded-xl"
            role={roleId}
            aria-labelledby={`group-title-${group.id}`}
        >
            <div className="flex justify-between items-center mb-3">
                <legend id={`group-title-${group.id}`} className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                    {group.name}
                </legend>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${minSelections > 0 ? 'text-amber-700 bg-amber-100' : 'text-slate-500 bg-slate-200'}`}>
                    {minSelections > 0 ? `Requerido (Mín. ${minSelections})` : 'Opcional'}
                </span>
            </div>
            
            <div className="space-y-2">
                {group.modifiers?.map((mod: any) => {
                    const groupSelections = selectedModifiers[group.id] || {};
                    const isSelected = !!groupSelections[mod.id];
                    const itemRole = maxSelections === 1 ? "radio" : "checkbox";

                    return (
                        <button
                            key={mod.id}
                            role={itemRole}
                            aria-checked={isSelected}
                            onClick={() => toggleModifier(group.id, mod, maxSelections)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary outline-none ${isSelected ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div 
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`}
                                    aria-hidden="true"
                                >
                                    {isSelected && maxSelections === 1 && <div className="w-2 h-2 rounded-full bg-white" />}
                                    {isSelected && maxSelections > 1 && <div className="w-2 h-2 bg-white rotate-45" style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)' }} />}
                                </div>
                                <span>{mod.name}</span>
                            </div>
                            <span className={`text-xs ${isSelected ? 'font-bold' : 'font-medium text-slate-500'}`}>
                                {Number(mod.price) > 0 ? `+${formatCurrency(Number(mod.price))}` : ''}
                            </span>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    )
}

export function ProductVariantSelector({
    variants,
    selectedVariant,
    onSelect
}: {
    variants: any[]
    selectedVariant: string
    onSelect: (id: string) => void
}) {
    if (!variants || variants.length <= 1) return null

    return (
        <fieldset className="mb-6 space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl" role="radiogroup" aria-labelledby="variant-selector-title">
            <legend id="variant-selector-title" className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Elige una opción
            </legend>
            <div className="space-y-2">
                {variants.map((variant) => (
                    <button
                        key={variant.id}
                        role="radio"
                        aria-checked={selectedVariant === variant.id}
                        onClick={() => onSelect(variant.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary outline-none ${selectedVariant === variant.id ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                        <span>{variant.name}</span>
                        <span className={selectedVariant === variant.id ? "font-bold" : ""}>
                            {formatCurrency(Number(variant.price))}
                        </span>
                    </button>
                ))}
            </div>
        </fieldset>
    )
}
