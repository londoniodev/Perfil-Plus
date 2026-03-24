import React from 'react';

export function useTenant() {
  return {
    tenantId: '6786a344714f3ead406981ee',
    slug: 'mauro', // This can be dynamic if we want but static is fine for now
    features: ['RESTAURANT', 'MARKETING']
  };
}

export function TenantProvider({ children }: any) {
  return <>{children}</>;
}
