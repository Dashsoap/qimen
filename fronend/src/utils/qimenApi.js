// 奇门遁甲历史记录和收藏夹 API 服务

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// 获取本地存储的token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// 创建请求头
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// 处理API响应
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '网络错误' }));
    throw new Error(error.message || error.error || '请求失败');
  }
  return response.json();
}

// === 历史记录 API ===

// 获取历史记录列表
export async function getQimenHistory(params = {}) {
  const { page = 1, limit = 20, search = '' } = params;
  const queryString = new URLSearchParams({ page, limit, search }).toString();
  
  const response = await fetch(`${API_BASE_URL}/api/qimen/history?${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  return handleResponse(response);
}

// 获取单个历史记录详情
export async function getQimenHistoryDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/qimen/history/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  return handleResponse(response);
}

// 删除历史记录
export async function deleteQimenHistory(id) {
  const response = await fetch(`${API_BASE_URL}/api/qimen/history/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  return handleResponse(response);
}

// === 收藏夹 API ===

// 获取收藏夹列表
export async function getQimenFavorites(params = {}) {
  const { page = 1, limit = 20 } = params;
  const queryString = new URLSearchParams({ page, limit }).toString();
  
  const response = await fetch(`${API_BASE_URL}/api/qimen/favorites?${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  return handleResponse(response);
}

// 添加收藏
export async function addQimenFavorite(recordId, note = '') {
  const response = await fetch(`${API_BASE_URL}/api/qimen/favorites`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ recordId, note })
  });
  
  return handleResponse(response);
}

// 取消收藏
export async function removeQimenFavorite(recordId) {
  const response = await fetch(`${API_BASE_URL}/api/qimen/favorites/${recordId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  return handleResponse(response);
}

// 更新收藏备注
export async function updateQimenFavoriteNote(recordId, note) {
  const response = await fetch(`${API_BASE_URL}/api/qimen/favorites/${recordId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ note })
  });
  
  return handleResponse(response);
}

// === 工具函数 ===

// 格式化时间
export function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
}

// 截断文本
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
} 