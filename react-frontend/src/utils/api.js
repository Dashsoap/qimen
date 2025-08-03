// 环境检测
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;
const forceMobileApi = import.meta.env.VITE_FORCE_MOBILE_API === 'true';
const buildTarget = import.meta.env.VITE_BUILD_TARGET;

// API基础URL配置 - 优先使用环境变量，然后智能检测
const getApiBaseUrl = () => {
  // 🚀 优先使用环境变量配置
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('🔧 使用环境变量API地址:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 🚀 检查是否强制移动端API模式（构建时设置）
  if (forceMobileApi || buildTarget === 'mobile') {
    console.log('📱 强制移动端API模式，使用服务器地址');
    return 'http://101.201.148.8:3001';
  }

  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // 本地开发环境检测
  const isLocalDev = (currentHost === 'localhost' || currentHost === '127.0.0.1') && 
                     (currentPort === '5173' || currentPort === '3000');
  
  // 服务器Web环境
  const isServerWeb = currentHost === '101.201.148.8';
  
  // 移动端检测
  const isMobile = 
    window.location.protocol === 'file:' || 
    window.location.protocol === 'capacitor:' || 
    window.location.protocol === 'ionic:' ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window.cordova !== 'undefined');
                   
  if (isLocalDev && !isMobile) {
    // 🔧 Web端本地开发 - 直接使用本地后端
    console.log('🔧 Web本地开发环境，使用本地后端服务器');
    return 'http://localhost:3001';
  } else if (isServerWeb) {
    // 🔧 Web端服务器
    console.log('🔧 Web服务器环境，使用服务器地址');
    return 'http://101.201.148.8:3001';
  } else if (isMobile) {
    // 🔧 移动端使用服务器
    console.log('📱 移动端环境，使用服务器地址');
    return 'http://101.201.148.8:3001';
  } else {
    // 🔧 默认使用本地开发服务器
    console.log('🔧 默认环境，使用本地开发服务器');
    return 'http://localhost:3001';
  }
};

// 🔒 兜底保护：确保移动端永不访问localhost
const getSafeApiUrl = () => {
  const baseUrl = getApiBaseUrl();
  
  // 检查是否在移动端但仍然返回了localhost
  const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
  const isLocalhostUrl = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  
  if (isMobileDevice && isLocalhostUrl) {
    console.warn('⚠️ 移动端检测到localhost，强制使用服务器地址');
    return 'http://101.201.148.8:3001';
  }
  
  return baseUrl;
};

// 🔧 新增：备用服务器列表（智能选择）
const getBackupServers = () => {
  const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
  
  if (isMobileDevice) {
    // 移动端只使用服务器地址
    return [
      'http://101.201.148.8:3001',
      'http://10.0.2.2:3001'  // Android模拟器备用
    ];
  } else {
    // Web端包含本地开发地址
    return [
      'http://101.201.148.8:3001',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://10.0.2.2:3001'
    ];
  }
};

const API_BASE_URL = getSafeApiUrl();

// API端点配置
export const API_ENDPOINTS = {
  // 奇门遁甲分析
  QIMEN_ANALYSIS: `${API_BASE_URL}/api/analysis/qimen`,
  
  // 🚀 新增：流式分析端点
  QIMEN_ANALYSIS_STREAM: `${API_BASE_URL}/api/analysis/qimen/stream`,
  
  // 🔧 新增：获取所有可能的分析端点
  getAllAnalysisEndpoints: () => {
    return getBackupServers().map(server => `${server}/api/analysis/qimen`);
  },
  
  // 🚀 新增：获取所有可能的流式分析端点
  getAllStreamEndpoints: () => {
    return getBackupServers().map(server => `${server}/api/analysis/qimen/stream`);
  },
  
  // 排盘API
  QIMEN_PAIPAN: `${API_BASE_URL}/api/qimen/paipan`,
  
  // 用户认证 - 🔧 更新为新的认证系统端点
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  AUTH_PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // 🆕 SMS短信登录端点
  AUTH_SEND_SMS: `${API_BASE_URL}/api/auth/send-sms`,
  AUTH_LOGIN_SMS: `${API_BASE_URL}/api/auth/login-sms`,
  
  // 🆕 新增：积分系统端点
  POINTS_GET: `${API_BASE_URL}/api/points`,
  POINTS_TRANSACTION: `${API_BASE_URL}/api/points/transaction`,
  
  // 🆕 新增：签到系统端点
  CHECKIN_STATUS: `${API_BASE_URL}/api/checkin/status`,
  CHECKIN_DO: `${API_BASE_URL}/api/checkin`,
  CHECKIN_HISTORY: `${API_BASE_URL}/api/checkin/history`,
  
  // 用户信息 - 🔧 更新为新的端点
  USER_PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // 历史记录
  ANALYSIS_HISTORY: `${API_BASE_URL}/api/analysis/history`,
  
  // 健康检查
  HEALTH_CHECK: `${API_BASE_URL}/health`
};

console.log('🌐 API配置 (升级版认证系统):', {
  baseUrl: API_BASE_URL,
  isProduction: isProduction,
  isDevelopment: isDevelopment,
  features: [
    '✅ JWT认证系统',
    '✅ 积分管理',
    '✅ 安全防护',
    '✅ AI智能分析'
  ],
  endpoints: API_ENDPOINTS
});

// 导出API基础URL供其他文件使用
export { API_BASE_URL }; 