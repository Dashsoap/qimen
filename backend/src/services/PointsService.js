import { PrismaClient } from '@prisma/client';

/**
 * 积分服务类 - 统一管理用户积分操作
 * 使用事务确保数据一致性，实现缓存提升性能
 */
export class PointsService {
  constructor(prisma) {
    this.prisma = prisma;
    // 简单内存缓存，生产环境建议使用Redis
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存过期
  }

  /**
   * 获取用户积分信息（带缓存）
   * @param {string} userId - 用户ID
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 用户积分信息
   */
  async getUserPoints(userId, forceRefresh = false) {
    const cacheKey = `points_${userId}`;
    
    // 检查缓存
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // 从数据库查询
    const points = await this.prisma.userPoints.findUnique({
      where: { userId },
      include: {
        pointsRecords: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (points) {
      // 更新缓存
      this.cache.set(cacheKey, {
        data: points,
        timestamp: Date.now()
      });
    }

    return points;
  }

  /**
   * 检查用户积分余额
   * @param {string} userId - 用户ID
   * @param {number} requiredAmount - 需要的积分数量
   * @returns {Promise<{sufficient: boolean, currentBalance: number}>}
   */
  async checkBalance(userId, requiredAmount) {
    const points = await this.getUserPoints(userId);
    
    if (!points) {
      return { sufficient: false, currentBalance: 0 };
    }

    return {
      sufficient: points.balance >= requiredAmount,
      currentBalance: points.balance
    };
  }

  /**
   * 消费积分（使用事务确保原子性）
   * @param {string} userId - 用户ID
   * @param {number} amount - 消费数量
   * @param {string} description - 消费描述
   * @returns {Promise<Object>} 交易结果
   */
  async spendPoints(userId, amount, description = '积分消费') {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 获取当前积分（使用悲观锁）
      const currentPoints = await tx.userPoints.findUnique({
        where: { userId }
      });

      if (!currentPoints) {
        throw new Error('用户积分记录不存在');
      }

      // 2. 检查余额
      if (currentPoints.balance < amount) {
        throw new Error(`积分余额不足，当前余额：${currentPoints.balance}，需要：${amount}`);
      }

      // 3. 更新积分并创建记录
      const updatedPoints = await tx.userPoints.update({
        where: { userId },
        data: {
          balance: currentPoints.balance - amount,
          totalSpent: currentPoints.totalSpent + amount,
          pointsRecords: {
            create: {
              amount: amount,
              type: 'spent',
              description: description
            }
          }
        },
        include: {
          pointsRecords: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // 4. 清除缓存
      this.clearUserCache(userId);

      return {
        success: true,
        transaction: updatedPoints.pointsRecords[0],
        newBalance: updatedPoints.balance,
        amountSpent: amount
      };
    });
  }

  /**
   * 获得积分（使用事务确保原子性）
   * @param {string} userId - 用户ID
   * @param {number} amount - 获得数量
   * @param {string} description - 获得描述
   * @returns {Promise<Object>} 交易结果
   */
  async earnPoints(userId, amount, description = '积分获得') {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 获取当前积分
      const currentPoints = await tx.userPoints.findUnique({
        where: { userId }
      });

      if (!currentPoints) {
        throw new Error('用户积分记录不存在');
      }

      // 2. 更新积分并创建记录
      const updatedPoints = await tx.userPoints.update({
        where: { userId },
        data: {
          balance: currentPoints.balance + amount,
          totalEarned: currentPoints.totalEarned + amount,
          pointsRecords: {
            create: {
              amount: amount,
              type: 'earned',
              description: description
            }
          }
        },
        include: {
          pointsRecords: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // 3. 清除缓存
      this.clearUserCache(userId);

      return {
        success: true,
        transaction: updatedPoints.pointsRecords[0],
        newBalance: updatedPoints.balance,
        amountEarned: amount
      };
    });
  }

  /**
   * 积分转账（用户之间转移积分）
   * @param {string} fromUserId - 转出用户ID
   * @param {string} toUserId - 转入用户ID
   * @param {number} amount - 转账数量
   * @param {string} description - 转账描述
   * @returns {Promise<Object>} 转账结果
   */
  async transferPoints(fromUserId, toUserId, amount, description = '积分转账') {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 检查转出用户余额
      const fromPoints = await tx.userPoints.findUnique({
        where: { userId: fromUserId }
      });

      if (!fromPoints || fromPoints.balance < amount) {
        throw new Error('转出用户积分不足');
      }

      // 2. 检查转入用户是否存在
      const toPoints = await tx.userPoints.findUnique({
        where: { userId: toUserId }
      });

      if (!toPoints) {
        throw new Error('转入用户不存在');
      }

      // 3. 执行转账
      await tx.userPoints.update({
        where: { userId: fromUserId },
        data: {
          balance: fromPoints.balance - amount,
          totalSpent: fromPoints.totalSpent + amount,
          pointsRecords: {
            create: {
              amount: amount,
              type: 'spent',
              description: `${description} (转给用户${toUserId})`
            }
          }
        }
      });

      await tx.userPoints.update({
        where: { userId: toUserId },
        data: {
          balance: toPoints.balance + amount,
          totalEarned: toPoints.totalEarned + amount,
          pointsRecords: {
            create: {
              amount: amount,
              type: 'earned',
              description: `${description} (来自用户${fromUserId})`
            }
          }
        }
      });

      // 4. 清除相关缓存
      this.clearUserCache(fromUserId);
      this.clearUserCache(toUserId);

      return {
        success: true,
        fromBalance: fromPoints.balance - amount,
        toBalance: toPoints.balance + amount,
        amount: amount
      };
    });
  }

  /**
   * 获取积分交易历史
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 交易历史
   */
  async getPointsHistory(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      type = null, // 'earned' | 'spent' | null
      startDate = null,
      endDate = null
    } = options;

    const skip = (page - 1) * limit;
    
    const where = {
      userPoints: {
        userId: userId
      }
    };

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      this.prisma.pointsRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.pointsRecord.count({ where })
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 清除用户缓存
   * @param {string} userId - 用户ID
   */
  clearUserCache(userId) {
    const cacheKey = `points_${userId}`;
    this.cache.delete(cacheKey);
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 导出单例
let pointsServiceInstance = null;

export function createPointsService(prisma) {
  if (!pointsServiceInstance) {
    pointsServiceInstance = new PointsService(prisma);
  }
  return pointsServiceInstance;
}

export function getPointsService() {
  if (!pointsServiceInstance) {
    throw new Error('PointsService not initialized. Call createPointsService first.');
  }
  return pointsServiceInstance;
} 