/**
 * API 客户端
 * Type-safe API client with Next.js environment variables
 */

import { env } from '@/config/env';
import type { ApiError, ApiResponse } from '@/types/api';

/**
 * API 基础 URL 配置
 * 使用 Next.js 环境变量而非 Vite 的 import.meta.env
 */
function getApiBaseUrl(): string {
  // 优先使用环境变量
  if (env.apiUrl) {
    return env.apiUrl;
  }

  // 浏览器环境检测
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // 本地开发环境
    const isLocalDev = (currentHost === 'localhost' || currentHost === '127.0.0.1');
    
    // 服务器 Web 环境
    const isServerWeb = currentHost === '101.201.148.8';
    
    // 移动端检测
    const isMobile = 
      window.location.protocol === 'file:' || 
      window.location.protocol === 'capacitor:' || 
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                  
    if (isLocalDev && !isMobile) {
      console.log('🔧 Web本地开发环境，使用本地后端');
      return 'http://localhost:3001';
    } else if (isServerWeb) {
      console.log('🔧 Web服务器环境');
      return 'http://101.201.148.8:3001';
    } else if (isMobile) {
      console.log('📱 移动端环境，使用服务器');
      return 'http://101.201.148.8:3001';
    }
  }
  
  // 默认使用本地开发
  return 'http://localhost:3001';
}

// 安全的 API URL（确保移动端不使用 localhost）
function getSafeApiUrl(): string {
  const baseUrl = getApiBaseUrl();
  
  if (typeof window !== 'undefined') {
    const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const isLocalhostUrl = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
    
    if (isMobileDevice && isLocalhostUrl) {
      console.warn('⚠️ 移动端检测到localhost，强制使用服务器地址');
      return 'http://101.201.148.8:3001';
    }
  }
  
  return baseUrl;
}

export const API_BASE_URL = getSafeApiUrl();

/**
 * API 端点配置
 */
export const API_ENDPOINTS = {
  // 奇门遁甲分析
  QIMEN_ANALYSIS: `${API_BASE_URL}/api/analysis/qimen`,
  QIMEN_ANALYSIS_STREAM: `${API_BASE_URL}/api/analysis/qimen/stream`,
  QIMEN_PAIPAN: `${API_BASE_URL}/api/qimen/paipan`,
  
  // 用户认证
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  AUTH_PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // SMS 短信登录
  AUTH_SEND_SMS: `${API_BASE_URL}/api/auth/send-sms`,
  AUTH_LOGIN_SMS: `${API_BASE_URL}/api/auth/login-sms`,
  
  // 积分系统
  POINTS_GET: `${API_BASE_URL}/api/points`,
  POINTS_TRANSACTION: `${API_BASE_URL}/api/points/transaction`,
  
  // 签到系统
  CHECKIN_STATUS: `${API_BASE_URL}/api/checkin/status`,
  CHECKIN_DO: `${API_BASE_URL}/api/checkin`,
  CHECKIN_HISTORY: `${API_BASE_URL}/api/checkin/history`,
  
  // 历史记录
  ANALYSIS_HISTORY: `${API_BASE_URL}/api/analysis/history`,
  
  // 健康检查
  HEALTH_CHECK: `${API_BASE_URL}/health`,
} as const;

/**
 * API 客户端类
 */
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config?: { baseURL?: string; timeout?: number }) {
    this.baseURL = config?.baseURL || API_BASE_URL;
    this.timeout = config?.timeout || env.apiTimeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 获取认证 token
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * 通用请求方法
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          statusText: response.statusText,
          message: errorData.message || response.statusText,
          data: errorData,
        } as ApiError;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          status: 408,
          statusText: 'Request Timeout',
          message: '请求超时',
        } as ApiError;
      }

      if (error.status) {
        throw error; // 已经是 ApiError
      }

      // 网络错误
      throw {
        status: 0,
        statusText: 'Network Error',
        message: error.message || '网络连接失败',
      } as ApiError;
    }
  }

  /**
   * GET 请求
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST 请求
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT 请求
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 导出默认实例
export const apiClient = new ApiClient();

// 导出 API_BASE_URL 供其他文件使用
export { API_BASE_URL as default };

console.log('🌐 API 配置:', {
  baseUrl: API_BASE_URL,
  environment: env.appEnv,
  debug: env.debug,
});

