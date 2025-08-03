#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { createInviteCodeService } from '../src/services/InviteCodeService.js';

/**
 * 邀请码生成脚本
 * 用于批量生成邀请码，方便管理员分发
 */

const prisma = new PrismaClient();
const inviteCodeService = createInviteCodeService(prisma);

async function main() {
  try {
    console.log('🎫 开始生成邀请码...\n');

    // 解析命令行参数
    const args = process.argv.slice(2);
    const count = parseInt(args[0]) || 10;
    const maxUses = parseInt(args[1]) || 1;
    const description = args[2] || '系统管理员生成';

    console.log(`📊 生成参数:`);
    console.log(`   数量: ${count}`);
    console.log(`   每码最大使用次数: ${maxUses}`);
    console.log(`   描述: ${description}\n`);

    // 批量生成邀请码
    const result = await inviteCodeService.batchGenerateInviteCodes(count, {
      maxUses,
      description,
      createdBy: null // 系统生成
    });

    console.log(`✅ 生成完成！`);
    console.log(`   成功生成: ${result.generated}/${result.requested} 个邀请码\n`);

    // 显示生成的邀请码
    console.log('🎫 生成的邀请码列表:');
    console.log('================================');
    result.codes.forEach((code, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${code.code} (最大使用${code.maxUses}次)`);
    });
    console.log('================================\n');

    // 显示统计信息
    const stats = await inviteCodeService.getInviteCodeStats();
    console.log('📈 当前邀请码统计:');
    console.log(`   总数: ${stats.total}`);
    console.log(`   激活: ${stats.active}`);
    console.log(`   已使用: ${stats.used}`);
    console.log(`   未使用: ${stats.unused}`);
    console.log(`   已过期: ${stats.expired}`);
    console.log(`   使用率: ${stats.usageRate}%\n`);

    console.log('🎉 邀请码生成完成！可以开始分发给用户了。');

  } catch (error) {
    console.error('❌ 生成邀请码失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 显示使用说明
function showUsage() {
  console.log(`
🎫 邀请码生成脚本使用说明
================================

用法: node scripts/generate-invite-codes.js [数量] [最大使用次数] [描述]

参数:
  数量           要生成的邀请码数量 (默认: 10)
  最大使用次数    每个邀请码最大使用次数 (默认: 1)
  描述           邀请码描述信息 (默认: "系统管理员生成")

示例:
  node scripts/generate-invite-codes.js                    # 生成10个单次使用的邀请码
  node scripts/generate-invite-codes.js 20                 # 生成20个单次使用的邀请码
  node scripts/generate-invite-codes.js 5 3                # 生成5个可使用3次的邀请码
  node scripts/generate-invite-codes.js 10 1 "测试用户"     # 生成10个单次使用的测试邀请码

================================
`);
}

// 检查是否需要显示帮助
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// 运行主函数
main().catch(console.error);