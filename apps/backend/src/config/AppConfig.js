import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import Joi from 'joi';

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

// 根据环境加载不同的配置文件
const NODE_ENV = process.env.NODE_ENV || 'development';
const configFile = NODE_ENV === 'production' ? 'config.prod.env' : 'config.env';
const configPath = join(projectRoot, configFile);

// 加载环境变量
dotenv.config({ path: configPath });

/**
 * 配置验证Schema
 */
const configSchema = Joi.object({
  // 服务器配置
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3001),
  HOST: Joi.string().default('localhost'),
  
  // 数据库配置
  DATABASE_URL: Joi.string().default('file:./dev.db'),
  
  // JWT配置
  JWT_SECRET: Joi.string().min(32).required()
    .messages({ 'any.required': 'JWT_SECRET必须设置，且不少于32位字符' }),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  
  // 加密配置
  BCRYPT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  
  // AI服务配置
  ARK_API_KEY: Joi.string().required()
    .messages({ 'any.required': 'ARK_API_KEY必须设置' }),
  ARK_BASE_URL: Joi.string().uri().default('https://www.sophnet.com/api/open-apis/v1'),
  ARK_MODEL: Joi.string().default('DeepSeek-R1'),
  
  // 限流配置
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15分钟
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  AUTH_RATE_LIMIT_MAX: Joi.number().default(5),
  
  // 积分配置
  ANALYSIS_POINTS_COST: Joi.number().default(100),
  REGISTER_BONUS_POINTS: Joi.number().default(1000),
  
  // 缓存配置
  CACHE_TTL_MINUTES: Joi.number().default(5),
  
  // CORS配置
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000'),
  
  // 日志配置
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FILE_PATH: Joi.string().default('./logs/app.log')
});

/**
 * 应用配置类
 */
export class AppConfig {
  constructor() {
    this.validateAndLoadConfig();
  }

  /**
   * 验证并加载配置
   */
  validateAndLoadConfig() {
    const rawConfig = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      HOST: process.env.HOST,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
      ARK_API_KEY: process.env.ARK_API_KEY,
      ARK_BASE_URL: process.env.ARK_BASE_URL,
      ARK_MODEL: process.env.ARK_MODEL,
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
      AUTH_RATE_LIMIT_MAX: process.env.AUTH_RATE_LIMIT_MAX,
      ANALYSIS_POINTS_COST: process.env.ANALYSIS_POINTS_COST,
      REGISTER_BONUS_POINTS: process.env.REGISTER_BONUS_POINTS,
      CACHE_TTL_MINUTES: process.env.CACHE_TTL_MINUTES,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      LOG_LEVEL: process.env.LOG_LEVEL,
      LOG_FILE_PATH: process.env.LOG_FILE_PATH
    };

    const { error, value } = configSchema.validate(rawConfig);
    
    if (error) {
      throw new Error(`配置验证失败: ${error.details.map(d => d.message).join(', ')}`);
    }

    // 处理特殊配置项
    value.ALLOWED_ORIGINS = value.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
    value.PORT = parseInt(value.PORT);
    value.BCRYPT_ROUNDS = parseInt(value.BCRYPT_ROUNDS);
    value.RATE_LIMIT_WINDOW_MS = parseInt(value.RATE_LIMIT_WINDOW_MS);
    value.RATE_LIMIT_MAX_REQUESTS = parseInt(value.RATE_LIMIT_MAX_REQUESTS);
    value.AUTH_RATE_LIMIT_MAX = parseInt(value.AUTH_RATE_LIMIT_MAX);
    value.ANALYSIS_POINTS_COST = parseInt(value.ANALYSIS_POINTS_COST);
    value.REGISTER_BONUS_POINTS = parseInt(value.REGISTER_BONUS_POINTS);
    value.CACHE_TTL_MINUTES = parseInt(value.CACHE_TTL_MINUTES);

