import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PointsService } from '../../points/points.service';
import { SubscriptionPlansService } from './subscription-plans.service';
import { CreateSubscriptionDto, SubscriptionPlanType } from '../dto/create-subscription.dto';
import { PaymentDto, PaymentMethod, PaymentStatus } from '../dto/payment.dto';
import { PointsTransactionType } from '../../points/dto/points-transaction.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly plansService: SubscriptionPlansService,
    private readonly pointsService: PointsService,
  ) {}

  async getUserSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        paymentHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!subscription) {
      return null;
    }

    // Add plan details
    const planDetails = this.plansService.getPlan(subscription.planType as SubscriptionPlanType);
    
    return {
      ...subscription,
      planDetails,
    };
  }

  async createSubscription(userId: string, createSubscriptionDto: CreateSubscriptionDto, paymentDto: PaymentDto) {
    const { planType, autoRenew } = createSubscriptionDto;
    const { paymentMethod } = paymentDto;

    // Check if user already has an active subscription
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription && existingSubscription.status === 'active') {
      throw new ConflictException('User already has an active subscription');
    }

    // Get plan details
    const plan = this.plansService.getPlan(planType);
    
    // Process payment
    let paymentStatus = PaymentStatus.PENDING;
    let paymentRecord;

    // Handle payment with points
    if (paymentMethod === PaymentMethod.POINTS) {
      // Check if user has enough points
      try {
        await this.pointsService.addPoints(userId, {
          amount: plan.price,
          type: PointsTransactionType.SPENT,
          description: `Subscription to ${plan.name}`,
        });
        paymentStatus = PaymentStatus.SUCCESS;
      } catch (error) {
        paymentStatus = PaymentStatus.FAILED;
        throw new BadRequestException('Insufficient points for subscription');
      }
    } else {
      // For other payment methods, we would handle external payment processing here
      // For demo purposes, we'll assume it's successful
      paymentStatus = PaymentStatus.SUCCESS;
    }

    // Calculate subscription dates
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    return this.prisma.$transaction(async (tx) => {
      // Create or update subscription
      let subscription;
      
      if (existingSubscription) {
        subscription = await tx.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planType,
            startDate: now,
            endDate,
            autoRenew,
            status: 'active',
          },
        });
      } else {
        subscription = await tx.subscription.create({
          data: {
            userId,
            planType,
            startDate: now,
            endDate,
            autoRenew,
            status: 'active',
          },
        });
      }

      // Create payment record
      paymentRecord = await tx.paymentRecord.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.price,
          currency: paymentDto.currency,
          paymentMethod,
          status: paymentStatus,
          transactionId: paymentDto.transactionId,
        },
      });

      // Add included points to user account if payment was successful
      if (paymentStatus === PaymentStatus.SUCCESS && plan.pointsIncluded > 0) {
        await this.pointsService.addPoints(userId, {
          amount: plan.pointsIncluded,
          type: PointsTransactionType.EARNED,
          description: `Points from ${plan.name} subscription`,
        });
      }

      return {
        subscription: {
          ...subscription,
          planDetails: plan,
        },
        payment: paymentRecord,
      };
    });
  }

  async renewSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== 'active' && subscription.status !== 'expired') {
      throw new BadRequestException('Cannot renew subscription in current status');
    }

    const plan = this.plansService.getPlan(subscription.planType as SubscriptionPlanType);
    
    // Calculate new dates
    const now = new Date();
    const newEndDate = new Date(now);
    newEndDate.setDate(newEndDate.getDate() + plan.durationDays);

    // Update subscription
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        startDate: now,
        endDate: newEndDate,
        status: 'active',
      },
    });

    return {
      ...updatedSubscription,
      planDetails: plan,
    };
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== 'active') {
      throw new BadRequestException('Cannot cancel inactive subscription');
    }

    // Update subscription
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        autoRenew: false,
      },
    });

    const plan = this.plansService.getPlan(subscription.planType as SubscriptionPlanType);

    return {
      ...updatedSubscription,
      planDetails: plan,
    };
  }
} 