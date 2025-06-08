import { Injectable } from '@nestjs/common';
import { SubscriptionPlanType } from '../dto/create-subscription.dto';

interface PlanDetails {
  name: string;
  price: number;
  durationDays: number;
  pointsIncluded: number;
  features: string[];
}

@Injectable()
export class SubscriptionPlansService {
  private readonly plans: Record<SubscriptionPlanType, PlanDetails> = {
    [SubscriptionPlanType.BASIC]: {
      name: '基础版',
      price: 49.9,
      durationDays: 30,
      pointsIncluded: 500,
      features: [
        '基础奇门预测',
        '每日运势',
        '500积分'
      ],
    },
    [SubscriptionPlanType.ADVANCED]: {
      name: '高级版',
      price: 99.9,
      durationDays: 30,
      pointsIncluded: 1200,
      features: [
        '高级奇门预测',
        '每日运势',
        '事业财运分析',
        '1200积分'
      ],
    },
    [SubscriptionPlanType.PROFESSIONAL]: {
      name: '专业版',
      price: 199.9,
      durationDays: 30,
      pointsIncluded: 3000,
      features: [
        '专业奇门预测',
        '每日运势',
        '事业财运分析',
        '人际关系分析',
        '健康指导',
        '3000积分'
      ],
    },
  };

  getAllPlans() {
    return Object.entries(this.plans).map(([key, details]) => ({
      type: key,
      ...details,
    }));
  }

  getPlan(planType: SubscriptionPlanType) {
    return {
      type: planType,
      ...this.plans[planType],
    };
  }
} 