import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Branch {
    id: string
    name: string
    isDefault: boolean
}

interface BranchState {
    currentBranchId: string | null
    branches: Branch[]
    setBranch: (id: string) => void
    setBranches: (branches: Branch[]) => void
}

export const useBranchStore = create<BranchState>()(
    persist(
        (set) => ({
            currentBranchId: null,
            branches: [],
            setBranch: (id: string) => {
                set({ currentBranchId: id });
                if (typeof document !== 'undefined') {
                    document.cookie = `x-branch-id=${id}; path=/; max-age=31536000; SameSite=Lax`;
                }
            },
            setBranches: (branches) => {
                set({ branches });
                // Si no hay branch seleccionado, elegir el default
                const defaultBranch = branches.find(b => b.isDefault) || branches[0];
                if (defaultBranch && !branches.some(b => b.id === defaultBranch.id)) {
                   // No hacer nada si el seleccionado ya no existe en la lista
                }
            },
        }),
        {
            name: 'branch-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
