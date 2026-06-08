// AI Provider 类型
export type AIProviderType = 'deepseek' | 'openai' | 'ollama' | 'custom';

// 任务类型
export type TaskType = 'light' | 'deep';

// AI 配置（前端不含 apiKey，安全考虑）
export interface AIProviderConfig {
  type: AIProviderType;
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// 默认轻量模型配置
export const DEFAULT_LIGHT_CONFIG: AIProviderConfig = {
  type: 'deepseek',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-v4-flash',
  temperature: 0.7,
  maxTokens: 4096,
};

// 默认深度模型配置
export const DEFAULT_DEEP_CONFIG: AIProviderConfig = {
  type: 'deepseek',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-v4-pro',
  temperature: 0.3,
  maxTokens: 8192,
};

// 兼容旧代码
export const DEFAULT_AI_CONFIG = DEFAULT_LIGHT_CONFIG;

// 后端模型信息（从 /api/models 获取）
export interface BackendModelInfo {
  id: 'light' | 'deep';
  name: string;
  label: string;
  description: string;
  available: boolean;
}

// 对话消息角色
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// 工具调用
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

// 工具结果
export interface ToolResult {
  toolCallId: string;
  result: unknown;
}

// 对话消息
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  attachedTuneId?: string;
  createdAt: string;
}

// 对话会话
export interface ChatSession {
  id: string;
  title: string;
  vehicleId?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// API 请求/响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// Chat API 请求
export interface ChatRequest {
  messages: { role: MessageRole; content: string }[];
  sessionId?: string;
  vehicleId?: string;
  taskType?: TaskType;
}
