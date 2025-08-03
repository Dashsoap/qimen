import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import AuthLayout from '../components/layout/AuthLayout';

/**
 * 登录页面 - 1:1复刻Vue版本，支持双模式登录
 */
const LoginPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  // 如果已经登录，重定向到首页
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  // 显示消息
  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    // 3秒后自动清除消息
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  return (
    <AuthLayout
      subtitle="探索古老智慧，洞察天机玄妙"
      actionText="登录"
      message={message}
      messageType={messageType}
    >
      <LoginForm 
        onSuccess={() => {
          console.log('登录成功');
        }}
        onMessage={showMessage}
      />
    </AuthLayout>
  );
};

export default LoginPage;