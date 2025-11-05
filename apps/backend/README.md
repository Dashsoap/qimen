# 🔮 丁未奇门遁甲 - 后端服务（重构版 v2.5）

现代化、模块化的奇门遁甲智能分析系统后端服务。采用最佳工程实践，提供高性能、易维护的API服务。

[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Modular-blue.svg)]()

## ✨ 重构亮点（v2.5）

### 🏗️ 架构升级
- **策略模式**: AI分析采用可扩展的策略模式设计
- **关注点分离**: Controller-Service-Utils三层架构
- **模块化设计**: 所有核心模块独立、可复用
- **代码精简**: 核心模块代码减少60-80%

### 📦 模块化组织
```
src/
├── services/           # 业务逻辑层
│   ├── ai/            # AI分析策略（5个独立策略类）
│   ├── AIService.js   # AI服务协调器
│   ├── AuthService.js # 认证业务逻辑
│   └── ...
├── controllers/        # HTTP请求处理层
│   ├── AuthController.js
│   ├── AnalysisController.js
│   └── ...
├── middleware/         # 中间件模块
│   ├── auth.js        # JWT认证
│   ├── rateLimit.js   # 限流策略
│   ├── security.js    # 安全配置
│   └── ...
├── validation/         # 数据验证模块
├── utils/             # 工具函数库
│   ├── responseFormatter.js
│   ├── errorHandler.js
│   ├── timeHelper.js
│   ├── paipanHelper.js
│   └── logger.js
└── prompts/           # AI提示词模块
```

## 🚀 核心功能

### 1. 用户认证系统
- JWT令牌认证，bcrypt密码加密
- 邀请码注册机制
- 积分系统（注册送1000积分）
- SMS快捷登录支持

### 2. AI智能分析
采用**策略模式**，支持多种分析方式：

| 策略 | 描述 | Token | 适用场景 |
|------|------|-------|---------|
| **Simple** | 快速分析 | 1000 | 日常咨询 |
| **Deep** | 深度解读 | 2000 | 重要决策 |
| **Stream** | 流式输出 | 2000 | 实时交互 |
| **Master** | 大师解盘 | 3000 | 专业分析 |

### 3. 数据管理
- 历史记录自动保存
- 收藏夹智能管理
- 搜索和分页查询
- 标签分类系统

### 4. 差异化限流
基于用户等级的智能限流：
- **VIP用户**: 10次/分钟
- **高级用户**: 5次/分钟  
- **普通用户**: 2次/分钟

## 📡 API文档

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "phone": "13800138000",
  "inviteCode": "INVITE123"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "testuser",
  "password": "password123"
}
```

### AI分析接口

#### 简单分析
```http
POST /api/analysis/simple
Authorization: Bearer {token}
Content-Type: application/json

{
  "question": "今天的财运如何？",
  "paipanData": {
    "排局": "阴遁二局",
    "干支": "甲子年 丙寅月 戊辰日",
    "九宫格局": { /* ... */ }
  }
}
```

#### 流式分析（Server-Sent Events）
```http
POST /api/analysis/stream
Authorization: Bearer {token}
Content-Type: application/json
Accept: text/event-stream

{
  "question": "事业发展方向如何？",
  "paipanData": { /* ... */ }
}
```

#### 大师解盘
```http
POST /api/analysis/master
Authorization: Bearer {token}
Content-Type: application/json

{
  "question": "婚姻感情运势？",
  "paipanData": { /* ... */ }
}
```

### 历史记录接口

#### 获取历史列表
```http
GET /api/qimen/history?page=1&limit=20&search=关键词
Authorization: Bearer {token}
```

#### 收藏管理
```http
# 添加收藏
POST /api/qimen/favorites
{
  "recordId": "record-uuid",
  "note": "重要的分析"
}

# 取消收藏
DELETE /api/qimen/favorites/{recordId}
```

### 积分系统
```http
# 获取积分余额
GET /api/points/balance
Authorization: Bearer {token}

# 积分历史
GET /api/points/history?page=1&limit=20
Authorization: Bearer {token}
```

## 🛠 技术栈

### 核心框架
- **Node.js 18+**: JavaScript运行时
- **Express.js**: Web框架
- **Prisma**: 现代ORM
- **SQLite**: 嵌入式数据库

### AI服务
- **Provider**: SophNet
- **Model**: DeepSeek-R1
- **Features**: 流式输出、上下文管理

### 安全与性能
- **JWT**: 令牌认证
- **bcrypt**: 密码加密（12轮）
- **Helmet**: 安全头
- **express-rate-limit**: 智能限流
- **CORS**: 跨域控制

### 工具库
- **Joi**: 数据验证
- **date-fns**: 时间处理
- **compression**: gzip压缩

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 1. 安装依赖
```bash
cd apps/backend
npm install
```

### 2. 环境配置
创建 `config.env`:
```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT配置
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# AI服务（SophNet DeepSeek-R1）
ARK_API_KEY="your-api-key"
ARK_BASE_URL="https://www.sophnet.com/api/open-apis/v1"
ARK_MODEL="DeepSeek-R1"

# 服务器
PORT=3001
NODE_ENV="development"

# 加密
BCRYPT_ROUNDS=12

# CORS（生产环境需配置白名单）
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

### 3. 数据库初始化
```bash
# 生成Prisma客户端
npx prisma generate

# 创建数据库表
npx prisma db push

# （可选）查看数据库
npx prisma studio
```

### 4. 生成邀请码
```bash
node scripts/generate-invite-codes.js
```

### 5. 启动服务
```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start

# 使用PM2（推荐生产环境）
pm2 start app.js --name qimen-backend
```

