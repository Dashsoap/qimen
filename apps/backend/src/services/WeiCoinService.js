import { PrismaClient } from '@prisma/client';

/**
 * 未币服务类 - 管理用户未币（付费虚拟货币）操作
 * 未币用于高级AI分析、VIP服务等付费功能
 */
export class WeiCoinService {
  constructor(prisma) {
    this.prisma = prisma;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存过期
    
    // 未币兑换比例配置
    this.exchangeRates = {
      CNY_TO_WEICOIN: 100, // 1元 = 100未币
      BONUS_RATES: {
        recharge_10: 0.05,   // 充值10元及以上，5%奖励
        recharge_50: 0.10,   // 充值50元及以上，10%奖励
        recharge_100: 0.15,  // 充值100元及以上，15%奖励
        vip_monthly: 0.20,   // VIP月卡用户20%奖励
        vip_yearly: 0.30     // VIP年卡用户30%奖励
      }
    };

    // 服务消费配置
    this.serviceCosts = {
      MASTER_ANALYSIS: 500,    // 大师级分析
      PREMIUM_REPORT: 300,     // 高级报告
      PERSONAL_CONSULTATION: 1000, // 个人咨询
      CUSTOM_SERVICE: 200      // 定制服务
    };
  }

  /**
   * 获取用户未币信息（带缓存）
   * @param {string} userId - 用户ID
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} 用户未币信息
   */
  async getUserWeiCoins(userId, forceRefresh = false) {
    const cacheKey = `weicoins_${userId}`;
    
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const weiCoins = await this.prisma.userWeiCoins.findUnique({
      where: { userId },
      include: {
        weiCoinRecords: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (weiCoins) {
      this.cache.set(cacheKey, {
        data: weiCoins,
        timestamp: Date.now()
      });
    }

    return weiCoins;
  }

  /**
   * 初始化用户未币账户
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 创建的未币账户
   */
  async initializeUserWeiCoins(userId) {
    return await this.prisma.userWeiCoins.create({
      data: {
        userId: userId,
        balance: 0,
        totalPurchased: 0,
        totalSpent: 0,
        totalEarned: 0
      }
    });
  }

  /**
   * 检查用户未币余额
   * @param {string} userId - 用户ID
   * @param {number} requiredAmount - 需要的未币数量
   * @returns {Promise<{sufficient: boolean, currentBalance: number}>}
   */
  async checkWeiCoinBalance(userId, requiredAmount) {
    const weiCoins = await this.getUserWeiCoins(userId);
    
    if (!weiCoins) {
      return { sufficient: false, currentBalance: 0 };
    }

    return {
      sufficient: weiCoins.balance >= requiredAmount,
      currentBalance: weiCoins.balance
    };
  }

  /**
   * 消费未币（使用事务确保原子性）
   * @param {string} userId - 用户ID
   * @param {number} amount - 消费数量
   * @param {string} serviceType - 服务类型
   * @param {string} description - 消费描述
   * @returns {Promise<Object>} 交易结果
   */
  async spendWeiCoins(userId, amount, serviceType, description = '未币消费') {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 获取当前未币账户
      const currentWeiCoins = await tx.userWeiCoins.findUnique({
        where: { userId }
      });

      if (!currentWeiCoins) {
        throw new Error('用户未币账户不存在');
      }

      // 2. 检查余额
      if (currentWeiCoins.balance < amount) {
        throw new Error(`未币余额不足，当前余额：${currentWeiCoins.balance}，需要：${amount}`);
      }

      // 3. 更新未币并创建记录
      const updatedWeiCoins = await tx.userWeiCoins.update({
        where: { userId },
        data: {
          balance: currentWeiCoins.balance - amount,
          totalSpent: currentWeiCoins.totalSpent + amount,
          weiCoinRecords: {
            create: {
              amount: amount,
              type: 'spent',
              source: serviceType,
              description: description,
              relatedService: serviceType
            }
          }
        },
        include: {
          weiCoinRecords: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // 4. 清除缓存
      this.clearUserCache(userId);

      return {
        success: true,
        transaction: updatedWeiCoins.weiCoinRecords[0],
        newBalance: updatedWeiCoins.balance,
        amountSpent: amount
      };
    });
  }

  /**
   * 充值未币（创建充值订单）
   * @param {string} userId - 用户ID
   * @param {number} amount - 充值金额（人民币）
   * @param {string} paymentMethod - 支付方式
   * @returns {Promise<Object>} 充值订单信息
   */
  async createRechargeOrder(userId, amount, paymentMethod) {
    // 计算获得的未币数量
    const baseWeiCoins = Math.floor(amount * this.exchangeRates.CNY_TO_WEICOIN);
    const bonusWeiCoins = this.calculateBonusWeiCoins(amount, userId);
    const totalWeiCoins = baseWeiCoins + bonusWeiCoins;

    const orderId = this.generateOrderId();

    return await this.prisma.rechargeOrder.create({
      data: {
        userId,
        orderId,
        amount,
        weiCoins: totalWeiCoins,
        paymentMethod,
        status: 'pending'
      }
    });
  }

  /**
   * 完成充值订单（支付成功后调用）
   * @param {string} orderId - 订单ID
   * @param {string} paymentId - 第三方支付ID
   * @returns {Promise<Object>} 充值结果
   */
  async completeRechargeOrder(orderId, paymentId) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 获取订单信息
      const order = await tx.rechargeOrder.findUnique({
        where: { orderId }
      });

      if (!order || order.status !== 'pending') {
        throw new Error('订单状态异常');
      }

      // 2. 更新订单状态
      await tx.rechargeOrder.update({
        where: { orderId },
        data: {
          status: 'success',
          paymentId,
          completedAt: new Date()
        }
      });

      // 3. 增加用户未币
      const updatedWeiCoins = await tx.userWeiCoins.update({
        where: { userId: order.userId },
        data: {
          balance: { increment: order.weiCoins },
          totalPurchased: { increment: order.weiCoins },
          weiCoinRecords: {
            create: {
              amount: order.weiCoins,
              type: 'purchase',
              source: 'recharge',
              description: `充值${order.amount}元获得${order.weiCoins}未币`,
              orderId: orderId
            }
          }
        }
      });

      // 4. 清除缓存
      this.clearUserCache(order.userId);

      return {
        success: true,
        orderId,
        amount: order.amount,
        weiCoins: order.weiCoins,
        newBalance: updatedWeiCoins.balance
      };
    });
  }

  /**
   * 赠送未币（活动奖励、VIP赠送等）
   * @param {string} userId - 用户ID
   * @param {number} amount - 赠送数量
   * @param {string} source - 赠送来源
   * @param {string} description - 描述
   * @returns {Promise<Object>} 赠送结果
   */
  async grantWeiCoins(userId, amount, source, description = '未币赠送') {
    return await this.prisma.$transaction(async (tx) => {
      const updatedWeiCoins = await tx.userWeiCoins.update({
        where: { userId },
        data: {
          balance: { increment: amount },
          totalEarned: { increment: amount },
          weiCoinRecords: {
            create: {
              amount: amount,
              type: 'earned',
              source: source,
              description: description
            }
          }
        },
        include: {
          weiCoinRecords: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      this.clearUserCache(userId);

      return {
        success: true,
        transaction: updatedWeiCoins.weiCoinRecords[0],
        newBalance: updatedWeiCoins.balance,
        amountGranted: amount
      };
    });
  }

  /**
   * 获取未币交易历史
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 交易历史
   */
  async getWeiCoinHistory(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      type = null,
      source = null,
      startDate = null,
      endDate = null
    } = options;

    const skip = (page - 1) * limit;
    
    const where = {
      userWeiCoins: {
        userId: userId
      }
    };

    if (type) where.type = type;
    if (source) where.source = source;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      this.prisma.weiCoinRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.weiCoinRecord.count({ where })
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
   * 计算奖励未币
   * @param {number} amount - 充值金额
   * @param {string} userId - 用户ID
   * @returns {Promise<number>} 奖励未币数量
   */
  async calculateBonusWeiCoins(amount, userId) {
    let bonusRate = 0;

    // 根据充值金额计算奖励比例
    if (amount >= 100) bonusRate = this.exchangeRates.BONUS_RATES.recharge_100;
    else if (amount >= 50) bonusRate = this.exchangeRates.BONUS_RATES.recharge_50;
    else if (amount >= 10) bonusRate = this.exchangeRates.BONUS_RATES.recharge_10;

    // 检查VIP状态，增加奖励比例
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (user?.subscription?.status === 'active') {
      const planType = user.subscription.planType;
      if (planType === 'professional') {
        bonusRate += this.exchangeRates.BONUS_RATES.vip_yearly;
      } else if (planType === 'advanced') {
        bonusRate += this.exchangeRates.BONUS_RATES.vip_monthly;
      }
    }

    const baseWeiCoins = Math.floor(amount * this.exchangeRates.CNY_TO_WEICOIN);
    return Math.floor(baseWeiCoins * bonusRate);
  }

  /**
   * 生成订单号
   * @returns {string} 订单号
   */
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WC${timestamp}${random}`;
  }

  /**
   * 获取服务价格
   * @param {string} serviceType - 服务类型
   * @returns {number} 所需未币数量
   */
  getServiceCost(serviceType) {
    return this.serviceCosts[serviceType] || 0;
  }

  /**
   * 清除用户缓存
   * @param {string} userId - 用户ID
   */
  clearUserCache(userId) {
    const cacheKey = `weicoins_${userId}`;
    this.cache.delete(cacheKey);
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this.cache.clear();
  }
}

// 导出单例
let weiCoinServiceInstance = null;

export function createWeiCoinService(prisma) {
  if (!weiCoinServiceInstance) {
    weiCoinServiceInstance = new WeiCoinService(prisma);
  }
  return weiCoinServiceInstance;
}

export function getWeiCoinService() {
  if (!weiCoinServiceInstance) {
    throw new Error('WeiCoinService not initialized. Call createWeiCoinService first.');
  }
  return weiCoinServiceInstance;
}