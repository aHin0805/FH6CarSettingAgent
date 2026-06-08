import { z } from 'zod';
import { tool, generateText } from 'ai';
import { createProvider } from './provider';
import { getDeepModelConfig } from './config';
import { tuneGenerationPrompt, tuneComparisonPrompt } from './prompts/deep-tasks';

export const tuningTools = {
  generateTune: tool({
    description: '根据车辆信息和用途生成完整的调校方案。当用户描述了车辆和需求后，使用此工具生成结构化的调校参数。',
    parameters: z.object({
      vehicleBrand: z.string().describe('车辆品牌，如 "BMW"'),
      vehicleModel: z.string().describe('车型，如 "M4"'),
      vehicleYear: z.number().optional().describe('年份，如 2023'),
      usageType: z.enum(['竞速', '越野', '漂移', '拉力赛', '日常驾驶', '直线加速']).describe('用途分类'),
      drivingStyle: z.enum(['激进', '平衡', '保守']).describe('驾驶风格'),
      problems: z.array(z.string()).optional().describe('当前遇到的问题列表'),
      drivetrain: z.enum(['FWD', 'RWD', 'AWD']).optional().describe('驱动形式'),
    }),
    execute: async (params) => {
      // ===== 多模型路由：调用深度模型生成调校方案 =====
      try {
        const deepConfig = getDeepModelConfig();
        const deepProvider = createProvider(deepConfig);

        const { text } = await generateText({
          model: deepProvider,
          system: tuneGenerationPrompt,
          prompt: `请为以下车辆生成调校方案：
车辆：${params.vehicleBrand} ${params.vehicleModel} ${params.vehicleYear || ''}
用途：${params.usageType}
驾驶风格：${params.drivingStyle}
驱动形式：${params.drivetrain || '未指定'}
当前问题：${params.problems?.join('、') || '无'}`,
          maxTokens: deepConfig.maxTokens,
        });

        return {
          success: true,
          message: `已为 ${params.vehicleBrand} ${params.vehicleModel} 生成${params.usageType}调校方案`,
          tuneData: text,
          params,
        };
      } catch (err) {
        // 深度模型调用失败时 fallback
        console.error('[FH6] 深度模型调校生成失败:', (err as Error).message);
        return {
          success: false,
          message: `调校方案生成遇到问题，请稍后重试: ${(err as Error).message}`,
          params,
        };
      }
    },
  }),

  saveTune: tool({
    description: '保存调校方案到用户记录。当用户确认要保存当前方案时使用。',
    parameters: z.object({
      tuneName: z.string().describe('方案名称'),
      vehicleInfo: z.string().describe('车辆信息描述'),
    }),
    execute: async (params) => {
      // 轻量操作，不需要深度模型
      return {
        success: true,
        message: `调校方案「${params.tuneName}」已保存`,
        params,
      };
    },
  }),

  compareTunes: tool({
    description: '对比两个调校方案的参数差异。当用户想比较不同方案时使用。',
    parameters: z.object({
      tuneA: z.string().describe('方案A名称'),
      tuneB: z.string().describe('方案B名称'),
      focusArea: z.string().optional().describe('重点关注领域'),
    }),
    execute: async (params) => {
      // ===== 多模型路由：调用深度模型进行对比分析 =====
      try {
        const deepConfig = getDeepModelConfig();
        const deepProvider = createProvider(deepConfig);

        const { text } = await generateText({
          model: deepProvider,
          system: tuneComparisonPrompt,
          prompt: `请对比以下两个调校方案：
方案A：${params.tuneA}
方案B：${params.tuneB}
重点关注：${params.focusArea || '全面对比'}`,
          maxTokens: deepConfig.maxTokens,
        });

        return {
          success: true,
          message: `正在对比方案「${params.tuneA}」和「${params.tuneB}」`,
          comparisonData: text,
          params,
        };
      } catch (err) {
        console.error('[FH6] 深度模型对比分析失败:', (err as Error).message);
        return {
          success: false,
          message: `方案对比遇到问题，请稍后重试: ${(err as Error).message}`,
          params,
        };
      }
    },
  }),
};
