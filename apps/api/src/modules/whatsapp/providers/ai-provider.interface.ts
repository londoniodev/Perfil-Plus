export interface AiResponse {
  text: string;
  checkoutUrl?: string;
  productImages?: { url: string; caption: string }[];
  handoffTriggered?: boolean;
}

export interface AiProvider {
  generateResponse(
    tenantId: string,
    systemContext: string,
    history: { role: 'USER' | 'ASSISTANT'; content: string }[],
    userMessage: string,
    customerPhone?: string,
    tenantSlug?: string,
  ): Promise<AiResponse>;
}
