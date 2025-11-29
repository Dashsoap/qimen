/**
 * 认证和用户相关类型定义
 * Authentication and user-related type definitions
 */

// 用户角色
export type UserRole = 'user' | 'admin' | 'vip';

// 用户状态
export type UserStatus = 'active' | 'inactive' | 'banned';

// 用户信息
export interface User {
  id: string;
  username: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  points: number;
  createdAt: string;
  updatedAt?: string;
}

// 认证状态
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// 登录表单
export interface LoginForm {
  username?: string;
  phone?: string;
  password?: string;
  remember?: boolean;
}

// 短信登录表单
export interface SmsLoginForm {
  phone: string;
  code: string;
}

// 注册表单
export interface RegisterForm {
  username: string;
  password: string;
  confirmPassword?: string;
  inviteCode?: string;
}

// Token 信息
export interface TokenInfo {
  token: string;
  expiresAt: string;
  refreshToken?: string;
}

// 认证错误
export interface AuthError {
  code: string;
  message: string;
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  notifications: boolean;
}

// 用户资料更新
export interface UserProfileUpdate {
  username?: string;
  email?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

// 密码修改
export interface PasswordChange {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 签到信息
export interface CheckinInfo {
  hasCheckedIn: boolean;
  checkInDate?: string;
  consecutiveDays: number;
  totalDays: number;
  pointsEarned?: number;
}

// 签到记录
export interface CheckinRecord {
  id: string;
  userId: string;
  checkInDate: string;
  pointsEarned: number;
  consecutiveDays: number;
}




