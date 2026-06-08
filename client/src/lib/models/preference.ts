import type { UsageType } from './vehicle';

// 驾驶风格
export type DrivingStyle = '激进' | '平衡' | '保守';

// 用户偏好
export interface UserPreference {
  defaultDrivingStyle: DrivingStyle;
  preferredUsageTypes: UsageType[];
  tuningStyleTendencies: {
    suspensionStiffness: '偏硬' | '适中' | '偏软';
    differentialLock: '偏紧' | '适中' | '偏松';
    aeroPreference: '高下压' | '适中' | '低下压';
    brakeBias: '偏前' | '适中' | '偏后';
  };
  commonProblemPatterns: string[];
  tuneHistoryStats: {
    totalTunes: number;
    byUsageType: Record<UsageType, number>;
    averageRatings: {
      handling: number;
      acceleration: number;
      topSpeed: number;
      braking: number;
      stability: number;
    };
  };
}

// 默认用户偏好
export const DEFAULT_USER_PREFERENCE: UserPreference = {
  defaultDrivingStyle: '平衡',
  preferredUsageTypes: ['竞速'],
  tuningStyleTendencies: {
    suspensionStiffness: '适中',
    differentialLock: '适中',
    aeroPreference: '适中',
    brakeBias: '适中',
  },
  commonProblemPatterns: [],
  tuneHistoryStats: {
    totalTunes: 0,
    byUsageType: {
      '竞速': 0,
      '越野': 0,
      '漂移': 0,
      '拉力赛': 0,
      '日常驾驶': 0,
      '直线加速': 0,
    },
    averageRatings: {
      handling: 0,
      acceleration: 0,
      topSpeed: 0,
      braking: 0,
      stability: 0,
    },
  },
};
