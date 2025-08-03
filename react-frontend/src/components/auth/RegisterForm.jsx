import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * 注册表单组件 - 简洁的暖色主题设计
 */
const RegisterForm = ({ className, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreement: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = '请输入用户名';
    } else if (formData.username.length < 2) {
      newErrors.username = '用户名至少需要2个字符';
    } else if (formData.username.length > 20) {
      newErrors.username = '用户名不能超过20个字符';
    }

    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    } else if (formData.password.length > 50) {
      newErrors.password = '密码不能超过50个字符';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    if (!formData.agreement) {
      newErrors.agreement = '请同意用户协议和隐私政策';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // 注册成功回调
      onSuccess?.();
      
      // 跳转到登录页面或首页
      navigate('/login?message=注册成功，请登录');
    } catch (error) {
      setErrors({
        submit: error.message || '注册失败，请稍后重试'
      });
    }
  };

  return (
    <div className={`w-full ${className || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 全局错误信息 */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* 用户名输入 */}
        <div>
          <input
            type="text"
            name="username"
            placeholder="请输入用户名"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c165] focus:border-[#f3c165] text-[#753c14] placeholder-[#999999] bg-white"
            required
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* 邮箱输入 */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="请输入邮箱地址"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c165] focus:border-[#f3c165] text-[#753c14] placeholder-[#999999] bg-white"
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* 密码输入 */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="请输入密码"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 pr-12 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c165] focus:border-[#f3c165] text-[#753c14] placeholder-[#999999] bg-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] hover:text-[#753c14] transition-colors"
          >
            {showPassword ? '隐藏' : '查看'}
          </button>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* 确认密码输入 */}
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="请再次输入密码"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-3 pr-12 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f3c165] focus:border-[#f3c165] text-[#753c14] placeholder-[#999999] bg-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] hover:text-[#753c14] transition-colors"
          >
            {showConfirmPassword ? '隐藏' : '查看'}
          </button>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* 用户协议 */}
        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              name="agreement"
              checked={formData.agreement}
              onChange={handleInputChange}
              className="w-4 h-4 text-[#d3844e] bg-white border-[#E0E0E0] rounded focus:ring-[#f3c165] focus:ring-2 mt-1"
            />
            <span className="ml-2 text-sm text-[#5f3d25]">
              我已阅读并同意
              <a href="#" className="text-[#d3844e] hover:text-[#f3c165] mx-1">
                用户协议
              </a>
              和
              <a href="#" className="text-[#d3844e] hover:text-[#f3c165] mx-1">
                隐私政策
              </a>
            </span>
          </label>
          {errors.agreement && (
            <p className="mt-1 text-sm text-red-600">{errors.agreement}</p>
          )}
        </div>

        {/* 注册按钮 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#d3844e] hover:bg-[#f3c165] disabled:bg-[#cccccc] text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isLoading ? '注册中...' : '立即注册'}
        </button>

        {/* 分割线 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E0E0E0]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[#fefdf7] text-[#999999]">或</span>
          </div>
        </div>

        {/* 微信注册 */}
        <button
          type="button"
          className="w-full bg-white border border-[#E0E0E0] hover:bg-[#f9f9f9] text-[#753c14] py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          onClick={() => {
            console.log('微信注册');
          }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-1.900 7.6.5.5-3.187-2.75-6.876-8.372-6.876z"/>
          </svg>
          微信注册
        </button>
      </form>
    </div>
  );
};

export default RegisterForm; 