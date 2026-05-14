import React from 'react';

export function useTenant() {
  const slug = (global as any).currentTenantSlug ?? 'cocinasiete';
  return {
    tenantId: '6786a344714f3ead406981ee',
    slug,
    features: ['RESTAURANT', 'MARKETING']
  };
}

export function TenantProvider({ children }: any) {
  return <>{children}</>;
}
