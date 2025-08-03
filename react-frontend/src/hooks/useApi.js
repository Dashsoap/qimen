import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * API请求相关的自定义Hook
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  // 通用请求方法
  const request = useCallback(async (apiCall, options = {}) => {
    const { 
      showLoading = true, 
      showError = true,
      onSuccess,
      onError 
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await apiCall();
      const result = response.data;

      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || '请求失败';
      
      if (showError) setError(errorMessage);
      
      // 处理认证错误
      if (err.response?.status === 401) {
        logout();
      }

      if (onError) {
        onError(errorMessage);
      }

      return { success: false, error: errorMessage };
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [logout]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    request,
    clearError,
  };
};

/**
 * 分页数据Hook
 */
export const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState([]);
  const { request, loading, error } = useApi();

  // 加载数据
  const loadData = useCallback(async (apiCall, params = {}) => {
    const result = await request(() => apiCall({ 
      page, 
      limit, 
      ...params 
    }));

    if (result.success) {
      setData(result.data.items || result.data.data || []);
      setTotal(result.data.total || 0);
    }

    return result;
  }, [request, page, limit]);

  // 刷新数据
  const refresh = useCallback((apiCall, params = {}) => {
    return loadData(apiCall, params);
  }, [loadData]);

  // 下一页
  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(total / limit);
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, total, limit]);

  // 上一页
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  // 跳转到指定页
  const goToPage = useCallback((targetPage) => {
    const totalPages = Math.ceil(total / limit);
    if (targetPage >= 1 && targetPage <= totalPages) {
      setPage(targetPage);
    }
  }, [total, limit]);

  // 改变每页数量
  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // 重置到第一页
  }, []);

  return {
    // 数据
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    loading,
    error,
    
    // 方法
    loadData,
    refresh,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    
    // 状态
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};