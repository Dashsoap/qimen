/**
 * useResponsive Hook
 * 提供响应式断点状态
 */

'use client';

import { useMediaQuery } from './useMediaQuery';
import { MEDIA_QUERIES } from '@/constants/breakpoints';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop' | 'large';
}

/**
 * 响应式断点 Hook
 * 返回当前屏幕尺寸对应的断点状态
 */
export function useResponsive(): ResponsiveState {
  // 使用 Tailwind 断点
  const isMd = useMediaQuery(MEDIA_QUERIES.md);
  const isLg = useMediaQuery(MEDIA_QUERIES.lg);
  const isXl = useMediaQuery(MEDIA_QUERIES.xl);

  // 确定设备类型
  const isMobile = !isMd; // < 768px
  const isTablet = isMd && !isLg; // 768px - 1023px
  const isDesktop = isLg && !isXl; // 1024px - 1279px
  const isLargeDesktop = isXl; // >= 1280px

  // 确定当前断点
  let currentBreakpoint: ResponsiveState['currentBreakpoint'] = 'mobile';
  if (isLargeDesktop) {
    currentBreakpoint = 'large';
  } else if (isDesktop) {
    currentBreakpoint = 'desktop';
  } else if (isTablet) {
    currentBreakpoint = 'tablet';
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint,
  };
}

/**
 * 快捷方式：仅检查是否为移动端
 */
export function useIsMobile(): boolean {
  return useMediaQuery(MEDIA_QUERIES.maxMd);
}

/**
 * 快捷方式：仅检查是否为桌面端
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(MEDIA_QUERIES.lg);
}

