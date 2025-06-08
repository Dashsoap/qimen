# 云雀奇门遁甲 - 技术文档

## 一、技术栈概述

### 1. 后端技术栈
```
- 主框架：NestJS 10.x
- 数据库：PostgreSQL 15.x
- 缓存：Redis 7.x
- ORM：Prisma 5.x
- AI集成：LangChain.js + OpenAI API
- 消息队列：Bull
- 认证：JWT + Redis
- 支付：微信支付/支付宝
- 部署：Docker + Docker Compose
```

### 2. 开发工具链
```
- 包管理：pnpm
- 代码规范：ESLint + Prettier
- 提交规范：Husky + Commitlint
- 测试：Jest + Supertest
- API文档：Swagger/OpenAPI
- 监控：Prometheus + Grafana
- 日志：ELK Stack
```

## 二、系统架构

### 1. 整体架构
```
[客户端层]
Vue3前端应用
  ↓
[API网关层]
Nginx负载均衡
  ↓
[应用服务层]
NestJS微服务
  ↓
[数据服务层]
PostgreSQL + Redis
  ↓
[AI服务层]
OpenAI API + LangChain
```

### 2. 服务模块划分
```
- 用户服务 (UserService)
- 认证服务 (AuthService)
- 积分服务 (PointsService)
- 预测服务 (PredictionService)
- 订阅服务 (SubscriptionService)
- AI服务 (AIService)
- 支付服务 (PaymentService)
```

## 三、数据模型设计

### 1. 奇门盘面数据接收模型
```typescript
// 奇门盘面接收模型
interface QimenChartReceive {
  id: string;
  // 时间信息
  solarDate: string;      // 公历日期字符串
  lunarDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
  };                      // 农历日期信息
  hour: number;           // 时辰(0-11)
  
  // 盘面信息（由前端计算后传入）
  yearPillar: {
    heavenlyStem: string; // 天干
    earthlyBranch: string; // 地支
  };
  monthPillar: {
    heavenlyStem: string;
    earthlyBranch: string;
  };
  dayPillar: {
    heavenlyStem: string;
    earthlyBranch: string;
  };
  hourPillar: {
    heavenlyStem: string;
    earthlyBranch: string;
  };
  
  // 奇门信息（由前端计算后传入）
  door: string;           // 门
  star: string;           // 星
  god: string;            // 神
  palace: string;         // 宫
  
  // 其他信息
  method: string;         // 排盘方法(飞盘/转盘)
  version: string;        // 版本信息
}

// 奇门盘面存储模型
interface QimenChart {
  id: string;
  userId: string;         // 关联用户
  solarDate: Date;        // 转换为Date类型存储
  lunarDate: LunarDate;   // 农历日期
  hour: number;           // 时辰
  
  // 盘面信息
  yearPillar: Pillar;     // 年柱
  monthPillar: Pillar;    // 月柱
  dayPillar: Pillar;      // 日柱
  hourPillar: Pillar;     // 时柱
  
  // 奇门信息
  door: Door;             // 门
  star: Star;             // 星
  god: God;               // 神
  palace: Palace;         // 宫
  
  // 其他信息
  method: string;         // 排盘方法
  version: string;        // 版本信息
  createdAt: Date;
  updatedAt: Date;
}

// 奇门盘面服务
@Injectable()
export class QimenChartService {
  constructor(
    @InjectRepository(QimenChart)
    private qimenChartRepository: Repository<QimenChart>,
    private readonly logger: Logger,
  ) {}

  // 接收并存储盘面数据
  async receiveChart(userId: string, chartData: QimenChartReceive): Promise<QimenChart> {
    try {
      // 1. 数据验证
      this.validateChartData(chartData);

      // 2. 数据转换
      const chart = this.convertToChartModel(userId, chartData);

      // 3. 存储数据
      return await this.qimenChartRepository.save(chart);
    } catch (error) {
      this.logger.error(`Failed to receive chart: ${error.message}`, error.stack);
      throw new BadRequestException('Invalid chart data');
    }
  }

  // 数据验证
  private validateChartData(data: QimenChartReceive): void {
    // 验证必要字段
    if (!data.solarDate || !data.lunarDate || !data.hour) {
      throw new BadRequestException('Missing required fields');
    }

    // 验证时辰范围
    if (data.hour < 0 || data.hour > 11) {
      throw new BadRequestException('Invalid hour value');
    }

    // 验证排盘方法
    if (!['飞盘', '转盘'].includes(data.method)) {
      throw new BadRequestException('Invalid method');
    }
  }

  // 数据转换
  private convertToChartModel(userId: string, data: QimenChartReceive): QimenChart {
    return {
      id: data.id,
      userId,
      solarDate: new Date(data.solarDate),
      lunarDate: data.lunarDate,
      hour: data.hour,
      yearPillar: data.yearPillar,
      monthPillar: data.monthPillar,
      dayPillar: data.dayPillar,
      hourPillar: data.hourPillar,
      door: data.door as Door,
      star: data.star as Star,
      god: data.god as God,
      palace: data.palace as Palace,
      method: data.method,
      version: data.version,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
```

### 2. 奇门盘面API
```typescript
// 奇门盘面控制器
@Controller('qimen')
export class QimenController {
  constructor(private readonly qimenChartService: QimenChartService) {}

  @Post('chart')
  @UseGuards(AuthGuard)
  async receiveChart(
    @User() user: User,
    @Body() chartData: QimenChartReceive
  ) {
    return this.qimenChartService.receiveChart(user.id, chartData);
  }

  @Get('chart/:id')
  @UseGuards(AuthGuard)
  async getChart(@Param('id') id: string) {
    return this.qimenChartService.getChart(id);
  }

  @Get('charts')
  @UseGuards(AuthGuard)
  async getUserCharts(
    @User() user: User,
    @Query() query: GetChartsQueryDto
  ) {
    return this.qimenChartService.getUserCharts(user.id, query);
  }
}

// DTO定义
class GetChartsQueryDto {
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
```

