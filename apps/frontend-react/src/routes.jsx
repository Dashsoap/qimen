import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import QimenPage from './pages/QimenPage';
import SettingsPage from './pages/SettingsPage';
import SettingsDetailPage from './pages/SettingsDetailPage';
import { useAuth } from './hooks/useAuth';

// 需要登录才能访问的路由守卫组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">加载中...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 需要未登录状态才能访问的路由守卫（如登录、注册页面）
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">加载中...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 根路径重定向到/home，与Vue项目保持一致 */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      {/* 主页路由 */}
      <Route path="/home" element={<HomePage />} />
      
      {/* 登录注册页面 - 只允许未登录用户访问 */}
      <Route path="/login" element={
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      } />
      
      {/* 公开页面 - 不需要登录验证 */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/qimen" element={<QimenPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      
      {/* 二级页面 - 不显示底部导航栏 */}
      <Route path="/settings/notifications" element={<SettingsDetailPage />} />
      
      {/* 个人资料页面 - 不强制登录，但会显示不同内容 */}
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* 需要登录的页面 */}
      <Route path="/history" element={
        <ProtectedRoute>
          <HistoryPage />
        </ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute>
          <FavoritesPage />
        </ProtectedRoute>
      } />
      
      {/* 404页面 */}
      <Route path="*" element={
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
          <p className="text-xl mb-8 text-gray-300">页面不存在</p>
          <a href="/home" className="text-blue-400 hover:text-blue-300 hover:underline">
            返回首页
          </a>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;