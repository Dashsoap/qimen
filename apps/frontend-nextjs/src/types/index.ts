/**
 * 全局类型定义
 * Global type definitions for the application
 */

// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页类型
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

// 分页响应
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// 通用错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// 加载状态
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 异步状态
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

// 通用 ID 类型
export type ID = string | number;

// 时间戳类型
export type Timestamp = number | string;

// 可选字段
export type Optional<T> = T | null | undefined;

// 深度可选
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

// 只读深度类型
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};




