import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CustomerData {
    customerName: string
    customerPhone: string
    address: string
    lat?: number
    lng?: number
}

interface CustomerStore {
    data: CustomerData | null
    setCustomerData: (data: CustomerData) => void
    clearCustomerData: () => void
}

export const useCustomer = create<CustomerStore>()(
    persist(
        (set) => ({
            data: null,

            setCustomerData: (data) => set({ data }),

            clearCustomerData: () => set({ data: null }),
        }),
        {
            name: 'customer-data',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
