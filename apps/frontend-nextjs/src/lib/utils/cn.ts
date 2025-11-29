/**
 * Tailwind CSS 类名合并工具
 * Utility for merging Tailwind CSS classes
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * 合并类名（兼容条件类名和数组）
 * @param inputs - 类名输入
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}




