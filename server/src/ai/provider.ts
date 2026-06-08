import { createOpenAI } from '@ai-sdk/openai';

interface ProviderConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

export function createProvider(config: ProviderConfig) {
  const openai = createOpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });
  return openai(config.model);
}
