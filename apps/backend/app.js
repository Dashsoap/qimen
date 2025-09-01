#!/usr/bin/env node

import express from 'express';
import { PrismaClient } from '@prisma/client';

// 导入配置和服务
import { createConfig } from './src/config/AppConfig.js';
import { createPointsService } from './src/services/PointsService.js';
import { createAIService } from './src/services/AIService.js';
import { createInviteCodeService } from './src/services/InviteCodeService.js';
import { configureMiddlewares } from './src/middleware/index.js';

// 导入控制器
import { createAuthController } from './src/controllers/AuthController.js';
import { createPointsController } from './src/controllers/PointsController.js';
import { createAnalysisController } from './src/controllers/AnalysisController.js';

// 导入路由配置
import { configureRoutes } from './src/routes/index.js';

// 导入数据库初始化
import { initDatabase } from './src/database/init.js';

/**
 * 丁未奇门遁甲分析系统 - 重构版
 * 模块化架构，提升可维护性和性能
 */
class QimenServer {
  constructor() {
    this.app = express();
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
      errorFormat: 'pretty'
    });
    this.services = {};
    this.controllers = {};
    this.middlewares = {};
  }

  /**
   * 初始化服务器
   */
  async initialize() {
    try {
      console.log('🚀 正在初始化丁未奇门遁甲系统（重构版）...');
      
      // 1. 加载配置
      console.log('📋 加载配置...');
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
      
      // 4. 初始化服务层
      console.log('🔧 初始化核心服务...');
      this.services = {
        pointsService: createPointsService(this.prisma),
        aiService: createAIService(),
        inviteCodeService: createInviteCodeService(this.prisma)
      };
      
      // 5. 配置中间件
      console.log('🛡️ 配置安全中间件...');
      this.middlewares = configureMiddlewares(this.app, this.prisma);
      
      // 6. 初始化控制器
      console.log('🎮 初始化控制器...');
      this.controllers = {
        authController: createAuthController(
          this.prisma, 
          this.config, 
          this.services.inviteCodeService, 
          this.services.pointsService
        ),
        pointsController: createPointsController(this.services.pointsService),
        analysisController: createAnalysisController(
          this.services.aiService,
          this.services.pointsService,
          this.config
        )
      };
      
      // 7. 配置路由
      console.log('🛣️ 配置API路由...');
      configureRoutes(this.app, this.controllers, this.middlewares);
      
      console.log('✅ 服务器初始化完成');
      
    } catch (error) {
      console.error('❌ 服务器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 启动服务器
   */
  async start() {
    try {
      await this.initialize();
      
      const serverConfig = this.config.getServerConfig();
      
      this.server = this.app.listen(serverConfig.port, () => {
        console.log(`
🔮 =======================================
   丁未奇门遁甲 - 重构版后端服务
🔮 =======================================

✅ 服务器启动成功
🌐 服务地址: http://localhost:${serverConfig.port}
🌍 运行环境: ${serverConfig.nodeEnv}
🔒 安全认证: JWT + bcrypt
📊 数据库: Prisma ORM + ${process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite'}

🚀 架构改进:
   ✅ 模块化控制器设计
   ✅ 路由分层管理
   ✅ 服务层抽象
   ✅ 中间件集中配置
   ✅ 配置统一管理
   ✅ 错误处理优化

📚 API文档:
   认证服务: /api/auth/*
   积分服务: /api/points/*
   分析服务: /api/analysis/*
   健康检查: /health

🔧 管理命令:
   查看日志: pm2 logs qimen-backend
   重启服务: pm2 restart qimen-backend
   查看状态: pm2 status

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
      // 关闭HTTP服务器
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
        console.log('✅ HTTP服务器已关闭');
      }
      
      // 断开数据库连接
      await this.prisma.$disconnect();
      console.log('✅ 数据库连接已关闭');
      
      // 清理缓存
      if (this.services.pointsService && typeof this.services.pointsService.clearAllCache === 'function') {
        this.services.pointsService.clearAllCache();
        console.log('✅ 缓存已清理');
      }
      
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
  console.error('❌ 未捕获的异常:', error);
  server.shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  server.shutdown();
});

// 启动服务器
server.start().catch(error => {
  console.error('❌ 服务器启动失败:', error);
  process.exit(1);
});

export default server;