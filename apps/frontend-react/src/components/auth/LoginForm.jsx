import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../common/FormInput';
import CodeInput from '../common/CodeInput';
import SubmitButton from '../common/SubmitButton';
import { UserIcon, LockIcon, PhoneIcon, EyeIcon } from '../icons';

/**
 * 登录表单组件 - 1:1复刻Vue版本，支持双模式登录
 */
const LoginForm = ({ className, onSuccess, onMessage }) => {
  // 登录模式
  const [loginMode, setLoginMode] = useState('password'); // 'password' 或 'sms'
  
  // 表单数据
  const [formData, setFormData] = useState({
    // 账号密码登录
    username: '',
    password: '',
    // 手机号登录
    phone: '',
    code: ''
  });

  // 状态管理
  const [showPassword, setShowPassword] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 错误信息
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  // 倒计时效果
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 切换登录模式
  const switchLoginMode = () => {
    setLoginMode(loginMode === 'password' ? 'sms' : 'password');
    setErrors({});
    setShowCodeInput(false);
    setFormData({
      username: '',
      password: '',
      phone: '',
      code: ''
    });
  };

  // 表单验证
  const validateUsername = () => {
    if (!formData.username) {
      setErrors(prev => ({ ...prev, username: '请输入用户名或邮箱' }));
      return false;
    }
    setErrors(prev => ({ ...prev, username: '' }));
    return true;
  };

  const validatePassword = () => {
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: '请输入密码' }));
      return false;
    }
    if (formData.password.length < 6) {
      setErrors(prev => ({ ...prev, password: '密码至少需要6个字符' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const validatePhone = () => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!formData.phone) {
      setErrors(prev => ({ ...prev, phone: '请输入手机号' }));
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: '请输入正确的手机号码' }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: '' }));
    return true;
  };

  const validateCode = () => {
    if (!formData.code) {
      setErrors(prev => ({ ...prev, code: '请输入验证码' }));
      return false;
    }
    if (formData.code.length !== 6) {
      setErrors(prev => ({ ...prev, code: '请输入6位验证码' }));
      return false;
    }
    setErrors(prev => ({ ...prev, code: '' }));
    return true;
  };

  // 计算属性
  const canSendCode = formData.phone && !errors.phone && countdown === 0;
  const canPasswordSubmit = formData.username && formData.password && !errors.username && !errors.password;
  const canSmsSubmit = showCodeInput ? (formData.phone && formData.code && !errors.phone && !errors.code) : 
                                       (formData.phone && !errors.phone);

  // 处理输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 发送验证码
  const sendCode = async () => {
    if (!validatePhone()) return;

    setIsLoading(true);
    try {
      // 模拟发送验证码API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowCodeInput(true);
      setCountdown(60);
      onMessage?.('验证码已发送', 'success');
         } catch (error) {
       // eslint-disable-next-line no-unused-vars
       onMessage?.('发送验证码失败，请重试', 'error');
     } finally {
       setIsLoading(false);
     }
  };

  // 处理手机号登录/获取验证码
  const handleSmsSubmit = async (e) => {
    e.preventDefault();
    
    if (!showCodeInput) {
      // 第一次点击，发送验证码
      await sendCode();
    } else {
      // 第二次点击，执行登录
      validatePhone();
      validateCode();
      
      if (errors.phone || errors.code) return;

      setIsLoading(true);
      try {
        await login({
          phone: formData.phone,
          code: formData.code
        });

        onMessage?.('登录成功', 'success');
        onSuccess?.();
        
        // 跳转到首页或之前的页面
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
        navigate(redirectTo);
      } catch (error) {
        onMessage?.(error.message || '登录失败，请检查验证码', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 处理密码登录
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    
    validateUsername();
    validatePassword();
    
    if (errors.username || errors.password) return;

    setIsLoading(true);
    try {
      await login({
        usernameOrEmail: formData.username,
        password: formData.password
      });

      onMessage?.('登录成功', 'success');
      onSuccess?.();
      
      // 跳转到首页或之前的页面  
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
      navigate(redirectTo);
    } catch (error) {
      onMessage?.(error.message || '登录失败，请检查用户名和密码', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 跳转到注册页面
  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className={className}>
      {/* 卡片头部 */}
      <div className="card-header">
        <h2>{loginMode === 'password' ? '账号密码登录' : '手机号登录'}</h2>
        <p>{loginMode === 'password' ? '输入账号密码即可登录' : '验证后即可开始您的奇门之旅'}</p>
      </div>

      {/* 账号密码登录表单 */}
      {loginMode === 'password' && (
        <form onSubmit={handlePasswordLogin} className="login-form">
          <FormInput
            value={formData.username}
            onChange={(value) => handleInputChange('username', value)}
            onBlur={validateUsername}
            label="用户名/邮箱"
            placeholder="请输入用户名或邮箱"
            error={errors.username}
            prefixIcon={<UserIcon />}
          />

          <FormInput
            value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
            onBlur={validatePassword}
            label="密码"
            type={showPassword ? 'text' : 'password'}
            placeholder="请输入密码"
            error={errors.password}
            prefixIcon={<LockIcon />}
            suffixIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                <EyeIcon closed={!showPassword} />
              </button>
            }
          />

          <SubmitButton
            type="submit"
            disabled={!canPasswordSubmit}
            loading={isLoading}
            loadingText="登录中..."
          >
            登录
          </SubmitButton>
        </form>
      )}

      {/* 手机号登录表单 */}
      {loginMode === 'sms' && (
        <form onSubmit={handleSmsSubmit} className="login-form">
          <FormInput
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            onBlur={validatePhone}
            label="手机号码"
            type="tel"
            placeholder="请输入手机号"
            error={errors.phone}
            maxLength={11}
            prefixIcon={<PhoneIcon />}
          />

          {showCodeInput && (
            <CodeInput
              value={formData.code}
              onChange={(value) => handleInputChange('code', value)}
              onBlur={validateCode}
              onSendCode={sendCode}
              label="验证码"
              error={errors.code}
              canSend={canSendCode}
              loading={isLoading}
              countdown={countdown}
              prefixIcon={<LockIcon />}
            />
          )}

          <SubmitButton
            type="submit"
            disabled={!canSmsSubmit}
            loading={isLoading}
            loadingText={showCodeInput ? '登录中...' : '发送中...'}
          >
            {showCodeInput ? '立即登录' : '获取验证码'}
          </SubmitButton>
        </form>
      )}

      {/* 登录方式切换 */}
      <div className="divider">
        <span>其他方式</span>
      </div>

      <div className="alternative-actions">
        <button onClick={switchLoginMode} className="alt-btn">
          {loginMode === 'password' ? <PhoneIcon size="18" /> : <UserIcon size="18" />}
          {loginMode === 'password' ? '手机号登录' : '账号密码登录'}
        </button>
        
        <button onClick={goToRegister} className="alt-btn register-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          立即注册
        </button>
      </div>

      <style jsx>{`
        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .card-header h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #C4A876;
          letter-spacing: 2px;
        }

        .card-header p {
          font-size: 13px;
          color: rgba(196, 168, 118, 0.6);
          margin: 0;
          line-height: 1.4;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .password-toggle {
          background: none;
          border: none;
          color: rgba(196, 168, 118, 0.5);
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: rgba(196, 168, 118, 0.8);
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 24px 0;
          color: rgba(196, 168, 118, 0.4);
          font-size: 13px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(196, 168, 118, 0.2);
        }

        .divider span {
          padding: 0 16px;
          background: linear-gradient(135deg, 
            rgba(47, 40, 32, 0.8) 0%,
            rgba(31, 26, 20, 0.9) 100%
          );
        }

        .alternative-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alt-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(196, 168, 118, 0.2);
          border-radius: 8px;
          color: rgba(196, 168, 118, 0.8);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .alt-btn:hover {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(196, 168, 118, 0.3);
          color: #C4A876;
        }

        .register-btn {
          background: rgba(196, 168, 118, 0.1);
          border-color: rgba(196, 168, 118, 0.3);
          color: #C4A876;
        }

        .register-btn:hover {
          background: rgba(196, 168, 118, 0.15);
          border-color: rgba(196, 168, 118, 0.4);
        }
      `}</style>
    </div>
  );
};

export default LoginForm; 