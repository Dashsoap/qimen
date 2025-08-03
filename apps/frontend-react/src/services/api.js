import axios from 'axios';
import { API_ENDPOINTS } from '../utils/api.js';

// 从utils/api.js获取智能配置的API基础URL
const getApiBaseUrl = () => {
  // 从API_ENDPOINTS中提取baseURL
  const healthCheckUrl = API_ENDPOINTS.HEALTH_CHECK;
  return healthCheckUrl.replace('/health', '');
};

// 创建axios实例
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求时间戳
    config.metadata = { startTime: new Date() };
    
    console.log('API请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 计算请求耗时
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`API响应: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    
    return response;
  },
  (error) => {
    console.error('API错误:', error.response?.status, error.response?.data || error.message);
    
    // 处理认证错误
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 登录
  login: (credentials) => api.post('/api/auth/login', credentials),
  
  // 注册
  register: (userData) => api.post('/api/auth/register', userData),
  
  // 登出
  logout: () => api.post('/api/auth/logout'),
  
  // 刷新token
  refreshToken: () => api.post('/api/auth/refresh'),
  
  // 获取用户信息
  getUserInfo: () => api.get('/api/auth/me'),
  
  // 更新用户信息
  updateUserInfo: (userData) => api.put('/api/auth/me', userData),
  
  // 修改密码
  changePassword: (passwordData) => api.put('/api/auth/password', passwordData),
};

// 奇门遁甲相关API
export const qimenAPI = {
  // 起局
  startGame: (params) => api.post('/api/qimen/start', params),
  
  // 获取历史记录
  getHistory: (page = 1, limit = 20) => api.get(`/api/qimen/history?page=${page}&limit=${limit}`),
  
  // 保存局面
  saveGame: (gameData) => api.post('/api/qimen/save', gameData),
  
  // 删除历史记录
  deleteHistory: (id) => api.delete(`/api/qimen/history/${id}`),
  
  // 获取分析结果
  getAnalysis: (gameId) => api.get(`/api/qimen/analysis/${gameId}`),
  
  // 分享局面
  shareGame: (gameData) => api.post('/api/qimen/share', gameData),
  
  // 获取分享的局面
  getSharedGame: (shareId) => api.get(`/api/qimen/shared/${shareId}`),
};

// 用户数据相关API
export const userAPI = {
  // 获取用户设置
  getSettings: () => api.get('/api/user/settings'),
  
  // 更新用户设置
  updateSettings: (settings) => api.put('/api/user/settings', settings),
  
  // 获取用户统计
  getStats: () => api.get('/api/user/stats'),
  
  // 上传头像
  uploadAvatar: (formData) => api.post('/api/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// 系统相关API
export const systemAPI = {
  // 健康检查
  health: () => api.get('/health'),
  
  // 获取系统信息
  getInfo: () => api.get('/api/system/info'),
  
  // 获取公告
  getAnnouncements: () => api.get('/api/system/announcements'),
  
  // 反馈
  feedback: (feedbackData) => api.post('/api/system/feedback', feedbackData),
};

// 通用请求方法
export const request = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
  patch: (url, data, config) => api.patch(url, data, config),
};

// 文件上传辅助函数
export const uploadFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// 导出默认实例
export default api;