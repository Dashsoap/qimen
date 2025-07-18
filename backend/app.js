#!/usr/bin/env node

import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

// 导入配置和服务
import { createConfig, getConfig } from './src/config/AppConfig.js';
import { createPointsService, getPointsService } from './src/services/PointsService.js';
import { createAIService, getAIService, AnalysisStrategy } from './src/services/AIService.js';
import { configureMiddlewares } from './src/middleware/index.js';

// 导入数据库初始化
import { initDatabase } from './src/database/init.js';

/**
 * 奇门遁甲AI分析系统 - 统一版本
 * 整合了用户认证、积分系统、AI分析等所有功能
 */
class QimenServer {
  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.config = null;
    this.pointsService = null;
    this.aiService = null;
    this.middlewares = null;
  }

  /**
   * 初始化服务器
   */
  async initialize() {
    try {
      console.log('🚀 正在初始化奇门遁甲AI系统...');
      
      // 1. 加载配置
      this.config = createConfig();
      this.config.printSummary();
      
      // 2. 验证必要配置
      const validation = this.config.validateRequired();
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      
      // 3. 初始化数据库
      console.log('📊 初始化数据库连接...');
      await initDatabase();
      
      // 4. 初始化服务
      console.log('🔧 初始化核心服务...');
      this.pointsService = createPointsService(this.prisma);
      this.aiService = createAIService();
      
      // 5. 配置中间件
      console.log('🛡️ 配置安全中间件...');
      this.middlewares = configureMiddlewares(this.app, this.prisma);
      
      // 6. 设置路由
      console.log('🛣️ 配置API路由...');
      this.setupRoutes();
      
      // 7. 配置错误处理
      this.app.use(this.middlewares.errorHandler);
      this.app.use(this.middlewares.notFoundHandler);
      
      console.log('✅ 服务器初始化完成');
      
    } catch (error) {
      console.error('❌ 服务器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 设置所有路由
   */
  setupRoutes() {
    // 根路径
    this.app.get('/', this.getServerInfo.bind(this));
    
    // 健康检查
    this.app.get('/health', this.middlewares.healthCheck);
    
    // 认证路由
    this.setupAuthRoutes();
    
    // 积分路由
    this.setupPointsRoutes();
    
    // 签到路由
    this.setupCheckinRoutes();
    
    // 奇门遁甲路由
    this.setupQimenRoutes();
    
    // AI分析路由
    this.setupAnalysisRoutes();
  }

  /**
   * 获取服务器信息
   */
  getServerInfo(req, res) {
    const serverConfig = this.config.getServerConfig();
    
    res.json({
      message: '🔮 鬼谷奇门遁甲 - 统一版后端服务',
      version: '3.0.0',
      status: 'running',
      environment: serverConfig.nodeEnv,
      features: [
        '✅ 统一架构设计',
        '✅ 优化数据库事务',
        '✅ 智能缓存系统',
        '✅ 差异化限流',
        '✅ 多策略AI分析',
        '✅ 完整错误处理',
        '✅ 配置管理优化'
      ],
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          profile: 'GET /api/auth/profile'
        },
        points: {
          get: 'GET /api/points',
          transaction: 'POST /api/points/transaction',
          transfer: 'POST /api/points/transfer',
          history: 'GET /api/points/history'
        },
        checkin: {
          status: 'GET /api/checkin/status',
          checkin: 'POST /api/checkin',
          history: 'GET /api/checkin/history'
        },
        qimen: {
          paipan: 'POST /api/qimen/paipan',
          analysis: 'POST /api/analysis/qimen',
          analysisSimple: 'POST /api/analysis/qimen/simple',
          analysisStream: 'POST /api/analysis/qimen/stream'
        }
      },
      optimization: {
        database_transactions: 'enabled',
        points_cache: 'enabled',
        ai_strategies: Object.values(AnalysisStrategy),
        rate_limiting: 'differential',
        error_handling: 'structured'
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 设置认证路由
   */
  setupAuthRoutes() {
    const { authRateLimit, authMiddleware } = this.middlewares;
    
    // 用户注册
    this.app.post('/api/auth/register', authRateLimit, this.register.bind(this));
    
    // 用户登录
    this.app.post('/api/auth/login', authRateLimit, this.login.bind(this));
    
    // 用户登出
    this.app.post('/api/auth/logout', authMiddleware, this.logout.bind(this));
    
    // 获取用户资料
    this.app.get('/api/auth/profile', authMiddleware, this.getProfile.bind(this));
  }

  /**
   * 设置积分路由
   */
  setupPointsRoutes() {
    const { authMiddleware } = this.middlewares;
    
    // 获取积分信息
    this.app.get('/api/points', authMiddleware, this.getPoints.bind(this));
    
    // 积分交易
    this.app.post('/api/points/transaction', authMiddleware, this.pointsTransaction.bind(this));
    
    // 积分转账
    this.app.post('/api/points/transfer', authMiddleware, this.pointsTransfer.bind(this));
    
    // 积分历史
    this.app.get('/api/points/history', authMiddleware, this.getPointsHistory.bind(this));
  }

  /**
   * 设置签到路由
   */
  setupCheckinRoutes() {
    const { authMiddleware } = this.middlewares;
    
    // 获取签到状态
    this.app.get('/api/checkin/status', authMiddleware, this.getCheckinStatus.bind(this));
    
    // 执行签到
    this.app.post('/api/checkin', authMiddleware, this.checkin.bind(this));
    
    // 签到历史
    this.app.get('/api/checkin/history', authMiddleware, this.getCheckinHistory.bind(this));
  }

  /**
   * 设置奇门遁甲路由
   */
  setupQimenRoutes() {
    const { optionalAuthMiddleware } = this.middlewares;
    
    // 排盘API（可选登录）
    this.app.post('/api/qimen/paipan', optionalAuthMiddleware, this.paipan.bind(this));
  }

  /**
   * 设置AI分析路由
   */
  setupAnalysisRoutes() {
    const { authMiddleware, aiRateLimit } = this.middlewares;
    
    // 深度AI分析（需要登录+积分）
    this.app.post('/api/analysis/qimen', authMiddleware, aiRateLimit, this.aiAnalysis.bind(this));
    
    // 简单AI分析（需要登录+积分）
    this.app.post('/api/analysis/qimen/simple', authMiddleware, aiRateLimit, this.aiAnalysisSimple.bind(this));
    
    // 流式AI分析（需要登录+积分）
    this.app.post('/api/analysis/qimen/stream', authMiddleware, aiRateLimit, this.aiAnalysisStream.bind(this));
  }

  // === 认证相关处理器 ===

  /**
   * 用户注册
   */
  async register(req, res) {
    try {
      const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: '输入数据验证失败',
          details: error.details.map(d => d.message)
        });
      }

      const { username, email, password, phone } = value;

      // 检查用户是否已存在
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email },
            ...(phone ? [{ phone }] : [])
          ]
        }
      });

      if (existingUser) {
        let conflictField = '用户';
        if (existingUser.username === username) conflictField = '用户名';
        else if (existingUser.email === email) conflictField = '邮箱';
        else if (existingUser.phone === phone) conflictField = '手机号';
        
        return res.status(409).json({
          success: false,
          error: `${conflictField}已存在`
        });
      }

      // 加密密码
      const cryptoConfig = this.config.getCryptoConfig();
      const hashedPassword = await bcrypt.hash(password, cryptoConfig.bcryptRounds);

      // 创建用户（包含积分奖励）
      const pointsConfig = this.config.getPointsConfig();
      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          phone,
          points: {
            create: {
              balance: pointsConfig.registerBonusPoints,
              totalEarned: pointsConfig.registerBonusPoints,
              totalSpent: 0,
              pointsRecords: {
                create: {
                  amount: pointsConfig.registerBonusPoints,
                  type: 'earned',
                  description: '注册奖励'
                }
              }
            }
          }
        },
        include: {
          profile: true,
          points: {
            include: {
              pointsRecords: true
            }
          }
        }
      });

      // 生成JWT令牌
      const jwtConfig = this.config.getJWTConfig();
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: `注册成功！获得${pointsConfig.registerBonusPoints}积分奖励`,
        user: userWithoutPassword,
        token,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        error: '注册失败',
        message: '服务器内部错误'
      });
    }
  }

  /**
   * 用户登录
   */
  async login(req, res) {
    try {
      const schema = Joi.object({
        usernameOrEmail: Joi.string().required(),
        password: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: '输入数据验证失败',
          details: error.details.map(d => d.message)
        });
      }

      const { usernameOrEmail, password } = value;

      // 查找用户
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: usernameOrEmail },
            { email: usernameOrEmail }
          ]
        },
        include: {
          profile: true,
          points: {
            include: {
              pointsRecords: {
                take: 10,
                orderBy: { createdAt: 'desc' }
              }
            }
          },
          subscription: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: '密码错误'
        });
      }

      // 生成JWT令牌
      const jwtConfig = this.config.getJWTConfig();
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: '登录成功',
        user: userWithoutPassword,
        token,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        error: '登录失败'
      });
    }
  }

  /**
   * 用户登出
   */
  logout(req, res) {
    res.json({
      success: true,
      message: '已成功登出'
    });
  }

  /**
   * 获取用户资料
   */
  getProfile(req, res) {
    const { password, ...userWithoutPassword } = req.user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  }

  // === 积分相关处理器 ===

  /**
   * 获取积分信息
   */
  async getPoints(req, res) {
    try {
      const points = await this.pointsService.getUserPoints(req.user.id);
      
      if (!points) {
        return res.status(404).json({
          success: false,
          error: '积分记录不存在'
        });
      }

      res.json({
        success: true,
        points,
        cacheStats: this.pointsService.getCacheStats()
      });

    } catch (error) {
      console.error('获取积分错误:', error);
      res.status(500).json({
        success: false,
        error: '获取积分失败'
      });
    }
  }

  /**
   * 积分交易
   */
  async pointsTransaction(req, res) {
    try {
      const { amount, type, description } = req.body;

      if (!amount || !type || !['earned', 'spent'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: '参数错误'
        });
      }

      const numAmount = parseInt(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: '积分数量必须是正整数'
        });
      }

      let result;
      if (type === 'earned') {
        result = await this.pointsService.earnPoints(req.user.id, numAmount, description);
      } else {
        result = await this.pointsService.spendPoints(req.user.id, numAmount, description);
      }

      res.json({
        success: true,
        message: type === 'earned' ? '积分获得成功' : '积分消费成功',
        ...result
      });

    } catch (error) {
      console.error('积分交易错误:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 积分转账
   */
  async pointsTransfer(req, res) {
    try {
      const { toUserId, amount, description } = req.body;

      if (!toUserId || !amount) {
        return res.status(400).json({
          success: false,
          error: '缺少必要参数'
        });
      }

      const numAmount = parseInt(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: '转账金额必须是正整数'
        });
      }

      const result = await this.pointsService.transferPoints(
        req.user.id, 
        toUserId, 
        numAmount, 
        description || '积分转账'
      );

      res.json({
        success: true,
        message: '积分转账成功',
        ...result
      });

    } catch (error) {
      console.error('积分转账错误:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取积分历史
   */
  async getPointsHistory(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const history = await this.pointsService.getPointsHistory(req.user.id, options);

      res.json({
        success: true,
        ...history
      });

    } catch (error) {
      console.error('获取积分历史失败:', error);
      res.status(500).json({
        success: false,
        error: '获取积分历史失败'
      });
    }
  }

  // === 签到相关处理器 ===

  /**
   * 获取签到状态
   */
  async getCheckinStatus(req, res) {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const todayCheckin = await this.prisma.pointsRecord.findFirst({
        where: {
          userPoints: {
            userId: req.user.id
          },
          type: 'earned',
          description: {
            contains: '每日签到'
          },
          createdAt: {
            gte: new Date(todayStr + 'T00:00:00.000Z'),
            lt: new Date(todayStr + 'T23:59:59.999Z')
          }
        }
      });

      const continuousStreak = await this.getCheckinStreak(req.user.id);

      res.json({
        success: true,
        data: {
          isCheckedIn: !!todayCheckin,
          checkinTime: todayCheckin?.createdAt || null,
          continuousStreak: continuousStreak,
          todayBonus: this.getCheckinBonus(continuousStreak + 1)
        }
      });

    } catch (error) {
      console.error('获取签到状态错误:', error);
      res.status(500).json({
        success: false,
        error: '获取签到状态失败'
      });
    }
  }

  /**
   * 执行签到
   */
  async checkin(req, res) {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // 检查今日是否已签到
      const todayCheckin = await this.prisma.pointsRecord.findFirst({
        where: {
          userPoints: {
            userId: req.user.id
          },
          type: 'earned',
          description: {
            contains: '每日签到'
          },
          createdAt: {
            gte: new Date(todayStr + 'T00:00:00.000Z'),
            lt: new Date(todayStr + 'T23:59:59.999Z')
          }
        }
      });

      if (todayCheckin) {
        return res.status(400).json({
          success: false,
          error: '今日已签到'
        });
      }

      const continuousStreak = await this.getCheckinStreak(req.user.id);
      const newStreak = continuousStreak + 1;
      const bonus = this.getCheckinBonus(newStreak);

      // 使用积分服务添加签到奖励
      const result = await this.pointsService.earnPoints(
        req.user.id, 
        bonus, 
        `每日签到奖励 (连续${newStreak}天)`
      );

      res.json({
        success: true,
        message: '签到成功',
        data: {
          bonus: bonus,
          newBalance: result.newBalance,
          continuousStreak: newStreak,
          checkinTime: new Date().toISOString(),
          nextDayBonus: this.getCheckinBonus(newStreak + 1)
        }
      });

    } catch (error) {
      console.error('签到失败:', error);
      res.status(500).json({
        success: false,
        error: '签到失败'
      });
    }
  }

  /**
   * 获取签到历史
   */
  async getCheckinHistory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const checkinHistory = await this.prisma.pointsRecord.findMany({
        where: {
          userPoints: {
            userId: req.user.id
          },
          type: 'earned',
          description: {
            contains: '每日签到'
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      });

      const total = await this.prisma.pointsRecord.count({
        where: {
          userPoints: {
            userId: req.user.id
          },
          type: 'earned',
          description: {
            contains: '每日签到'
          }
        }
      });

      res.json({
        success: true,
        data: {
          checkinHistory,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('获取签到历史失败:', error);
      res.status(500).json({
        success: false,
        error: '获取签到历史失败'
      });
    }
  }

  // === 奇门遁甲相关处理器 ===

  /**
   * 排盘API
   */
  paipan(req, res) {
    const { question } = req.body;
    
    const username = req.user ? req.user.username : '匿名用户';
    console.log('排盘请求:', username, question);
    
    // 模拟排盘数据
    const paipanData = {
      宫1: { 八门: '开门', 九星: '天心星', 八神: '值符', 天盘: '甲', 地盘: '子' },
      宫2: { 八门: '休门', 九星: '天蓬星', 八神: '螣蛇', 天盘: '乙', 地盘: '丑' },
      宫3: { 八门: '生门', 九星: '天任星', 八神: '太阴', 天盘: '丙', 地盘: '寅' },
      宫4: { 八门: '伤门', 九星: '天冲星', 八神: '六合', 天盘: '丁', 地盘: '卯' },
      宫5: { 八门: '杜门', 九星: '天辅星', 八神: '白虎', 天盘: '戊', 地盘: '辰' },
      宫6: { 八门: '景门', 九星: '天英星', 八神: '玄武', 天盘: '己', 地盘: '巳' },
      宫7: { 八门: '死门', 九星: '天芮星', 八神: '九地', 天盘: '庚', 地盘: '午' },
      宫8: { 八门: '惊门', 九星: '天柱星', 八神: '九天', 天盘: '辛', 地盘: '未' },
      宫9: { 八门: '开门', 九星: '天心星', 八神: '值符', 天盘: '壬', 地盘: '申' },
      时间信息: {
        公历: new Date().toISOString(),
        年: new Date().getFullYear(),
        月: new Date().getMonth() + 1,
        日: new Date().getDate(),
        时: new Date().getHours(),
        分: new Date().getMinutes()
      }
    };
    
    res.json({
      success: true,
      question,
      user: username,
      timestamp: new Date().toISOString(),
      paipan: paipanData,
      metadata: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
      }
    });
  }

  // === AI分析相关处理器 ===

  /**
   * 深度AI分析
   */
  async aiAnalysis(req, res) {
    await this.handleAIAnalysis(req, res, AnalysisStrategy.DEEP);
  }

  /**
   * 简单AI分析
   */
  async aiAnalysisSimple(req, res) {
    await this.handleAIAnalysis(req, res, AnalysisStrategy.SIMPLE);
  }

  /**
   * 流式AI分析
   */
  async aiAnalysisStream(req, res) {
    await this.handleAIAnalysis(req, res, AnalysisStrategy.STREAM, { res, sessionId: 'session-' + Date.now() });
  }

  /**
   * 处理AI分析的通用方法
   */
  async handleAIAnalysis(req, res, strategy, options = {}) {
    try {
      const { question, paipanData } = req.body;
      
      if (!question || !paipanData) {
        return res.status(400).json({
          success: false,
          error: '参数缺失',
          message: '需要问题和排盘数据'
        });
      }

      // 检查并消费积分
      const pointsConfig = this.config.getPointsConfig();
      const analysisPointsCost = pointsConfig.analysisPointsCost;
      
      // 检查余额
      const balanceCheck = await this.pointsService.checkBalance(req.user.id, analysisPointsCost);
      if (!balanceCheck.sufficient) {
        return res.status(400).json({
          success: false,
          error: '积分不足',
          message: `AI分析需要${analysisPointsCost}积分，当前余额：${balanceCheck.currentBalance}`
        });
      }

      // 消费积分（使用事务确保原子性）
      const spendResult = await this.pointsService.spendPoints(
        req.user.id, 
        analysisPointsCost, 
        `AI奇门分析(${strategy})`
      );

      // 调用AI分析
      const analysisResult = await this.aiService.analyze(question, paipanData, strategy, options);
      
      // 如果是流式分析，不需要返回JSON响应
      if (strategy === AnalysisStrategy.STREAM) {
        return; // 响应已在流式处理中完成
      }

      console.log('AI分析完成:', req.user.username, strategy, question);
      
      res.json({
        ...analysisResult,
        user: req.user.username,
        pointsSpent: analysisPointsCost,
        remainingPoints: spendResult.newBalance,
        strategy: strategy
      });
      
    } catch (error) {
      console.error('AI分析错误:', error);
      res.status(500).json({
        success: false,
        error: 'AI分析失败',
        message: error.message || '服务器内部错误'
      });
    }
  }

  // === 辅助方法 ===

  /**
   * 获取连续签到天数
   */
  async getCheckinStreak(userId) {
    try {
      const checkinRecords = await this.prisma.pointsRecord.findMany({
        where: {
          userPoints: {
            userId: userId
          },
          type: 'earned',
          description: {
            contains: '每日签到'
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      if (checkinRecords.length === 0) {
        return 0;
      }

      let streak = 0;
      let currentDate = new Date();
      
      for (const record of checkinRecords) {
        const recordDate = new Date(record.createdAt);
        const recordDateStr = recordDate.toISOString().split('T')[0];
        const expectedDateStr = currentDate.toISOString().split('T')[0];
        
        if (recordDateStr === expectedDateStr) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('计算签到连续天数失败:', error);
      return 0;
    }
  }

  /**
   * 计算签到奖励
   */
  getCheckinBonus(streak) {
    if (streak === 1) return 10;
    if (streak <= 3) return 15;
    if (streak <= 7) return 20;
    if (streak <= 15) return 30;
    if (streak <= 30) return 50;
    return 100;
  }

  /**
   * 启动服务器
   */
  async start() {
    try {
      await this.initialize();
      
      const serverConfig = this.config.getServerConfig();
      
      this.app.listen(serverConfig.port, () => {
        console.log(`
🔮 =======================================
   鬼谷奇门遁甲 - 统一版后端服务
🔮 =======================================

✅ 服务器启动成功
🌐 服务地址: http://localhost:${serverConfig.port}
🌍 运行环境: ${serverConfig.nodeEnv}
🔒 安全认证: JWT + bcrypt
📊 数据库: Prisma ORM
🤖 AI服务: SophNet DeepSeek-R1
⚡ 性能优化: 缓存 + 事务 + 限流

🚀 核心优化:
   ✅ 统一架构设计
   ✅ 数据库事务优化
   ✅ 智能缓存系统  
   ✅ 差异化限流策略
   ✅ 多策略AI分析
   ✅ 结构化错误处理
   ✅ 配置管理优化

🔧 系统监控:
   - 缓存命中率: 实时监控
   - 数据库连接: 健康检查
   - AI服务状态: 在线监控
   - 用户请求: 实时日志

🚀 准备就绪，开始您的奇门遁甲之旅！
=======================================
        `);
      });

    } catch (error) {
      console.error('❌ 服务器启动失败:', error);
      process.exit(1);
    }
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    console.log('🔄 正在关闭服务器...');
    
    try {
      await this.prisma.$disconnect();
      console.log('✅ 数据库连接已关闭');
      
      // 清理缓存
      this.pointsService.clearAllCache();
      console.log('✅ 缓存已清理');
      
      console.log('👋 服务器已优雅关闭');
      process.exit(0);
    } catch (error) {
      console.error('❌ 关闭过程中出现错误:', error);
      process.exit(1);
    }
  }
}

// 创建并启动服务器
const server = new QimenServer();

// 处理优雅关闭
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  server.shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  server.shutdown();
});

// 启动服务器
server.start().catch(error => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});

export default server; 