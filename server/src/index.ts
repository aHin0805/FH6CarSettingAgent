import 'dotenv/config';
import { app } from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[FH6 Server] 后端服务已启动: http://localhost:${PORT}`);
  console.log(`[FH6 Server] AI 模型: ${process.env.AI_MODEL || 'deepseek-chat'}`);
  console.log(`[FH6 Server] AI 端点: ${process.env.AI_BASE_URL || 'https://api.deepseek.com/v1'}`);
});
