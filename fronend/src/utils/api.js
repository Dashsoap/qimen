// 环境检测
const isProduction = import.meta.env.PROD;
const isMobile = window.location.protocol === 'file:' || 
                 window.location.protocol === 'capacitor:' || 
                 window.location.protocol === 'ionic:';

// API基础URL配置 - 强制使用服务器IP
const getApiBaseUrl = () => {
  // 检测是否为移动端，优先使用HTTPS
  const isMobile = window.location.protocol === 'file:' || 
                   window.location.protocol === 'capacitor:' || 
                   window.location.protocol === 'ionic:' ||
                   /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                   
  if (isMobile) {
    // 🔧 移动端多服务器配置
    return 'http://101.201.148.8:3001';
  } else {
    // Web端使用HTTP
    return 'http://101.201.148.8:3001';
  }
};

// 🔧 新增：备用服务器列表
const getBackupServers = () => {
  return [
    'http://101.201.148.8:3001',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://10.0.2.2:3001'  // Android模拟器默认host
  ];
};

const API_BASE_URL = getApiBaseUrl();

// API端点配置
export const API_ENDPOINTS = {
  // 奇门遁甲分析
  QIMEN_ANALYSIS: `${API_BASE_URL}/api/analysis/qimen`,
  
  // 🔧 新增：获取所有可能的分析端点
  getAllAnalysisEndpoints: () => {
    return getBackupServers().map(server => `${server}/api/analysis/qimen`);
  },
  
  // 排盘API
  QIMEN_PAIPAN: `${API_BASE_URL}/api/qimen/paipan`,
  
  // 用户认证
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  
  // 用户信息
  USER_PROFILE: `${API_BASE_URL}/api/user/profile`,
  
  // 历史记录
  ANALYSIS_HISTORY: `${API_BASE_URL}/api/analysis/history`,
  
  // 健康检查
  HEALTH_CHECK: `${API_BASE_URL}/api/health`
};

console.log('🌐 API配置:', {
  baseUrl: API_BASE_URL,
  isMobile: isMobile,
  isProduction: isProduction,
  endpoints: API_ENDPOINTS
});

// 导出API基础URL供其他文件使用
export { API_BASE_URL }; 