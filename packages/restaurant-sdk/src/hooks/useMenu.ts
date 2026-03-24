"use client"

import useSWR from 'swr'

import { PublicCategory, PublicProduct } from '../types'

export interface PublicRestaurant {
    name: string
    slug: string
    logo: string | null
    slogan: string | null
    coverVideo: string | null
    phone?: string | null
    address?: string | null // Added address
    social?: {
        whatsapp?: string
        instagram?: string
        facebook?: string
        twitter?: string
        youtube?: string
        tiktok?: string
    }
}

// We import PublicCategory now

// Basic fetcher
const fetcher = async ([url]: [string, string]) => {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch menu')
    return res.json()
}

export function useMenu(tenantId: string) {
    // Connect to real API running on port 3001
    // In production, this URL should be an env var
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    const { data, error, isLoading } = useSWR(
        tenantId ? [`${apiUrl}/public/restaurant/${tenantId}/menu`, tenantId] : null,
        fetcher
    )

    return {
        categories: (data?.categories || []) as PublicCategory[],
        products: (data?.products || []) as PublicProduct[],
        restaurant: data?.restaurant,
        isLoading,
        isError: error
    }
}
