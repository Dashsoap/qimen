import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export enum SubscriptionPlanType {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional',
}

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsEnum(SubscriptionPlanType)
  planType: SubscriptionPlanType;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean = false;
} 