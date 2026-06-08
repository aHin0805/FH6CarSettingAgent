import 'dotenv/config';
import { app } from './app';
import { getLightModelConfig, getDeepModelConfig } from './ai/config';

const PORT = process.env.PORT || 3001;

// 启动前检查关键配置
const light = getLightModelConfig();
const deep = getDeepModelConfig();

const errors: string[] = [];
const warnings: string[] = [];

if (!light.apiKey) {
  errors.push('AI_API_KEY 未配置，AI 对话功能不可用');
}
if (!deep.apiKey) {
  warnings.push('AI_DEEP_API_KEY 未配置，深度模型将复用轻量模型 Key');
}

if (errors.length > 0) {
  console.error('\n❌ 启动检查失败：');
  errors.forEach(e => console.error(`   • ${e}`));
  console.error('   请在 server/.env 中配置相关变量后重启服务\n');
}
if (warnings.length > 0) {
  console.warn('\n⚠️  配置警告：');
  warnings.forEach(w => console.warn(`   • ${w}`));
  console.warn('');
}

app.listen(PORT, () => {
  console.log(`[FH6 Server] 后端服务已启动: http://localhost:${PORT}`);
  console.log(`[FH6 Server] 轻量模型: ${light.model} @ ${light.baseURL} ${light.apiKey ? '✅' : '❌'}`);
  console.log(`[FH6 Server] 深度模型: ${deep.model} @ ${deep.baseURL} ${deep.apiKey ? '✅' : '⚠️ 复用轻量Key'}`);
});
