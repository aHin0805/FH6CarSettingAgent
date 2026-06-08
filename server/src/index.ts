import 'dotenv/config';
import { app } from './app';
import { getLightModelConfig, getDeepModelConfig } from './ai/config';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  const light = getLightModelConfig();
  const deep = getDeepModelConfig();
  console.log(`[FH6 Server] 后端服务已启动: http://localhost:${PORT}`);
  console.log(`[FH6 Server] 轻量模型: ${light.model} @ ${light.baseURL}`);
  console.log(`[FH6 Server] 深度模型: ${deep.model} @ ${deep.baseURL}`);
});
