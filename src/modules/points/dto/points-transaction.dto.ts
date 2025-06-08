import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum PointsTransactionType {
  EARNED = 'earned',
  SPENT = 'spent'
}

export class PointsTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(PointsTransactionType)
  type: PointsTransactionType;

  @IsOptional()
  @IsString()
  description?: string;
} 