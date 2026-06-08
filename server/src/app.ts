import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat';

export const app = express();

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    code: 0,
    data: {
      status: 'ok',
      aiModel: process.env.AI_MODEL || 'deepseek-chat',
      aiBaseURL: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
      hasApiKey: !!(process.env.AI_API_KEY),
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
