"use client"

import { WhatsAppEmbeddedSignup } from "@/components/admin/whatsapp/embedded-signup"

interface MetaConectarClientProps {
  tenantId: string
  returnUrl?: string
}

export function MetaConectarClient({ tenantId, returnUrl }: MetaConectarClientProps) {
  return (
    <WhatsAppEmbeddedSignup
      tenantId={tenantId}
      returnUrl={returnUrl}
    />
  )
}
