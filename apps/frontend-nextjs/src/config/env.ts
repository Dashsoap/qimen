/**
 * 环境变量配置
 * Environment configuration with type safety
 */

// 环境变量类型定义
interface EnvConfig {
  apiUrl: string;
  apiTimeout: number;
  appEnv: 'development' | 'production' | 'test';
  debug: boolean;
}

// 获取环境变量（客户端）
function getEnvVar(key: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') {
    // 服务器端
    return process.env[key] || defaultValue;
  }
  // 客户端（只能访问 NEXT_PUBLIC_ 前缀的变量）
  return process.env[key] || defaultValue;
}

// 环境变量配置
export const env: EnvConfig = {
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3001'),
  apiTimeout: parseInt(getEnvVar('NEXT_PUBLIC_API_TIMEOUT', '30000'), 10),
  appEnv: (getEnvVar('NEXT_PUBLIC_APP_ENV', 'development') as EnvConfig['appEnv']),
  debug: getEnvVar('NEXT_PUBLIC_DEBUG', 'false') === 'true',
};

// 验证必需的环境变量
export function validateEnv(): void {
  const requiredEnvVars = ['NEXT_PUBLIC_API_URL'];
  
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }
}

// 开发环境检查
export const isDev = env.appEnv === 'development';
export const isProd = env.appEnv === 'production';
export const isTest = env.appEnv === 'test';

// 导出环境变量
export default env;




