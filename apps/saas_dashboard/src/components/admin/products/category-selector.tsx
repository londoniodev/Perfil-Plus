"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Edit2, Trash2, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, Input } from "@alvarosky/ui"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@alvarosky/ui"
import { useCategories } from "@/hooks"

interface Category {
    id: string
    name: string
}

interface CategorySelectorProps {
    value?: string[]
    onChange: (value: string[]) => void
}

export function CategorySelector({ value = [], onChange }: CategorySelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [editValue, setEditValue] = React.useState("")

    const {
        categories,
        loading,
        initialLoading,
        handleCreate,
        handleUpdate,
        handleDelete: handleDeleteCategory
    } = useCategories()

    const onCreateCategory = async () => {
        const result = await handleCreate(inputValue, (cat) => {
            onChange([...value, cat.id])
            setInputValue("")
        })
    }

    const toggleCategory = (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const newValue = value.includes(id)
            ? value.filter((v) => v !== id)
            : [...value, id]
        onChange(newValue)
    }

    const startEdit = (e: React.MouseEvent, category: Category) => {
        e.preventDefault()
        e.stopPropagation()
        setEditingId(category.id)
        setEditValue(category.name)
    }

    const saveEdit = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const success = await handleUpdate(editingId!, editValue, () => {
            setEditingId(null)
        })
    }

    const cancelEdit = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setEditingId(null)
        setEditValue("")
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()

        await handleDeleteCategory(id, () => {
            if (value.includes(id)) {
                onChange(value.filter(v => v !== id))
            }
        })
    }

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(inputValue.toLowerCase())
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value.length > 0
                        ? `${value.length} seleccionadas`
                        : "Seleccionar categorías..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <div className="flex flex-col overflow-hidden rounded-md border text-popover-foreground shadow-md outline-none">
                    <div className="border-b px-3 py-2">
                        <Input
                            placeholder="Buscar o crear categoría..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="h-8 shadow-none focus-visible:ring-0 border-none px-0"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
                        {initialLoading ? (
                            <div className="py-6 flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="py-6 text-center text-sm">
                                <p className="text-muted-foreground mb-4">No encontrada.</p>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="w-[90%] mx-auto"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onCreateCategory();
                                    }}
                                    disabled={loading}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear "{inputValue}"
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        onClick={(e) => {
                                            if (editingId !== category.id) toggleCategory(category.id, e)
                                        }}
                                        className={cn(
                                            "group relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                            value.includes(category.id) && "bg-accent"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                value.includes(category.id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />

                                        {editingId === category.id ? (
                                            <div
                                                className="flex items-center gap-1 flex-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Input
                                                    className="h-7 w-full min-w-[120px] px-2 text-xs"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit((e as unknown) as React.MouseEvent)
                                                        if (e.key === 'Escape') cancelEdit((e as unknown) as React.MouseEvent)
                                                    }}
                                                />
                                                <Button type="button" size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={saveEdit}>
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                                <Button type="button" size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={cancelEdit}>
                                                    <X className="h-3 w-3 text-destructive" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="flex-1 truncate">{category.name}</span>
                                        )}

                                        {editingId !== category.id && (
                                            <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 shrink-0"
                                                    onClick={(e) => startEdit(e, category)}
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => handleDelete(e, category.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
