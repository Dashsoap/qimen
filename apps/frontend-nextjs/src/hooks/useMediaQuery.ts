/**
 * useMediaQuery Hook
 * 用于响应式媒体查询的自定义 Hook
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * 媒体查询 Hook
 * @param query - 媒体查询字符串，例如 '(min-width: 768px)'
 * @returns 是否匹配该媒体查询
 */
export function useMediaQuery(query: string): boolean {
  // SSR 时返回默认值
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // 仅在客户端执行
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // 设置初始值
    setMatches(mediaQuery.matches);

    // 监听变化
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 添加监听器（兼容旧版浏览器）
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // @ts-ignore - 旧版 API
      mediaQuery.addListener(handler);
    }

    // 清理函数
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // @ts-ignore - 旧版 API
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}




