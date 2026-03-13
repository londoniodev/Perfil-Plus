export interface AiProvider {
  generateResponse(
    tenantId: string, // útil para loguear o tracear consumos
    systemContext: string,
    history: { role: 'USER' | 'ASSISTANT'; content: string }[],
    userMessage: string,
    customerPhone?: string,
    tenantSlug?: string,
  ): Promise<string>;
}