### 6. 健康检查
```bash
curl http://localhost:3001/health
```

## 📊 数据库模型

### 核心模型

#### User（用户）
```prisma
model User {
  id          String   @id @default(uuid())
  username    String   @unique
  email       String   @unique
  password    String
  phone       String?  @unique
  inviteCode  String
  
  profile     UserProfile?
  points      UserPoints?
  qimenRecords QimenRecord[]
  favorites   QimenFavorite[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### QimenRecord（历史记录）
```prisma
model QimenRecord {
  id          String   @id @default(uuid())
  userId      String
  question    String
  paipanData  String   // JSON
  analysis    String   // AI分析结果
  strategy    String   // 分析策略
  tags        String?
  
  user        User     @relation
  favorites   QimenFavorite[]
  
  createdAt   DateTime @default(now())
  
  @@index([userId, createdAt])
}
```

#### UserPoints（用户积分）
```prisma
model UserPoints {
  id          String   @id @default(uuid())
  userId      String   @unique
  balance     Int      @default(1000)
  totalEarned Int      @default(1000)
  totalSpent  Int      @default(0)
  
  user        User     @relation
  pointsRecords PointsRecord[]
}
```

完整数据库schema请查看 `prisma/schema.prisma`

## 🏗️ 架构设计

### 三层架构

```
┌─────────────────────────────────────────┐
│           HTTP Request                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Controller Layer (HTTP处理)             │
│  - 请求验证                              │
│  - 响应格式化                            │
│  - 错误处理                              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Service Layer (业务逻辑)                │
│  - AuthService                           │
│  - AIService (策略协调)                  │
│  - PointsService                         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Utils Layer (工具函数)                  │
│  - Response Formatter                    │
│  - Error Handler                         │
│  - Time Helper                           │
│  - Paipan Helper                         │
│  - Logger                                │
└───────────────────────────────────────────┘
```

### AI分析策略模式

```
QimenAIService (协调器)
    │
    ├── SimpleAnalysis   # 快速分析
    ├── DeepAnalysis     # 深度分析
    ├── StreamAnalysis   # 流式分析
    └── MasterAnalysis   # 大师解盘
         │
         └── BaseAnalysis  # 抽象基类
              - parsePaipanData()
              - cleanAiResponse()
              - validateInput()
```

## 🔒 安全特性

### 认证与授权
- ✅ JWT令牌认证
- ✅ bcrypt密码加密（12轮）
- ✅ Token过期自动处理
- ✅ 用户会话管理

### API安全
- ✅ Helmet安全头
- ✅ CORS跨域保护
- ✅ 输入数据验证（Joi schema）
- ✅ SQL注入防护（Prisma ORM）
- ✅ XSS防护

### 限流保护
- ✅ 全局限流: 100次/15分钟
- ✅ 认证限流: 5次/15分钟
- ✅ AI分析限流: 基于用户等级差异化

## 📈 性能优化

### 数据库优化
- 索引优化（userId, createdAt复合索引）
- 分页查询（高效offset-limit）
- 关联查询优化（精准include）

### 响应优化
- gzip压缩
- 响应缓存（适用场景）
- 流式响应（AI分析）

### 代码优化
- 模块按需加载
- 减少代码冗余（-60%~80%）
- 异步操作优化

## 📝 重构日志

详细的重构变更记录请查看: [REFACTORING_CHANGELOG.md](./REFACTORING_CHANGELOG.md)

**主要改进**:
- ✅ AIService: 892行 → 173行 (-81%)
- ✅ AuthController: 493行 → 162行 (-67%)
- ✅ Middleware: 439行 → 97行 (-78%)
- ✅ 新增5个AI策略类
- ✅ 新增1个AuthService业务层
- ✅ 新增7个validation模块
- ✅ 新增6个middleware模块
- ✅ 新增5个utils工具

## 🔧 开发指南

### 项目结构
```
apps/backend/
├── src/
│   ├── services/       # 业务逻辑
│   ├── controllers/    # HTTP控制器
│   ├── middleware/     # 中间件
│   ├── validation/     # 数据验证
│   ├── utils/         # 工具函数
│   ├── routes/        # 路由配置
│   ├── prompts/       # AI提示词
│   ├── config/        # 配置管理
│   └── database/      # 数据库初始化
├── prisma/            # Prisma配置
├── scripts/           # 脚本工具
├── archive/           # 归档文件
├── app.js            # 主应用入口
└── package.json
```

### 添加新功能
1. **数据模型**: 更新 `prisma/schema.prisma`
2. **Service层**: 创建业务逻辑
3. **Controller层**: 处理HTTP请求
4. **Validation**: 定义验证规则
5. **Route**: 配置路由
6. **测试**: 编写测试用例

### 代码规范
- ESLint规则遵循
- 函数命名：驼峰命名法
- 文件命名：驼峰命名法
- 注释：JSDoc格式
- 提交：Conventional Commits

## 🧪 测试

```bash
# 运行所有测试
npm test

# 测试覆盖率
npm run test:coverage

# API测试
npm run test:api
```

## 📦 部署

### Docker部署
```bash
# 构建镜像
docker build -t qimen-backend .

# 运行容器
docker run -d -p 3001:3001 \
  --env-file config.prod.env \
  qimen-backend
```

### PM2部署（推荐）
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name qimen-backend

# 查看日志
pm2 logs qimen-backend

# 监控
pm2 monit
```

## 📞 支持与贡献

### 问题反馈
- GitHub Issues: 提交bug和建议
- 邮件: dev@example.com

### 贡献指南
1. Fork本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License

---

**🔮 传统智慧与现代技术的完美融合** | v2.5 重构版 | 2025
