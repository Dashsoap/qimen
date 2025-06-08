import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionPlansService } from './services/subscription-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PaymentDto } from './dto/payment.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly plansService: SubscriptionPlansService,
  ) {}

  @Get('plans')
  getAllPlans() {
    return this.plansService.getAllPlans();
  }

  @Get('plans/:type')
  getPlan(@Param('type') type: string) {
    return this.plansService.getPlan(type as any);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserSubscription(@Request() req) {
    return this.subscriptionService.getUserSubscription(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createSubscription(
    @Request() req,
    @Body('subscription') createSubscriptionDto: CreateSubscriptionDto,
    @Body('payment') paymentDto: PaymentDto,
  ) {
    return this.subscriptionService.createSubscription(
      req.user.id,
      createSubscriptionDto,
      paymentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('renew')
  renewSubscription(@Request() req) {
    return this.subscriptionService.renewSubscription(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  cancelSubscription(@Request() req) {
    return this.subscriptionService.cancelSubscription(req.user.id);
  }
} 