    this.config = value;
    Object.freeze(this.config); // 防止配置被意外修改
  }

  /**
   * 获取所有配置
   * @returns {Object} 配置对象
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * 获取指定配置项
   * @param {string} key - 配置键
   * @returns {any} 配置值
   */
  get(key) {
    return this.config[key];
  }

  /**
   * 获取服务器配置
   * @returns {Object} 服务器配置
   */
  getServerConfig() {
    return {
      nodeEnv: this.config.NODE_ENV,
      port: this.config.PORT,
      host: this.config.HOST,
      isProduction: this.config.NODE_ENV === 'production',
      isDevelopment: this.config.NODE_ENV === 'development'
    };
  }

  /**
   * 获取数据库配置
   * @returns {Object} 数据库配置
   */
  getDatabaseConfig() {
    return {
      url: this.config.DATABASE_URL
    };
  }

  /**
   * 获取JWT配置
   * @returns {Object} JWT配置
   */
  getJWTConfig() {
    return {
      secret: this.config.JWT_SECRET,
      expiresIn: this.config.JWT_EXPIRES_IN
    };
  }

  /**
   * 获取加密配置
   * @returns {Object} 加密配置
   */
  getCryptoConfig() {
    return {
      bcryptRounds: this.config.BCRYPT_ROUNDS
    };
  }

  /**
   * 获取AI服务配置
   * @returns {Object} AI服务配置
   */
  getAIConfig() {
    return {
      apiKey: this.config.ARK_API_KEY,
      baseURL: this.config.ARK_BASE_URL,
      model: this.config.ARK_MODEL
    };
  }

  /**
   * 获取限流配置
   * @returns {Object} 限流配置
   */
  getRateLimitConfig() {
    return {
      windowMs: this.config.RATE_LIMIT_WINDOW_MS,
      maxRequests: this.config.RATE_LIMIT_MAX_REQUESTS,
      authMaxRequests: this.config.AUTH_RATE_LIMIT_MAX
    };
  }

  /**
   * 获取积分配置
   * @returns {Object} 积分配置
   */
  getPointsConfig() {
    return {
      analysisPointsCost: this.config.ANALYSIS_POINTS_COST,
      registerBonusPoints: this.config.REGISTER_BONUS_POINTS
    };
  }

  /**
   * 获取缓存配置
   * @returns {Object} 缓存配置
   */
  getCacheConfig() {
    return {
      ttlMinutes: this.config.CACHE_TTL_MINUTES,
      ttlMs: this.config.CACHE_TTL_MINUTES * 60 * 1000
    };
  }

  /**
   * 获取CORS配置
   * @returns {Object} CORS配置
   */
  getCORSConfig() {
    // 🔧 修复：正确解析ALLOWED_ORIGINS为数组
    let allowedOrigins = [];
    if (this.config.ALLOWED_ORIGINS) {
      if (typeof this.config.ALLOWED_ORIGINS === 'string') {
        allowedOrigins = this.config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
      } else if (Array.isArray(this.config.ALLOWED_ORIGINS)) {
        allowedOrigins = this.config.ALLOWED_ORIGINS;
      }
    }
    
    // 默认允许的来源
    const defaultOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://101.201.148.8',
      'http://101.201.148.8:80'
    ];
    
    // 合并配置的来源和默认来源
    const finalOrigins = [...new Set([...defaultOrigins, ...allowedOrigins])];
    
    return {
      allowedOrigins: finalOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    };
  }

  /**
   * 获取日志配置
   * @returns {Object} 日志配置
   */
  getLogConfig() {
    return {
      level: this.config.LOG_LEVEL,
      filePath: this.config.LOG_FILE_PATH
    };
  }

  /**
   * 检查是否为生产环境
   * @returns {boolean} 是否为生产环境
   */
  isProduction() {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * 检查是否为开发环境
   * @returns {boolean} 是否为开发环境
   */
  isDevelopment() {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * 检查是否为测试环境
   * @returns {boolean} 是否为测试环境
   */
  isTest() {
    return this.config.NODE_ENV === 'test';
  }

  /**
   * 获取配置摘要（隐藏敏感信息）
   * @returns {Object} 配置摘要
   */
  getSummary() {
    const summary = { ...this.config };
    
    // 隐藏敏感信息
    if (summary.JWT_SECRET) {
      summary.JWT_SECRET = '***' + summary.JWT_SECRET.slice(-4);
    }
    if (summary.ARK_API_KEY) {
      summary.ARK_API_KEY = '***' + summary.ARK_API_KEY.slice(-4);
    }
    if (summary.DATABASE_URL) {
      summary.DATABASE_URL = summary.DATABASE_URL.replace(/:[^:@]*@/, ':***@');
    }
    
    return summary;
  }

  /**
   * 验证必要的配置项是否已设置
   * @returns {Object} 验证结果
   */
  validateRequired() {
    const required = ['JWT_SECRET', 'ARK_API_KEY'];
    const missing = required.filter(key => !this.config[key]);
    
    return {
      isValid: missing.length === 0,
      missingKeys: missing,
      message: missing.length > 0 
        ? `缺少必要的配置项: ${missing.join(', ')}` 
        : '所有必要配置项已设置'
    };
  }

  /**
   * 打印配置摘要
   */
  printSummary() {
    console.log('\n🔧 应用配置摘要:');
    console.log('=====================================');
    console.log(`环境: ${this.config.NODE_ENV}`);
    console.log(`端口: ${this.config.PORT}`);
    console.log(`数据库: ${this.config.DATABASE_URL}`);
    console.log(`AI模型: ${this.config.ARK_MODEL}`);
    console.log(`积分消费: ${this.config.ANALYSIS_POINTS_COST} 积分/次`);
    console.log(`注册奖励: ${this.config.REGISTER_BONUS_POINTS} 积分`);
    console.log(`缓存时间: ${this.config.CACHE_TTL_MINUTES} 分钟`);
    console.log(`限流窗口: ${this.config.RATE_LIMIT_WINDOW_MS / 1000 / 60} 分钟`);
    console.log(`最大请求: ${this.config.RATE_LIMIT_MAX_REQUESTS} 次/窗口`);
    console.log('=====================================\n');
  }
}

// 创建配置实例
let configInstance = null;

export function createConfig() {
  if (!configInstance) {
    configInstance = new AppConfig();
  }
  return configInstance;
}

export function getConfig() {
  if (!configInstance) {
    throw new Error('配置未初始化，请先调用 createConfig()');
  }
  return configInstance;
}

// 导出默认配置实例
export default createConfig(); 