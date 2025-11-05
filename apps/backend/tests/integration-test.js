#!/usr/bin/env node

/**
 * 重构后端完整集成测试
 * 测试所有核心模块的功能
 */

import { PrismaClient } from '@prisma/client';
import { createConfig } from '../src/config/AppConfig.js';
import { createInviteCodeService } from '../src/services/InviteCodeService.js';
import { createAuthService } from '../src/services/AuthService.js';
import { createAIService, AnalysisStrategy } from '../src/services/AIService.js';
import { createPointsService } from '../src/services/PointsService.js';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse 
} from '../src/utils/responseFormatter.js';
import { 
  getCurrentTimeInfo, 
  formatTimestamp, 
  getTimeDifference 
} from '../src/utils/timeHelper.js';
import { 
  parsePaipanData, 
  validatePaipanData, 
  getPaipanDataHash 
} from '../src/utils/paipanHelper.js';
import { 
  Logger, 
  createLogger 
} from '../src/utils/logger.js';

const prisma = new PrismaClient();
const config = createConfig();

// 测试数据
const mockPaipanData = {
  排局: "阴遁二局",
  干支: "甲子年 丙寅月 戊辰日 丙辰时",
  值符值使: {
    值符: "天心",
    值使: "开门"
  },
  九宫格局: {
    "1": { 宫位: "坎一宫", 八门: "休门", 九星: "天蓬" },
    "2": { 宫位: "坤二宫", 八门: "死门", 九星: "天芮" },
    "3": { 宫位: "震三宫", 八门: "伤门", 九星: "天冲" },
    "4": { 宫位: "巽四宫", 八门: "杜门", 九星: "天辅" },
    "5": { 宫位: "中五宫", 八门: "景门", 九星: "天禽" },
    "6": { 宫位: "乾六宫", 八门: "开门", 九星: "天心" },
    "7": { 宫位: "兑七宫", 八门: "惊门", 九星: "天柱" },
    "8": { 宫位: "艮八宫", 八门: "生门", 九星: "天任" },
    "9": { 宫位: "离九宫", 八门: "景门", 九星: "天英" }
  },
  时间信息: {
    公历: "2025-10-29",
    农历: "二零二五年九月初七",
    时辰: "辰时"
  }
};

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function test(name, fn) {
  testResults.total++;
  try {
    fn();
    testResults.passed++;
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ test: name, error: error.message });
    console.error(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 =======================================');
  console.log('   后端重构完整集成测试');
  console.log('🧪 =======================================\n');
  
  // ========== 工具模块测试 ==========
  console.log('📦 测试工具模块...\n');
  
  // 1. Response Formatter测试
  console.log('1️⃣ Response Formatter');
  test('successResponse应该返回成功格式', () => {
    const response = successResponse({ user: 'test' }, 'Success');
    if (!response.success || !response.data || !response.timestamp) {
      throw new Error('Response格式不正确');
    }
  });
  
  test('errorResponse应该返回错误格式', () => {
    const response = errorResponse('Error occurred', 'Details');
    if (response.success !== false || !response.message) {
      throw new Error('Error response格式不正确');
    }
  });
  
  test('paginatedResponse应该返回分页格式', () => {
    const response = paginatedResponse([1, 2, 3], 100, 1, 20);
    if (!response.data.items || !response.data.pagination) {
      throw new Error('Paginated response格式不正确');
    }
  });
  
  // 2. Time Helper测试
  console.log('\n2️⃣ Time Helper');
  test('getCurrentTimeInfo应该返回时间信息', () => {
    const timeInfo = getCurrentTimeInfo();
    if (!timeInfo.公历 || !timeInfo.时辰 || !timeInfo.星期) {
      throw new Error('时间信息不完整');
    }
  });
  
  test('formatTimestamp应该格式化时间', () => {
    const formatted = formatTimestamp(new Date(), 'full');
    if (!/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(formatted)) {
      throw new Error('时间格式化失败');
    }
  });
  
  test('getTimeDifference应该计算时间差', () => {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const diff = getTimeDifference(oneHourAgo);
    if (!diff.includes('小时')) {
      throw new Error('时间差计算错误');
    }
  });
  
  // 3. Paipan Helper测试
  console.log('\n3️⃣ Paipan Helper');
  test('parsePaipanData应该解析排盘数据', () => {
    const parsed = parsePaipanData(mockPaipanData);
    if (!parsed.排局 || !parsed.干支 || !parsed.统计) {
      throw new Error('排盘数据解析失败');
    }
  });
  
  test('validatePaipanData应该验证数据', () => {
    const validation = validatePaipanData(mockPaipanData);
    if (!validation.isValid) {
      throw new Error('排盘数据验证失败');
    }
  });
  
  test('getPaipanDataHash应该生成哈希', () => {
    const hash = getPaipanDataHash(mockPaipanData);
    if (!hash || typeof hash !== 'string') {
      throw new Error('哈希生成失败');
    }
  });
  
  // 4. Logger测试
  console.log('\n4️⃣ Logger');
  test('createLogger应该创建logger实例', () => {
    const logger = createLogger('test');
    if (!logger || typeof logger.info !== 'function') {
      throw new Error('Logger创建失败');
    }
  });
  
  test('Logger应该支持不同级别', () => {
    const logger = new Logger('test');
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    // 如果没有抛出错误，测试通过
  });
  
  // ========== 服务模块测试 ==========
  console.log('\n\n📦 测试服务模块...\n');
  
  // 5. AuthService测试
  console.log('5️⃣ AuthService');
  const inviteCodeService = createInviteCodeService(prisma);
  const authService = createAuthService(prisma, config, inviteCodeService);
  
  test('AuthService实例应该创建成功', () => {
    if (!authService) {
      throw new Error('AuthService创建失败');
    }
  });
  
  test('hashPassword应该加密密码', async () => {
    const hashed = await authService.hashPassword('testpassword');
    if (!hashed || hashed.length < 50) {
      throw new Error('密码加密失败');
    }
  });
  
  test('generateToken应该生成JWT', () => {
    const token = authService.generateToken({ id: 1, username: 'test' });
    if (!token || token.split('.').length !== 3) {
      throw new Error('Token生成失败');
    }
  });
  
  test('verifyToken应该验证JWT', () => {
    const token = authService.generateToken({ id: 1, username: 'test' });
    const decoded = authService.verifyToken(token);
    if (!decoded || decoded.userId !== 1) {
      throw new Error('Token验证失败');
    }
  });
  
  // 6. AIService测试
  console.log('\n6️⃣ AIService');
  const aiService = createAIService();
  
  test('AIService实例应该创建成功', () => {
    if (!aiService || !aiService.strategies) {
      throw new Error('AIService创建失败');
    }
  });
  
  test('AIService应该包含所有策略', () => {
    const strategies = Object.keys(aiService.strategies);
    const expected = ['simple', 'deep', 'stream', 'master'];
    if (!expected.every(s => strategies.includes(s))) {
      throw new Error('策略不完整');
    }
  });
  
  test('SimpleAnalysis策略应该存在', () => {
    const strategy = aiService.strategies[AnalysisStrategy.SIMPLE];
    if (!strategy || typeof strategy.analyze !== 'function') {
      throw new Error('SimpleAnalysis策略不存在');
    }
  });
  
  test('DeepAnalysis策略应该存在', () => {
    const strategy = aiService.strategies[AnalysisStrategy.DEEP];
    if (!strategy || typeof strategy.analyze !== 'function') {
      throw new Error('DeepAnalysis策略不存在');
    }
  });
  
  test('MasterAnalysis策略应该存在', () => {
    const strategy = aiService.strategies[AnalysisStrategy.MASTER];
    if (!strategy || typeof strategy.analyze !== 'function') {
      throw new Error('MasterAnalysis策略不存在');
    }
  });
  
  // ========== 架构验证 ==========
  console.log('\n\n📦 测试架构设计...\n');
  
  console.log('7️⃣ 架构模式');
  test('策略模式实现正确', () => {
    // 验证策略模式：每个策略都有analyze方法
    for (const [name, strategy] of Object.entries(aiService.strategies)) {
      if (typeof strategy.analyze !== 'function') {
        throw new Error(`策略${name}缺少analyze方法`);
      }
    }
  });
  
  test('模块导出正确', () => {
    // 验证各模块是否正确导出
    if (!AnalysisStrategy || !successResponse || !getCurrentTimeInfo) {
      throw new Error('模块导出不完整');
    }
  });
  
  // ========== 输出测试结果 ==========
  console.log('\n\n🎯 =======================================');
  console.log('   测试结果汇总');
  console.log('🎯 =======================================\n');
  
  console.log(`总测试数: ${testResults.total}`);
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%\n`);
  
  if (testResults.failed > 0) {
    console.log('❌ 失败的测试:\n');
    testResults.errors.forEach(({ test, error }) => {
      console.log(`   - ${test}`);
      console.log(`     错误: ${error}\n`);
    });
  }
  
  // 生成测试报告
  const report = {
    timestamp: new Date().toISOString(),
    total: testResults.total,
    passed: testResults.passed,
    failed: testResults.failed,
    passRate: ((testResults.passed / testResults.total) * 100).toFixed(1) + '%',
    errors: testResults.errors
  };
  
  console.log('\n📊 详细报告:\n');
  console.log(JSON.stringify(report, null, 2));
  
  // 断开数据库连接
  await prisma.$disconnect();
  
  // 根据测试结果退出
  if (testResults.failed === 0) {
    console.log('\n🎉 所有测试通过！重构验证完成！\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分测试失败，请检查错误信息。\n');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});

