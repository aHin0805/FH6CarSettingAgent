// 车辆用途分类
export type UsageType = '竞速' | '越野' | '漂移' | '拉力赛' | '日常驾驶' | '直线加速';

// 驱动形式
export type Drivetrain = 'FWD' | 'RWD' | 'AWD';

// 引擎布局
export type EngineLayout = '前置' | '中置' | '后置';

// 进气方式
export type Aspiration = '自然吸气' | '涡轮增压' | '机械增压' | '双涡轮增压';

// 车辆等级
export type CarClass = 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X';

// 车辆信息
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  drivetrain: Drivetrain;
  engineLayout: EngineLayout;
  aspiration: Aspiration;
  piScore: number;
  carClass: CarClass;
  createdAt: string;
  updatedAt: string;
}
