#!/usr/bin/env node

/**
 * 性能基准测试
 * 测试重构后核心模块的性能
 */

import { performance } from 'perf_hooks';
import { createAIService, AnalysisStrategy } from '../src/services/AIService.js';
import { parsePaipanData, getPaipanDataHash } from '../src/utils/paipanHelper.js';
import { formatTimestamp, getCurrentTimeInfo } from '../src/utils/timeHelper.js';

const mockPaipanData = {
  排局: "阴遁二局",
  干支: "甲子年 丙寅月 戊辰日",
  九宫格局: {
    "1": { 宫位: "坎一宫", 八门: "休门" },
    "2": { 宫位: "坤二宫", 八门: "死门" },
    "3": { 宫位: "震三宫", 八门: "伤门" },
    "4": { 宫位: "巽四宫", 八门: "杜门" },
    "5": { 宫位: "中五宫", 八门: "景门" },
    "6": { 宫位: "乾六宫", 八门: "开门" },
    "7": { 宫位: "兑七宫", 八门: "惊门" },
    "8": { 宫位: "艮八宫", 八门: "生门" },
    "9": { 宫位: "离九宫", 八门: "景门" }
  }
};

function benchmark(name, fn, iterations = 1000) {
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = performance.now();
  const total = end - start;
  const average = total / iterations;
  
  return {
    name,
    iterations,
    total: total.toFixed(2) + 'ms',
    average: average.toFixed(4) + 'ms',
    opsPerSec: Math.round(1000 / average)
  };
}

async function runPerformanceTests() {
  console.log('\n⚡ =======================================');
  console.log('   性能基准测试');
  console.log('⚡ =======================================\n');
  
  const results = [];
  
  // 1. 排盘数据解析性能
  console.log('1️⃣ 测试排盘数据解析性能...');
  results.push(benchmark('parsePaipanData', () => {
    parsePaipanData(mockPaipanData);
  }, 10000));
  
  // 2. 排盘数据哈希性能
  console.log('2️⃣ 测试排盘数据哈希性能...');
  results.push(benchmark('getPaipanDataHash', () => {
    getPaipanDataHash(mockPaipanData);
  }, 10000));
  
  // 3. 时间格式化性能
  console.log('3️⃣ 测试时间格式化性能...');
  const now = new Date();
  results.push(benchmark('formatTimestamp', () => {
    formatTimestamp(now, 'full');
  }, 10000));
  
  // 4. 当前时间信息获取性能
  console.log('4️⃣ 测试时间信息获取性能...');
  results.push(benchmark('getCurrentTimeInfo', () => {
    getCurrentTimeInfo();
  }, 5000));
  
  // 5. AIService策略切换性能
  console.log('5️⃣ 测试AIService策略切换性能...');
  const aiService = createAIService();
  results.push(benchmark('AIService策略访问', () => {
    aiService.strategies[AnalysisStrategy.SIMPLE];
    aiService.strategies[AnalysisStrategy.DEEP];
    aiService.strategies[AnalysisStrategy.MASTER];
  }, 10000));
  
  // 输出结果
  console.log('\n📊 =======================================');
  console.log('   性能测试结果');
  console.log('📊 =======================================\n');
  
  console.log('┌────────────────────────────┬───────────┬─────────────┬─────────────┬──────────────┐');
  console.log('│ 测试项                     │ 迭代次数  │ 总时间      │ 平均时间    │ 吞吐量/秒    │');
  console.log('├────────────────────────────┼───────────┼─────────────┼─────────────┼──────────────┤');
  
  results.forEach(result => {
    const name = result.name.padEnd(26);
    const iterations = String(result.iterations).padStart(9);
    const total = result.total.padStart(11);
    const average = result.average.padStart(11);
    const opsPerSec = String(result.opsPerSec).padStart(12);
    console.log(`│ ${name} │ ${iterations} │ ${total} │ ${average} │ ${opsPerSec} │`);
  });
  
  console.log('└────────────────────────────┴───────────┴─────────────┴─────────────┴──────────────┘\n');
  
  // 性能评估
  console.log('📈 性能评估:\n');
  
  const avgOps = results.reduce((sum, r) => sum + r.opsPerSec, 0) / results.length;
  console.log(`   平均吞吐量: ${Math.round(avgOps).toLocaleString()} ops/sec`);
  
  const slowest = results.reduce((min, r) => r.opsPerSec < min.opsPerSec ? r : min);
  const fastest = results.reduce((max, r) => r.opsPerSec > max.opsPerSec ? r : max);
  
  console.log(`   最快操作: ${fastest.name} (${fastest.opsPerSec.toLocaleString()} ops/sec)`);
  console.log(`   最慢操作: ${slowest.name} (${slowest.opsPerSec.toLocaleString()} ops/sec)`);
  
  // 性能等级评估
  console.log('\n⭐ 性能等级:');
  if (avgOps > 100000) {
    console.log('   🚀 优秀 - 性能表现卓越');
  } else if (avgOps > 50000) {
    console.log('   ✅ 良好 - 性能表现良好');
  } else if (avgOps > 10000) {
    console.log('   📊 中等 - 性能可以接受');
  } else {
    console.log('   ⚠️  需优化 - 建议进行性能优化');
  }
  
  console.log('\n✅ 性能基准测试完成！\n');
  process.exit(0);
}

runPerformanceTests().catch(error => {
  console.error('性能测试失败:', error);
  process.exit(1);
});

