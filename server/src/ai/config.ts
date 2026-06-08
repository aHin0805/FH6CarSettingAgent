/** 双模型配置 */

export interface ModelConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

/** 从环境变量解析轻量模型配置 */
export function getLightModelConfig(): ModelConfig {
  return {
    apiKey: process.env.AI_API_KEY || '',
    baseURL: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
    model: process.env.AI_MODEL || 'deepseek-v4-flash',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096', 10),
  };
}

/** 从环境变量解析深度模型配置，留空项 fallback 到轻量模型 */
export function getDeepModelConfig(): ModelConfig {
  const light = getLightModelConfig();
  return {
    apiKey: process.env.AI_DEEP_API_KEY || light.apiKey,
    baseURL: process.env.AI_DEEP_BASE_URL || light.baseURL,
    model: process.env.AI_DEEP_MODEL || 'deepseek-v4-pro',
    temperature: parseFloat(process.env.AI_DEEP_TEMPERATURE || '0.3'),
    maxTokens: parseInt(process.env.AI_DEEP_MAX_TOKENS || '8192', 10),
  };
}
