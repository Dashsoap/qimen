/**
 * 奇门遁甲常量定义
 * Qimen Dunjia constants
 */

import type { Bagua, GongIndex } from '@/types/qimen';

/**
 * 宫位编码映射
 */
export const GONGS_CODE: Record<GongIndex, Bagua> = {
  '一': '坎',
  '二': '坤',
  '三': '震',
  '四': '巽',
  '五': '中',
  '六': '乾',
  '七': '兑',
  '八': '艮',
  '九': '离',
} as const;

/**
 * 地支盘（每个宫位对应的地支）
 */
export const DIZHI_PAN: Record<Bagua, string[]> = {
  '坎': ['子'],
  '艮': ['丑', '寅'],
  '震': ['卯'],
  '巽': ['辰', '巳'],
  '离': ['午'],
  '坤': ['未', '申'],
  '兑': ['酉'],
  '乾': ['戌', '亥'],
  '中': [],
} as const;

/**
 * 八神全称映射
 */
export const BASHEN_FULLNAME: Record<string, string> = {
  '符': '值符',
  '蛇': '腾蛇',
  '阴': '太阴',
  '合': '六合',
  '虎': '白虎',
  '武': '玄武',
  '玄': '玄武',
  '地': '九地',
  '天': '九天',
  '太阴': '太阴',
  '六合': '六合',
  '白虎': '白虎',
  '玄武': '玄武',
  '九地': '九地',
  '九天': '九天',
  '值符': '值符',
  '腾蛇': '腾蛇',
} as const;

/**
 * 九星全称映射
 */
export const JIUXING_FULLNAME: Record<string, string> = {
  '蓬': '天蓬',
  '芮': '天芮',
  '冲': '天冲',
  '辅': '天辅',
  '禽': '天禽',
  '心': '天心',
  '柱': '天柱',
  '任': '天任',
  '英': '天英',
} as const;

/**
 * 繁简体转换映射
 */
export const TRADITIONAL_TO_SIMPLIFIED: Record<string, string> = {
  '休': '休',
  '死': '死',
  '伤': '伤',
  '杜': '杜',
  '开': '开',
  '惊': '惊',
  '生': '生',
  '景': '景',
  '蓬': '蓬',
  '芮': '芮',
  '冲': '冲',
  '辅': '辅',
  '禽': '禽',
  '心': '心',
  '柱': '柱',
  '任': '任',
  '英': '英',
  '马': '马',
  '天马': '天马',
  '丁马': '丁马',
  '驿马': '驿马',
  '空亡宫': '空亡宫',
  '空亡': '空亡',
} as const;

/**
 * 获取八神全称
 */
export function getBashenFullName(shortName: string): string {
  return BASHEN_FULLNAME[shortName] || shortName;
}

/**
 * 获取九星全称
 */
export function getJiuxingFullName(shortName: string): string {
  const simplified = TRADITIONAL_TO_SIMPLIFIED[shortName] || shortName;
  return JIUXING_FULLNAME[simplified] || shortName;
}

/**
 * 简化文本（繁转简）
 */
export function simplifyText(text: string): string {
  return TRADITIONAL_TO_SIMPLIFIED[text] || text;
}

/**
 * 格式化马星信息
 */
export function formatHorseInfo(horseInfo: any, bagua: Bagua): string {
  const ma = horseInfo?.['马星'];
  if (!ma || !DIZHI_PAN[bagua]) return '';
  return DIZHI_PAN[bagua].includes(ma) ? '🐎' : '';
}

/**
 * 获取空亡标识
 */
export function getKongWang(viewData: any, bagua: Bagua): string {
  const kongwang = viewData?.['旬空'];
  if (!kongwang || !DIZHI_PAN[bagua]) return '';
  const kongwang_list = kongwang.split('');
  if (DIZHI_PAN[bagua].some(dizhi => kongwang_list.includes(dizhi))) {
    return 'O';
  }
  return '';
}