### 2. 预测数据模型
```typescript
// 预测模型
interface Prediction {
  id: string;
  userId: string;
  chartId: string;      // 关联的奇门盘
  type: PredictionType; // 预测类型
  content: {
    text: string;       // 预测文本
    data: any;          // 预测数据
    charts: any[];      // 预测图表
  };
  accuracy: number;     // 预测准确度
  feedback: {
    rating: number;     // 用户评分
    comment: string;    // 用户反馈
  };
  createdAt: Date;
  validUntil: Date;
}

enum PredictionType {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
  Event = 'event',
  Timing = 'timing'
}
```

### 3. 用户数据模型
```typescript
// 用户模型
interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  profile: {
    name: string;
    gender: string;
    birthDate: Date;
    birthTime: string;
    birthPlace: string;
  };
  subscription: Subscription;
  points: UserPoints;
  createdAt: Date;
  updatedAt: Date;
}

// 订阅模型
interface Subscription {
  id: string;
  userId: string;
  planType: 'basic' | 'advanced' | 'professional';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'cancelled';
  paymentHistory: PaymentRecord[];
}

// 积分模型
interface UserPoints {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  dailyRecord: {
    date: Date;
    earned: number;
    spent: number;
  }[];
}
```

## 四、API设计

### 1. 奇门盘API
```typescript
// 奇门盘控制器
@Controller('qimen')
export class QimenController {
  @Post('chart')
  @UseGuards(AuthGuard)
  async createChart(@Body() data: CreateChartDto) {
    return this.qimenService.createChart(data);
  }

  @Get('chart/:id')
  @UseGuards(AuthGuard)
  async getChart(@Param('id') id: string) {
    return this.qimenService.getChart(id);
  }

  @Get('charts')
  @UseGuards(AuthGuard)
  async getUserCharts(@Query() query: GetChartsQueryDto) {
    return this.qimenService.getUserCharts(query);
  }
}

// DTO定义
class CreateChartDto {
  @IsDate()
  solarDate: Date;

  @IsNumber()
  hour: number;

  @IsString()
  method: string;
}
```

### 2. 预测API
```typescript
// 预测控制器
@Controller('predictions')
export class PredictionController {
  @Post()
  @UseGuards(AuthGuard, SubscriptionGuard)
  async createPrediction(@Body() data: CreatePredictionDto) {
    return this.predictionService.create(data);
  }

  @Get('daily')
  @UseGuards(AuthGuard, SubscriptionGuard)
  async getDailyPrediction(@User() user: User) {
    return this.predictionService.getDaily(user.id);
  }

  @Post(':id/feedback')
  @UseGuards(AuthGuard)
  async submitFeedback(
    @Param('id') id: string,
    @Body() data: FeedbackDto
  ) {
    return this.predictionService.submitFeedback(id, data);
  }
}
```

## 五、AI服务集成

### 1. AI服务架构
```typescript
// AI服务
@Injectable()
export class AIService {
  constructor(
    private readonly langchain: LangChain,
    private readonly openai: OpenAI,
  ) {}

  // 生成预测
  async generatePrediction(params: GeneratePredictionParams) {
    // 1. 构建提示词
    const prompt = this.buildPrompt(params);
    
    // 2. 调用AI模型
    const response = await this.openai.createCompletion({
      model: "gpt-4",
      prompt,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    // 3. 处理响应
    return this.processResponse(response);
  }

  // 构建提示词
  private buildPrompt(params: GeneratePredictionParams) {
    return `
      基于以下奇门盘面信息生成预测：
      时间：${params.date}
      盘面：${JSON.stringify(params.chart)}
      预测类型：${params.type}
      用户信息：${JSON.stringify(params.userProfile)}
    `;
  }
}
```

### 2. 预测生成流程
```
1. 接收预测请求
2. 验证用户订阅状态
3. 获取用户命盘数据
4. 构建AI提示词
5. 调用AI服务生成预测
6. 处理AI响应
7. 存储预测结果
8. 返回预测内容
```

## 六、部署架构

### 1. 容器化配置
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/qimen
      - REDIS_URL=redis://redis:6379

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=qimen
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 2. 环境配置
```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },
});
```

## 七、安全设计

### 1. 认证与授权
```typescript
// 认证守卫
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const isBlacklisted = await this.redisService.isBlacklisted(token);
      
      if (isBlacklisted) {
        throw new UnauthorizedException();
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
```

### 2. 数据加密
```typescript
// 加密服务
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, encrypted, authTagHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 八、监控与日志

### 1. 监控配置
```typescript
// 监控服务
@Injectable()
export class MonitoringService {
  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly logger: Logger,
  ) {}

  // 记录API调用
  recordApiCall(endpoint: string, duration: number, status: number) {
    this.prometheusService.recordApiCall(endpoint, duration, status);
    this.logger.log(`API Call: ${endpoint} - ${duration}ms - ${status}`);
  }

  // 记录预测生成
  recordPredictionGeneration(type: string, duration: number) {
    this.prometheusService.recordPredictionGeneration(type, duration);
    this.logger.log(`Prediction: ${type} - ${duration}ms`);
  }
}
```

### 2. 日志配置
```typescript
// 日志服务
@Injectable()
export class LoggingService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async log(level: string, message: string, metadata: any) {
    await this.elasticsearchService.index({
      index: 'qimen-logs',
      body: {
        timestamp: new Date(),
        level,
        message,
        ...metadata,
      },
    });
  }
}
``` 