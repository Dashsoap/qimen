/**
 * 颜色常量定义
 * Color constants for Qimen Dunjia theme
 */

import type { Wuxing, WuxingColorMap } from '@/types/qimen';

/**
 * 奇门遁甲主题颜色
 */
export const QIMEN_COLORS = {
  // 主色调
  gold: '#d4af37',      // 金色
  brown: '#753C15',     // 棕色
  cream: '#FEFDF7',     // 米黄色
  border: '#85754e',    // 边框色
  muted: '#999999',     // 灰色
  
  // 背景色
  bgDark: '#0a0a0a',    // 深色背景
  bgMuted: 'rgba(10, 10, 10, 0.9)',  // 半透明背景
  
  // 文字色
  textPrimary: '#d4af37',
  textSecondary: '#85754e',
  textMuted: 'rgba(133, 117, 78, 0.7)',
} as const;

/**
 * 五行颜色映射
 */
export const WUXING_COLORS: WuxingColorMap = {
  金: '#f28413',   // 金 - 橙金色
  木: '#167318',   // 木 - 绿色
  水: '#4499ff',   // 水 - 蓝色
  火: '#bf403a',   // 火 - 红色
  土: '#87561e',   // 土 - 土黄色
};

/**
 * 获取五行颜色
 */
export function getWuxingColor(wuxing: Wuxing): string {
  return WUXING_COLORS[wuxing] || QIMEN_COLORS.gold;
}

/**
 * 八门颜色映射（通过五行）
 */
export const BAMEN_WUXING_MAP = {
  '休': '水',
  '死': '土',
  '伤': '木',
  '杜': '木',
  '开': '金',
  '惊': '金',
  '生': '土',
  '景': '火',
} as const;

/**
 * 八神颜色映射（通过五行）
 */
export const BASHEN_WUXING_MAP = {
  '符': '土',
  '蛇': '火',
  '阴': '金',
  '合': '木',
  '虎': '金',
  '武': '水',
  '玄': '水',
  '地': '金',
  '天': '金',
} as const;

/**
 * 九星颜色映射（通过五行）
 */
export const JIUXING_WUXING_MAP = {
  '蓬': '水',
  '芮': '土',
  '冲': '木',
  '辅': '土',
  '禽': '土',
  '心': '金',
  '柱': '金',
  '任': '土',
  '英': '火',
} as const;

/**
 * 天干颜色映射（通过五行）
 */
export const TIANGAN_WUXING_MAP = {
  '甲': '木',
  '乙': '木',
  '丙': '火',
  '丁': '火',
  '戊': '土',
  '己': '土',
  '庚': '金',
  '辛': '金',
  '壬': '水',
  '癸': '水',
} as const;

/**
 * 地支颜色映射（通过五行）
 */
export const DIZHI_WUXING_MAP = {
  '子': '水',
  '丑': '土',
  '寅': '木',
  '卯': '木',
  '辰': '土',
  '巳': '火',
  '午': '火',
  '未': '土',
  '申': '金',
  '酉': '金',
  '戌': '土',
  '亥': '水',
} as const;

/**
 * 获取元素颜色（根据类型和值）
 */
export function getElementColor(
  type: '八门' | '八神' | '九星' | '天干' | '地支',
  value: string
): string {
  let wuxing: string | undefined;
  
  switch (type) {
    case '八门':
      wuxing = BAMEN_WUXING_MAP[value as keyof typeof BAMEN_WUXING_MAP];
      break;
    case '八神':
      wuxing = BASHEN_WUXING_MAP[value as keyof typeof BASHEN_WUXING_MAP];
      break;
    case '九星':
      wuxing = JIUXING_WUXING_MAP[value as keyof typeof JIUXING_WUXING_MAP];
      break;
    case '天干':
      wuxing = TIANGAN_WUXING_MAP[value as keyof typeof TIANGAN_WUXING_MAP];
      break;
    case '地支':
      wuxing = DIZHI_WUXING_MAP[value as keyof typeof DIZHI_WUXING_MAP];
      break;
  }
  
  if (wuxing && wuxing in WUXING_COLORS) {
    return WUXING_COLORS[wuxing as Wuxing];
  }
  
  return QIMEN_COLORS.gold;
}




