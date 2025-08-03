import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RegisterForm from '../components/auth/RegisterForm';
import AuthLayout from '../components/layout/AuthLayout';

/**
 * 注册页面
 */
const RegisterPage = () => {
  const { user, isAuthenticated } = useAuth();

  // 如果已经登录，重定向到首页
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      title="创建账户"
      subtitle="欢迎加入奇门遁甲"
      description="注册账户以享受完整的奇门遁甲服务"
      footerContent={
        <>
          <span className="text-[#999999] text-sm">已有账户？ </span>
          <a href="/login" className="text-[#d3844e] text-sm hover:text-[#f3c165] transition-colors">
            立即登录
          </a>
        </>
      }
    >
      <RegisterForm 
        onSuccess={() => {
          console.log('注册成功');
        }}
      />
    </AuthLayout>
  );
};

export default RegisterPage;