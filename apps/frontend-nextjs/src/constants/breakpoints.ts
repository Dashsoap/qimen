/**
 * 响应式断点常量
 * Responsive breakpoints constants
 */

/**
 * Tailwind 默认断点（与 tailwind.config.js 保持一致）
 */
export const BREAKPOINTS = {
  sm: 640,   // 移动端（小屏）
  md: 768,   // 平板
  lg: 1024,  // 桌面端
  xl: 1280,  // 大屏
  '2xl': 1536, // 超大屏
} as const;

/**
 * 媒体查询字符串
 */
export const MEDIA_QUERIES = {
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  
  // 最大宽度查询
  maxSm: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  maxMd: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  maxLg: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  
  // 范围查询
  smToMd: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  mdToLg: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
} as const;

/**
 * 设备类型判断
 */
export const DEVICE_TYPES = {
  mobile: MEDIA_QUERIES.maxMd,      // 移动端：< 768px
  tablet: MEDIA_QUERIES.smToMd,     // 平板：640px - 767px
  desktop: MEDIA_QUERIES.lg,        // 桌面端：>= 1024px
} as const;

/**
 * 断点类型
 */
export type Breakpoint = keyof typeof BREAKPOINTS;
export type MediaQuery = keyof typeof MEDIA_QUERIES;
export type DeviceType = keyof typeof DEVICE_TYPES;




