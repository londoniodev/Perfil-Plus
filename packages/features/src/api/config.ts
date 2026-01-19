/**
 * API Configuration
 * 
 * This module provides centralized configuration for API endpoints.
 * Each client app should configure the API_BASE via environment variables.
 */

export interface ApiConfig {
    baseUrl: string;
    credentials?: RequestCredentials;
    revalidate?: number;
}

// Default configuration - apps can override by importing and modifying
let apiConfig: ApiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api",
    credentials: 'include',
    revalidate: 60,
};

/**
 * Configure the API client with custom settings
 */
export function configureApi(config: Partial<ApiConfig>): void {
    apiConfig = { ...apiConfig, ...config };
}

/**
 * Get current API configuration
 */
export function getApiConfig(): ApiConfig {
    return apiConfig;
}

/**
 * Get the base URL for API calls
 */
export function getApiBaseUrl(): string {
    return apiConfig.baseUrl;
}


