import Redis from 'ioredis';

/**
 * Redis缓存服务
 * 提供高性能的分布式缓存支持
 */
export class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableOfflineQueue: true,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    };
  }

  /**
   * 初始化Redis连接
   */
  async initialize() {
    try {
      // 如果没有配置Redis URL，使用内存缓存
      if (!process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Redis未配置，使用内存缓存（不推荐用于生产环境）');
        this.useMemoryCache = true;
        this.memoryCache = new Map();
        return;
      }

      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
      } else {
        this.redis = new Redis(this.config);
      }

      this.redis.on('connect', () => {
        console.log('✅ Redis连接成功');
        this.isConnected = true;
      });

      this.redis.on('error', (err) => {
        console.error('❌ Redis连接错误:', err.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis连接关闭');
        this.isConnected = false;
      });

      // 测试连接
      await this.redis.ping();
      
    } catch (error) {
      console.error('❌ Redis初始化失败:', error.message);
      console.log('📝 回退到内存缓存');
      this.useMemoryCache = true;
      this.memoryCache = new Map();
    }
  }

  /**
   * 获取缓存
   */
  async get(key) {
    try {
      if (this.useMemoryCache) {
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return JSON.parse(cached.value);
        }
        this.memoryCache.delete(key);
        return null;
      }

      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('缓存获取失败:', error);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  async set(key, value, ttl = 300) {
    try {
      const serialized = JSON.stringify(value);
      
      if (this.useMemoryCache) {
        this.memoryCache.set(key, {
          value: serialized,
          expiry: Date.now() + (ttl * 1000)
        });
        // 限制内存缓存大小
        if (this.memoryCache.size > 1000) {
          const firstKey = this.memoryCache.keys().next().value;
          this.memoryCache.delete(firstKey);
        }
        return true;
      }

      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('缓存设置失败:', error);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  async del(key) {
    try {
      if (this.useMemoryCache) {
        return this.memoryCache.delete(key);
      }
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('缓存删除失败:', error);
      return false;
    }
  }

  /**
   * 批量删除缓存
   */
  async delPattern(pattern) {
    try {
      if (this.useMemoryCache) {
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern.replace('*', ''))) {
            this.memoryCache.delete(key);
          }
        }
        return true;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('批量删除缓存失败:', error);
      return false;
    }
  }

  /**
   * 缓存是否存在
   */
  async exists(key) {
    try {
      if (this.useMemoryCache) {
        const cached = this.memoryCache.get(key);
        return cached && cached.expiry > Date.now();
      }
      return await this.redis.exists(key) === 1;
    } catch (error) {
      console.error('检查缓存存在失败:', error);
      return false;
    }
  }

  /**
   * 设置哈希字段
   */
  async hset(key, field, value, ttl = 300) {
    try {
      if (this.useMemoryCache) {
        const hashKey = `${key}:${field}`;
        return this.set(hashKey, value, ttl);
      }

      await this.redis.hset(key, field, JSON.stringify(value));
      if (ttl) {
        await this.redis.expire(key, ttl);
      }
      return true;
    } catch (error) {
      console.error('哈希设置失败:', error);
      return false;
    }
  }

  /**
   * 获取哈希字段
   */
  async hget(key, field) {
    try {
      if (this.useMemoryCache) {
        const hashKey = `${key}:${field}`;
        return this.get(hashKey);
      }

      const value = await this.redis.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('哈希获取失败:', error);
      return null;
    }
  }

  /**
   * 增加计数
   */
  async incr(key, ttl = 3600) {
    try {
      if (this.useMemoryCache) {
        const current = await this.get(key) || 0;
        const newValue = current + 1;
        await this.set(key, newValue, ttl);
        return newValue;
      }

      const result = await this.redis.incr(key);
      if (ttl) {
        await this.redis.expire(key, ttl);
      }
      return result;
    } catch (error) {
      console.error('计数增加失败:', error);
      return 0;
    }
  }

  /**
   * 获取缓存统计
   */
  async getStats() {
    if (this.useMemoryCache) {
      return {
        type: 'memory',
        size: this.memoryCache.size,
        maxSize: 1000
      };
    }

    try {
      const info = await this.redis.info('memory');
      const lines = info.split('\r\n');
      const stats = {};
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          stats[key] = value;
        }
      });

      return {
        type: 'redis',
        used_memory: stats.used_memory_human,
        used_memory_peak: stats.used_memory_peak_human,
        connected: this.isConnected
      };
    } catch (error) {
      return {
        type: 'redis',
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * 清理过期的内存缓存
   */
  cleanupMemoryCache() {
    if (!this.useMemoryCache) return;

    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expiry < now) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * 关闭连接
   */
  async close() {
    if (this.redis && this.isConnected) {
      await this.redis.quit();
      console.log('✅ Redis连接已关闭');
    }
    if (this.memoryCache) {
      this.memoryCache.clear();
    }
  }
}

// 单例模式
let cacheInstance = null;

export async function createCacheService() {
  if (!cacheInstance) {
    cacheInstance = new CacheService();
    await cacheInstance.initialize();
    
    // 定期清理内存缓存
    if (cacheInstance.useMemoryCache) {
      setInterval(() => {
        cacheInstance.cleanupMemoryCache();
      }, 60000); // 每分钟清理一次
    }
  }
  return cacheInstance;
}

export function getCacheService() {
  if (!cacheInstance) {
    throw new Error('缓存服务未初始化，请先调用 createCacheService()');
  }
  return cacheInstance;
}