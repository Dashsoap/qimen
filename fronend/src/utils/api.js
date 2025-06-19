// 环境检测
const isProduction = import.meta.env.PROD;
const isMobile = window.location.protocol === 'file:' || 
                 window.location.protocol === 'capacitor:' || 
                 window.location.protocol === 'ionic:';

// API基础URL配置 - 强制使用服务器IP
const getApiBaseUrl = () => {
  // 统一使用服务器公网IP地址，避免localhost问题
  return 'http://101.201.148.8:3001';
};

const API_BASE_URL = getApiBaseUrl();

// API端点配置
export const API_ENDPOINTS = {
  // 奇门相关
  QIMEN_ANALYSIS: `${API_BASE_URL}/api/analysis/qimen`,
  QIMEN_PAIPAN: `${API_BASE_URL}/api/qimen/paipan`,
  
  // 认证相关
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_PROFILE: `${API_BASE_URL}/auth/profile`,
  
  // 健康检查
  HEALTH: `${API_BASE_URL}/health`
};

// 导出API基础URL供其他文件使用
export { API_BASE_URL }; 