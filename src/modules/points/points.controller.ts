import { Controller, Get, Post, Body, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { PointsService } from './points.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PointsTransactionDto } from './dto/points-transaction.dto';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserPoints(@Request() req) {
    return this.pointsService.getUserPoints(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transaction')
  addPointsTransaction(
    @Request() req,
    @Body() transactionDto: PointsTransactionDto,
  ) {
    return this.pointsService.addPoints(req.user.id, transactionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getPointsHistory(
    @Request() req,
    @Query('limit', ParseIntPipe) limit = 20,
    @Query('offset', ParseIntPipe) offset = 0,
  ) {
    return this.pointsService.getPointsHistory(req.user.id, limit, offset);
  }
} 