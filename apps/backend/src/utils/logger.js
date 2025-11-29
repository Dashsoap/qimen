/**
 * 日志工具
 * 提供统一的日志记录功能
 */

import { formatTimestamp } from './timeHelper.js';

/**
 * 日志级别枚举
 */
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

/**
 * 日志颜色配置
 */
const LOG_COLORS = {
  DEBUG: '\x1b[36m', // 青色
  INFO: '\x1b[32m',  // 绿色
  WARN: '\x1b[33m',  // 黄色
  ERROR: '\x1b[31m', // 红色
  FATAL: '\x1b[35m', // 紫色
  RESET: '\x1b[0m'
};

/**
 * 日志配置
 */
let loggerConfig = {
  level: process.env.LOG_LEVEL || 'INFO',
  enableColors: process.env.NODE_ENV !== 'production',
  enableTimestamp: true,
  enableJson: false
};

/**
 * 配置日志器
 * @param {object} config - 配置对象
 */
export function configureLogger(config = {}) {
  loggerConfig = { ...loggerConfig, ...config };
}

/**
 * 获取日志级别权重
 * @param {string} level - 日志级别
 * @returns {number} 权重
 */
function getLevelWeight(level) {
  const weights = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
  };
  return weights[level] || 1;
}

/**
 * 检查是否应该记录日志
 * @param {string} level - 日志级别
 * @returns {boolean} 是否记录
 */
function shouldLog(level) {
  return getLevelWeight(level) >= getLevelWeight(loggerConfig.level);
}

/**
 * 格式化日志消息
 * @param {string} level - 日志级别
 * @param {string} message - 消息
 * @param {object} meta - 元数据
 * @returns {string} 格式化后的消息
 */
function formatLogMessage(level, message, meta = {}) {
  const timestamp = loggerConfig.enableTimestamp 
    ? formatTimestamp(new Date(), 'full') 
    : '';
  
  const color = loggerConfig.enableColors ? LOG_COLORS[level] : '';
  const reset = loggerConfig.enableColors ? LOG_COLORS.RESET : '';
  
  const levelStr = `[${level}]`.padEnd(7);
  const timestampStr = timestamp ? `[${timestamp}]` : '';
  
  let logLine = `${color}${levelStr}${reset} ${timestampStr} ${message}`;
  
  // 添加元数据
  if (meta && Object.keys(meta).length > 0) {
    if (loggerConfig.enableJson) {
      logLine += ' ' + JSON.stringify(meta);
    } else {
      logLine += ' ' + formatMeta(meta);
    }
  }
  
  return logLine;
}

/**
 * 格式化元数据
 * @param {object} meta - 元数据
 * @returns {string} 格式化后的字符串
 */
function formatMeta(meta) {
  const parts = [];
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === 'object') {
      parts.push(`${key}=${JSON.stringify(value)}`);
    } else {
      parts.push(`${key}=${value}`);
    }
  }
  return parts.length > 0 ? `{${parts.join(', ')}}` : '';
}

/**
 * 通用日志方法
 * @param {string} level - 日志级别
 * @param {string} message - 消息
 * @param {object} meta - 元数据
 */
function log(level, message, meta = {}) {
  if (!shouldLog(level)) return;
  
  const formattedMessage = formatLogMessage(level, message, meta);
  
  switch (level) {
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(formattedMessage);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
}

/**
 * Logger类
 */
export class Logger {
  constructor(context = '') {
    this.context = context;
  }
  
  /**
   * Debug级别日志
   */
  debug(message, meta = {}) {
    const contextMeta = this.context ? { context: this.context, ...meta } : meta;
    log(LogLevel.DEBUG, message, contextMeta);
  }
  
  /**
   * Info级别日志
   */
  info(message, meta = {}) {
    const contextMeta = this.context ? { context: this.context, ...meta } : meta;
    log(LogLevel.INFO, message, contextMeta);
  }
  
  /**
   * Warn级别日志
   */
  warn(message, meta = {}) {
    const contextMeta = this.context ? { context: this.context, ...meta } : meta;
    log(LogLevel.WARN, message, contextMeta);
  }
  
  /**
   * Error级别日志
   */
  error(message, error = null, meta = {}) {
    const errorMeta = error ? {
      error: error.message,
      stack: error.stack,
      ...meta
    } : meta;
    const contextMeta = this.context ? { context: this.context, ...errorMeta } : errorMeta;
    log(LogLevel.ERROR, message, contextMeta);
  }
  
  /**
   * Fatal级别日志
   */
  fatal(message, error = null, meta = {}) {
    const errorMeta = error ? {
      error: error.message,
      stack: error.stack,
      ...meta
    } : meta;
    const contextMeta = this.context ? { context: this.context, ...errorMeta } : errorMeta;
    log(LogLevel.FATAL, message, contextMeta);
  }
  
  /**
   * 创建子logger
   */
  child(childContext) {
    const newContext = this.context 
      ? `${this.context}:${childContext}` 
      : childContext;
    return new Logger(newContext);
  }
}

/**
 * 创建logger实例
 * @param {string} context - 上下文名称
 * @returns {Logger} logger实例
 */
export function createLogger(context = '') {
  return new Logger(context);
}

/**
 * 默认logger实例
 */
export const logger = new Logger();

/**
 * 便捷方法
 */
export const debug = (message, meta) => logger.debug(message, meta);
export const info = (message, meta) => logger.info(message, meta);
export const warn = (message, meta) => logger.warn(message, meta);
export const error = (message, err, meta) => logger.error(message, err, meta);
export const fatal = (message, err, meta) => logger.fatal(message, err, meta);




