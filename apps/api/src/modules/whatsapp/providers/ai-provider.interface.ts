export interface AiResponse {
  text: string;
  checkoutUrl?: string;
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
