import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PointsTransactionDto, PointsTransactionType } from './dto/points-transaction.dto';

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPoints(userId: string) {
    const userPoints = await this.prisma.userPoints.findUnique({
      where: { userId },
      include: {
        pointsRecords: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!userPoints) {
      throw new NotFoundException('User points not found');
    }

    return userPoints;
  }

  async addPoints(userId: string, transactionDto: PointsTransactionDto) {
    const { amount, type, description } = transactionDto;

    // Validate transaction
    if (type === PointsTransactionType.SPENT && amount <= 0) {
      throw new BadRequestException('Spent amount must be positive');
    }

    if (type === PointsTransactionType.EARNED && amount <= 0) {
      throw new BadRequestException('Earned amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      // Get current user points
      const userPoints = await tx.userPoints.findUnique({
        where: { userId },
      });

      if (!userPoints) {
        throw new NotFoundException('User points not found');
      }

      // Check if user has enough points for spending
      if (type === PointsTransactionType.SPENT && userPoints.balance < amount) {
        throw new BadRequestException('Insufficient points balance');
      }

      // Calculate new balance
      const newBalance = type === PointsTransactionType.EARNED
        ? userPoints.balance + amount
        : userPoints.balance - amount;

      // Calculate total earned/spent
      const newTotalEarned = type === PointsTransactionType.EARNED
        ? userPoints.totalEarned + amount
        : userPoints.totalEarned;

      const newTotalSpent = type === PointsTransactionType.SPENT
        ? userPoints.totalSpent + amount
        : userPoints.totalSpent;

      // Create record
      const record = await tx.pointsRecord.create({
        data: {
          userPointsId: userPoints.id,
          amount,
          type,
          description,
        },
      });

      // Update user points
      const updatedUserPoints = await tx.userPoints.update({
        where: { id: userPoints.id },
        data: {
          balance: newBalance,
          totalEarned: newTotalEarned,
          totalSpent: newTotalSpent,
        },
        include: {
          pointsRecords: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      return {
        transaction: record,
        updatedPoints: updatedUserPoints,
      };
    });
  }

  async getPointsHistory(userId: string, limit = 20, offset = 0) {
    const userPoints = await this.prisma.userPoints.findUnique({
      where: { userId },
    });

    if (!userPoints) {
      throw new NotFoundException('User points not found');
    }

    const records = await this.prisma.pointsRecord.findMany({
      where: { userPointsId: userPoints.id },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const total = await this.prisma.pointsRecord.count({
      where: { userPointsId: userPoints.id },
    });

    return {
      records,
      total,
      offset,
      limit,
    };
  }
} 