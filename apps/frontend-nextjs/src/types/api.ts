/**
 * API 相关类型定义
 * API-related type definitions
 */

import type { ApiResponse } from './index';

// 重新导出基础类型
export type { ApiResponse } from './index';

// API 请求配置
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// API 错误
export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  data?: any;
}

// 奇门遁甲排盘请求
export interface QimenPaipanRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
}

// 奇门遁甲排盘响应
export interface QimenPaipanResponse {
  干支: string;
  节气: string;
  排局: string;
  旬空: Record<string, string>;
  值符值使: Record<string, string>;
  gongs: GongData[];
  [key: string]: any;
}

// 宫位数据
export interface GongData {
  name: string;
  index: string;
  暗干: string;
  八神: string;
  九星: string;
  八门: string;
  天盘: string;
  天盘1: string;
  地盘: string;
  旬空: string;
  马星: string;
}

// AI 分析请求
export interface QimenAnalysisRequest {
  paipanData: QimenPaipanResponse;
  question: string;
  questionType?: string;
}

// AI 分析响应
export interface QimenAnalysisResponse {
  analysis: string;
  suggestions?: string[];
  confidence?: number;
}

// 流式分析响应
export interface StreamAnalysisChunk {
  type: 'chunk' | 'done' | 'error';
  content: string;
  error?: string;
}

// 用户登录请求
export interface LoginRequest {
  username?: string;
  phone?: string;
  password?: string;
  code?: string; // SMS code
}

// 用户注册请求
export interface RegisterRequest {
  username: string;
  password: string;
  inviteCode?: string;
}

// 认证响应
export interface AuthResponse {
  token: string;
  user: UserInfo;
}

// 用户信息
export interface UserInfo {
  id: string;
  username: string;
  phone?: string;
  points: number;
  role?: string;
  createdAt: string;
}

// 积分查询响应
export interface PointsResponse {
  points: number;
  transactions?: PointTransaction[];
}

// 积分交易记录
export interface PointTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  createdAt: string;
}

// 历史记录项
export interface AnalysisHistoryItem {
  id: string;
  question: string;
  questionType?: string;
  paipanData: QimenPaipanResponse;
  analysis: string;
  createdAt: string;
  isFavorite?: boolean;
}

// 历史记录响应
export interface HistoryResponse extends ApiResponse<AnalysisHistoryItem[]> {}

// 健康检查响应
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: number;
  version?: string;
}

