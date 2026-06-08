import { createOpenAI } from '@ai-sdk/openai';
import type { ModelConfig } from './config';

/** 根据配置创建 AI SDK 语言模型实例 */
export function createProvider(config: ModelConfig) {
  const openai = createOpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });
  return openai(config.model);
}
