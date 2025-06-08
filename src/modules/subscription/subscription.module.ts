import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionPlansService } from './services/subscription-plans.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [PrismaModule, PointsModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionPlansService],
  exports: [SubscriptionService, SubscriptionPlansService],
})
export class SubscriptionModule {} 