import { z } from 'zod';

// 调校参数 Schema
export const tuningParametersSchema = z.object({
  tires: z.object({
    frontPressure: z.number().min(16).max(40).describe('前轮胎气压 PSI'),
    rearPressure: z.number().min(16).max(40).describe('后轮胎气压 PSI'),
  }),
  alignment: z.object({
    frontCamber: z.number().min(-5).max(5).describe('前轮外倾角'),
    rearCamber: z.number().min(-5).max(5).describe('后轮外倾角'),
    frontToe: z.number().min(-0.5).max(0.5).describe('前束角'),
    rearToe: z.number().min(-0.5).max(0.5).describe('后束角'),
    caster: z.number().min(0).max(7).describe('主销后倾角'),
  }),
  springs: z.object({
    frontRate: z.number().describe('前弹簧刚度'),
    rearRate: z.number().describe('后弹簧刚度'),
    frontHeight: z.number().describe('前车身高度'),
    rearHeight: z.number().describe('后车身高度'),
  }),
  damping: z.object({
    frontRebound: z.number().min(1).max(20).describe('前回弹阻尼'),
    rearRebound: z.number().min(1).max(20).describe('后回弹阻尼'),
    frontBump: z.number().min(1).max(20).describe('前压缩阻尼'),
    rearBump: z.number().min(1).max(20).describe('后压缩阻尼'),
  }),
  antirollBars: z.object({
    front: z.number().min(1).max(65).describe('前防倾杆'),
    rear: z.number().min(1).max(65).describe('后防倾杆'),
  }),
  aero: z.object({
    frontDownforce: z.number().nullable().describe('前下压力'),
    rearDownforce: z.number().nullable().describe('后下压力'),
  }),
  brakes: z.object({
    brakeForce: z.number().min(50).max(150).describe('制动力 %'),
    brakeBalance: z.number().min(0).max(100).describe('制动力分配 % (前)'),
  }),
  differential: z.object({
    frontAccel: z.number().min(0).max(100).nullable().describe('前差速器加速'),
    frontDecel: z.number().min(0).max(100).nullable().describe('前差速器减速'),
    rearAccel: z.number().min(0).max(100).describe('后差速器加速'),
    rearDecel: z.number().min(0).max(100).describe('后差速器减速'),
    center: z.number().min(0).max(100).nullable().describe('中央差速器 (AWD)'),
  }),
  gearing: z.object({
    finalDrive: z.number().describe('终传比'),
    gears: z.array(z.number()).optional().describe('各挡齿比'),
  }),
});

// 完整调校方案 Schema
export const tuneSetupSchema = z.object({
  name: z.string().describe('方案名称'),
  usageType: z.enum(['竞速', '越野', '漂移', '拉力赛', '日常驾驶', '直线加速']),
  description: z.string().describe('方案说明和调整理由'),
  parameters: tuningParametersSchema,
  ratings: z.object({
    handling: z.number().min(0).max(10),
    acceleration: z.number().min(0).max(10),
    topSpeed: z.number().min(0).max(10),
    braking: z.number().min(0).max(10),
    stability: z.number().min(0).max(10),
  }),
  tags: z.array(z.string()).describe('标签'),
});
