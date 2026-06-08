import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat';
import { getLightModelConfig, getDeepModelConfig } from './ai/config';

export const app = express();

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

// 健康检查
app.get('/api/health', (_req, res) => {
  const light = getLightModelConfig();
  const deep = getDeepModelConfig();
  res.json({
    code: 0,
    data: {
      status: 'ok',
      lightModel: light.model,
      deepModel: deep.model,
      hasApiKey: !!light.apiKey,
      hasDeepApiKey: !!deep.apiKey,
    },
    message: 'success',
  });
});

// 获取可用模型列表（前端用于展示模型选择器）
app.get('/api/models', (_req, res) => {
  const light = getLightModelConfig();
  const deep = getDeepModelConfig();
  res.json({
    code: 0,
    data: {
      models: [
        {
          id: 'light',
          name: light.model,
          label: '⚡ 日常对话',
          description: '轻量模型，响应快，适合日常问答',
          available: !!light.apiKey,
        },
        {
          id: 'deep',
          name: deep.model,
          label: '🧠 深度分析',
          description: '深度模型，推理强，适合调校方案生成和复杂分析',
          available: !!deep.apiKey,
        },
      ],
    },
    message: 'success',
  });
});

// 路由
app.use('/api/chat', chatRouter);

// 错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[FH6 Server] Error:', err.message);
  res.status(500).json({
    code: 500,
    data: null,
    message: err.message || '服务器内部错误',
  });
});
