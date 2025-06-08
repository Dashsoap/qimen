import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '云雀奇门遁甲 API 服务已启动';
  }
} 