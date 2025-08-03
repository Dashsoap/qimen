import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

/**
 * 邀请码服务类 - 管理邀请码的生成、验证和使用
 */
export class InviteCodeService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * 生成邀请码
   * @param {Object} options - 生成选项
   * @returns {Promise<Object>} 生成的邀请码信息
   */
  async generateInviteCode(options = {}) {
    const {
      createdBy = null,
      maxUses = 1,
      expiresAt = null,
      description = null,
      customCode = null
    } = options;

    // 生成邀请码
    let code = customCode;
    if (!code) {
      code = this.generateRandomCode();
    }

    // 检查邀请码是否已存在
    const existingCode = await this.prisma.inviteCode.findUnique({
      where: { code }
    });

    if (existingCode) {
      if (customCode) {
        throw new Error('自定义邀请码已存在');
      }
      // 如果是随机生成的码重复了，重新生成
      return this.generateInviteCode(options);
    }

    // 创建邀请码
    const inviteCode = await this.prisma.inviteCode.create({
      data: {
        code,
        createdBy,
        maxUses,
        expiresAt,
        description
      },
      include: {
        createdByUser: {
          select: { id: true, username: true }
        }
      }
    });

    return {
      success: true,
      inviteCode,
      message: '邀请码生成成功'
    };
  }

  /**
   * 验证邀请码
   * @param {string} code - 邀请码
   * @returns {Promise<Object>} 验证结果
   */
  async validateInviteCode(code) {
    if (!code || typeof code !== 'string') {
      return {
        valid: false,
        error: '邀请码格式无效'
      };
    }

    const inviteCode = await this.prisma.inviteCode.findUnique({
      where: { code },
      include: {
        createdByUser: {
          select: { id: true, username: true }
        }
      }
    });

    if (!inviteCode) {
      return {
        valid: false,
        error: '邀请码不存在'
      };
    }

    if (!inviteCode.isActive) {
      return {
        valid: false,
        error: '邀请码已被禁用'
      };
    }

    if (inviteCode.expiresAt && new Date() > inviteCode.expiresAt) {
      return {
        valid: false,
        error: '邀请码已过期'
      };
    }

    if (inviteCode.currentUses >= inviteCode.maxUses) {
      return {
        valid: false,
        error: '邀请码使用次数已达上限'
      };
    }

    return {
      valid: true,
      inviteCode,
      message: '邀请码有效'
    };
  }

  /**
   * 使用邀请码
   * @param {string} code - 邀请码
   * @param {string} userId - 使用者用户ID
   * @returns {Promise<Object>} 使用结果
   */
  async useInviteCode(code, userId) {
    return await this.prisma.$transaction(async (tx) => {
      // 验证邀请码
      const validation = await this.validateInviteCode(code);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const inviteCode = validation.inviteCode;

      // 检查用户是否已经使用过这个邀请码
      if (inviteCode.usedBy === userId) {
        throw new Error('您已经使用过这个邀请码');
      }

      // 更新邀请码使用信息
      const updatedInviteCode = await tx.inviteCode.update({
        where: { id: inviteCode.id },
        data: {
          usedBy: userId,
          usedAt: new Date(),
          currentUses: inviteCode.currentUses + 1
        },
        include: {
          createdByUser: {
            select: { id: true, username: true }
          },
          usedByUser: {
            select: { id: true, username: true }
          }
        }
      });

      return {
        success: true,
        inviteCode: updatedInviteCode,
        message: '邀请码使用成功'
      };
    });
  }

  /**
   * 获取邀请码列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 邀请码列表
   */
  async getInviteCodes(options = {}) {
    const {
      page = 1,
      limit = 20,
      createdBy = null,
      isActive = null,
      isUsed = null
    } = options;

    const skip = (page - 1) * limit;
    const where = {};

    if (createdBy) {
      where.createdBy = createdBy;
    }

    if (isActive !== null) {
      where.isActive = isActive;
    }

    if (isUsed !== null) {
      if (isUsed) {
        where.usedBy = { not: null };
      } else {
        where.usedBy = null;
      }
    }

    const [inviteCodes, total] = await Promise.all([
      this.prisma.inviteCode.findMany({
        where,
        include: {
          createdByUser: {
            select: { id: true, username: true }
          },
          usedByUser: {
            select: { id: true, username: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.inviteCode.count({ where })
    ]);

    return {
      inviteCodes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 禁用邀请码
   * @param {string} codeId - 邀请码ID
   * @returns {Promise<Object>} 操作结果
   */
  async disableInviteCode(codeId) {
    const inviteCode = await this.prisma.inviteCode.update({
      where: { id: codeId },
      data: { isActive: false }
    });

    return {
      success: true,
      inviteCode,
      message: '邀请码已禁用'
    };
  }

  /**
   * 启用邀请码
   * @param {string} codeId - 邀请码ID
   * @returns {Promise<Object>} 操作结果
   */
  async enableInviteCode(codeId) {
    const inviteCode = await this.prisma.inviteCode.update({
      where: { id: codeId },
      data: { isActive: true }
    });

    return {
      success: true,
      inviteCode,
      message: '邀请码已启用'
    };
  }

  /**
   * 生成随机邀请码
   * @returns {string} 随机邀请码
   */
  generateRandomCode() {
    // 生成8位随机字符串，包含数字和大写字母
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 批量生成邀请码
   * @param {number} count - 生成数量
   * @param {Object} options - 生成选项
   * @returns {Promise<Array>} 生成的邀请码列表
   */
  async batchGenerateInviteCodes(count, options = {}) {
    const codes = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const result = await this.generateInviteCode({
          ...options,
          description: options.description || `批量生成 ${i + 1}/${count}`
        });
        codes.push(result.inviteCode);
      } catch (error) {
        console.error(`生成第${i + 1}个邀请码失败:`, error);
      }
    }

    return {
      success: true,
      codes,
      generated: codes.length,
      requested: count,
      message: `成功生成 ${codes.length}/${count} 个邀请码`
    };
  }

  /**
   * 获取邀请码统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getInviteCodeStats() {
    const [total, active, used, expired] = await Promise.all([
      this.prisma.inviteCode.count(),
      this.prisma.inviteCode.count({ where: { isActive: true } }),
      this.prisma.inviteCode.count({ where: { usedBy: { not: null } } }),
      this.prisma.inviteCode.count({
        where: {
          expiresAt: { lt: new Date() },
          isActive: true
        }
      })
    ]);

    return {
      total,
      active,
      used,
      expired,
      unused: active - used,
      usageRate: total > 0 ? ((used / total) * 100).toFixed(2) : 0
    };
  }
}

// 导出单例
let inviteCodeServiceInstance = null;

export function createInviteCodeService(prisma) {
  if (!inviteCodeServiceInstance) {
    inviteCodeServiceInstance = new InviteCodeService(prisma);
  }
  return inviteCodeServiceInstance;
}

export function getInviteCodeService() {
  if (!inviteCodeServiceInstance) {
    throw new Error('InviteCodeService not initialized. Call createInviteCodeService first.');
  }
  return inviteCodeServiceInstance;
}