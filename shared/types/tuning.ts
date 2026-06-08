import type { UsageType } from './vehicle';

// 轮胎参数
export interface TireParams {
  frontPressure: number; // 前轮胎气压 PSI (16-40)
  rearPressure: number;  // 后轮胎气压 PSI (16-40)
}

// 定位参数
export interface AlignmentParams {
  frontCamber: number; // 前轮外倾角 (-5 ~ +5)
  rearCamber: number;  // 后轮外倾角 (-5 ~ +5)
  frontToe: number;    // 前束角 (-0.5 ~ +0.5)
  rearToe: number;     // 后束角 (-0.5 ~ +0.5)
  caster: number;      // 主销后倾角 (0 ~ 7)
}

// 弹簧参数
export interface SpringParams {
  frontRate: number;   // 前弹簧刚度
  rearRate: number;    // 后弹簧刚度
  frontHeight: number; // 前车身高度
  rearHeight: number;  // 后车身高度
}

// 阻尼参数
export interface DampingParams {
  frontRebound: number; // 前回弹阻尼 (1-20)
  rearRebound: number;  // 后回弹阻尼 (1-20)
  frontBump: number;    // 前压缩阻尼 (1-20)
  rearBump: number;     // 后压缩阻尼 (1-20)
}

// 防倾杆参数
export interface AntirollBarParams {
  front: number; // 前防倾杆 (1-65)
  rear: number;  // 后防倾杆 (1-65)
}

// 空气动力学参数
export interface AeroParams {
  frontDownforce: number | null; // 前下压力
  rearDownforce: number | null;  // 后下压力
}

// 制动参数
export interface BrakeParams {
  brakeForce: number;   // 制动力 % (50-150)
  brakeBalance: number; // 制动力分配 % 前 (0-100)
}

// 差速器参数
export interface DifferentialParams {
  frontAccel: number | null; // 前差速器加速 (0-100), FWD/AWD
  frontDecel: number | null; // 前差速器减速 (0-100), FWD/AWD
  rearAccel: number;        // 后差速器加速 (0-100)
  rearDecel: number;        // 后差速器减速 (0-100)
  center: number | null;    // 中央差速器 (0-100), AWD
}

// 变速箱参数
export interface GearingParams {
  finalDrive: number;     // 终传比
  gears?: number[];       // 各挡齿比
}

// 完整调校参数
export interface TuningParameters {
  tires: TireParams;
  alignment: AlignmentParams;
  springs: SpringParams;
  damping: DampingParams;
  antirollBars: AntirollBarParams;
  aero: AeroParams;
  brakes: BrakeParams;
  differential: DifferentialParams;
  gearing: GearingParams;
}

// 性能评分
export interface TuneRatings {
  handling: number;     // 操控 (0-10)
  acceleration: number; // 加速 (0-10)
  topSpeed: number;     // 极速 (0-10)
  braking: number;      // 制动 (0-10)
  stability: number;    // 稳定 (0-10)
}

// 调校方案
export interface TuneSetup {
  id: string;
  vehicleId: string;
  name: string;
  usageType: UsageType;
  description: string;
  isAiGenerated: boolean;
  parameters: TuningParameters;
  tags: string[];
  ratings: TuneRatings;
  createdAt: string;
  updatedAt: string;
}

// 调校修订记录
export interface TuneRevision {
  id: string;
  tuneId: string;
  revisionNumber: number;
  changedFields: Record<string, { old: number | string | null; new: number | string | null }>;
  changeReason: string;
  createdAt: string;
}

// 性能测试结果
export interface PerformanceTest {
  id: string;
  tuneId: string;
  lapTime: number | null;       // 圈速（秒）
  trackName: string | null;     // 赛道名称
  zeroToHundred: number | null; // 0-100km/h（秒）
  topSpeed: number | null;      // 最高时速 km/h
  brakingDistance: number | null; // 制动距离 m
  notes: string;
  testedAt: string;
}
