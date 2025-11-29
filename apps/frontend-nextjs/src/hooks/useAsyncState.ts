/**
 * useAsyncState Hook
 * 管理异步操作状态
 */

'use client';

import { useState, useCallback } from 'react';
import type { AsyncState, AppError } from '@/types';

/**
 * 异步状态管理 Hook
 * @param initialData - 初始数据
 * @returns 异步状态和操作方法
 */
export function useAsyncState<T>(
  initialData: T | null = null
): {
  state: AsyncState<T>;
  setData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  reset: () => void;
  execute: <R = T>(promise: Promise<R>) => Promise<R>;
} {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, loading: false, error: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: AppError | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  /**
   * 执行异步操作
   * @param promise - 要执行的 Promise
   * @returns Promise 结果
   */
  const execute = useCallback(async <R = T>(promise: Promise<R>): Promise<R> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await promise;
      setState(prev => ({ ...prev, data: result as any, loading: false }));
      return result;
    } catch (err: any) {
      const error: AppError = {
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || '操作失败',
        details: err,
      };
      setState(prev => ({ ...prev, error, loading: false }));
      throw error;
    }
  }, []);

  return {
    state,
    setData,
    setLoading,
    setError,
    reset,
    execute,
  };
}




