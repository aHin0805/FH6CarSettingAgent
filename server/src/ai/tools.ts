import { z } from 'zod';
import { tool } from 'ai';
import { tuneSetupSchema } from './schemas';

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
      // 这个工具的 execute 在后端不会被真正调用
      // AI 会自行生成结构化输出，前端负责解析和展示
      // 返回确认信息
      return {
        success: true,
        message: `已为 ${params.vehicleBrand} ${params.vehicleModel} 生成${params.usageType}调校方案`,
        params,
      };
    },
  }),

  saveTune: tool({
    description: '保存调校方案到用户记录。当用户确认要保存当前方案时使用。',
    parameters: z.object({
      tuneName: z.string().describe('方案名称'),
      vehicleInfo: z.string().describe('车辆信息描述'),
    }),
    execute: async (params) => {
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
      return {
        success: true,
        message: `正在对比方案「${params.tuneA}」和「${params.tuneB}」`,
        params,
      };
    },
  }),
};
