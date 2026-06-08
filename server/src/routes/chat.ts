import express from 'express';
import { streamText } from 'ai';
import { createProvider } from '../ai/provider';
import { systemPrompt } from '../ai/prompts/system';
import { tuningTools } from '../ai/tools';

export const chatRouter = express.Router();

chatRouter.post('/', async (req, res) => {
  const { messages, sessionId } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.json({ code: 400, data: null, message: 'messages 不能为空' });
    return;
  }

  const apiKey = process.env.AI_API_KEY;
  const baseURL = process.env.AI_BASE_URL || 'https://api.deepseek.com/v1';
  const model = process.env.AI_MODEL || 'deepseek-chat';

  if (!apiKey) {
    res.json({ code: 401, data: null, message: 'AI API Key 未配置，请在 .env 文件中设置 AI_API_KEY' });
    return;
  }

  try {
    const provider = createProvider({ baseURL, apiKey, model });

    const result = streamText({
      model: provider,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
      tools: tuningTools,
      maxSteps: 5,
    });

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // 流式发送
    const stream = result.toDataStream();
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } finally {
      reader.releaseLock();
      res.end();
    }
  } catch (error) {
    const err = error as Error;
    console.error('[FH6 Server] Chat error:', err.message);
    
    // 如果响应头还没发送，返回 JSON 错误
    if (!res.headersSent) {
      res.json({ code: 500, data: null, message: `AI 调用失败: ${err.message}` });
    } else {
      // SSE 已经开始，发送错误事件
      res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
      res.end();
    }
  }
});
