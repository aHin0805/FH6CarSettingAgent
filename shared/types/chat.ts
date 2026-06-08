// AI Provider 类型
export type AIProviderType = 'deepseek' | 'openai' | 'ollama' | 'custom';

// AI 配置
export interface AIProviderConfig {
  type: AIProviderType;
  baseURL: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// 默认 AI 配置
export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  type: 'deepseek',
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 4096,
};

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
}
