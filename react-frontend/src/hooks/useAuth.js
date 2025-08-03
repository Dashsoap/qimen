import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, logoutUser, registerUser, verifyToken } from '../stores/authSlice';

/**
 * 认证相关的自定义Hook
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  // 登录
  const handleLogin = useCallback(async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // 注册
  const handleRegister = useCallback(async (userData) => {
    try {
      const result = await dispatch(registerUser(userData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // 登出
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // 验证token
  const checkAuth = useCallback(async () => {
    try {
      const result = await dispatch(verifyToken()).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  return {
    // 状态
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    
    // 方法
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth: checkAuth,
  };
};