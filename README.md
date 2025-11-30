# 丁未奇门遁甲 AI 分析系统

基于古代奇门遁甲术数与现代AI技术结合的智能分析系统。支持Web、微信小程序、支付宝小程序等多平台。

## 系统架构

### 技术栈

#### 前端 (多技术栈)

##### 1. Taro 多端统一 (生产环境使用)
- **框架**: Taro 4.1.5 + React 18 + Redux Toolkit 2.8.2
- **支持平台**: H5 Web, 微信小程序, 支付宝小程序, 百度小程序
- **UI组件**: Taro UI + 自定义组件
- **开发语言**: TypeScript
- **状态**: ✅ 生产就绪

##### 2. Next.js Web应用 (迁移中 60%)
- **框架**: Next.js 15.1.4 + React 19 + Redux Toolkit
- **特性**: SSR/SSG, App Router, 中间件认证
- **UI框架**: TailwindCSS + HeadlessUI
- **开发语言**: TypeScript
- **状态**: 🚧 迁移进行中

#### 后端 (Node.js)
- **框架**: Express.js 4.21.2
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma 6.14.0
- **认证**: JWT
- **AI服务**: Doubao AI (火山引擎) - DeepSeek-R1 模型

### 目录结构

```
yunque-qimen/
├── qimen-taro/              # Taro 多端前端 (生产环境)
│   ├── src/                # 源代码
│   ├── config/             # 配置文件
│   └── dist/               # 构建输出
│
├── apps/
│   ├── backend/            # Node.js 后端
│   │   ├── src/            # 源代码 (模块化)
│   │   ├── prisma/         # 数据库模型
│   │   └── logs/           # 日志文件
│   │
│   └── frontend-nextjs/    # Next.js 前端 (迁移中)
│       ├── src/
│       │   ├── app/        # App Router
│       │   ├── components/ # 组件库
│       │   └── lib/        # 核心库
│       └── public/         # 静态资源
│
├── docs/                   # 项目文档
└── .env                   # 环境变量
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- SQLite 或 PostgreSQL

### 安装依赖

```bash
# 后端依赖
cd apps/backend
npm install

# Taro前端依赖
cd qimen-taro
npm install

# Next.js前端依赖 (如需开发)
cd apps/frontend-nextjs
npm install
```

### 配置环境变量

在 `apps/backend/` 目录创建 `config.env` 文件：

```env
# 服务器配置
NODE_ENV=development
PORT=3001

# 数据库
DATABASE_URL="file:./dev.db"

# JWT (最少32个字符)
JWT_SECRET="your-secret-key-at-least-32-characters"

# AI服务 (必需)
ARK_API_KEY="your-doubao-api-key"
ARK_BASE_URL="https://www.sophnet.com/api/open-apis/v1"
ARK_MODEL="DeepSeek-R1"

# 积分配置
ANALYSIS_POINTS_COST=100
REGISTER_BONUS_POINTS=1000

# CORS配置
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3001"
```

### 初始化数据库

```bash
cd apps/backend
npx prisma generate
npx prisma db push
```

### 启动开发服务器

```bash
# 启动后端 (端口 3001)
cd apps/backend
npm run dev

# 启动Taro前端 (H5开发)
cd qimen-taro
npm run dev:h5        # 访问 http://localhost:5173

# 或启动小程序开发
npm run dev:weapp     # 微信小程序
npm run dev:alipay    # 支付宝小程序

# 启动Next.js前端 (可选)
cd apps/frontend-nextjs
npm run dev           # 访问 http://localhost:3000
```

## 核心功能

### 用户系统
- 用户注册/登录（邮箱、手机号）
- JWT 认证
- 积分系统
- 签到奖励
- 邀请码系统

### 奇门分析
- 实时排盘计算
- AI 智能解读（4种分析模式）
  - SIMPLE: 快速分析
  - DEEP: 深度分析
  - STREAM: 流式分析
  - MASTER: 大师级分析
- 多轮对话支持
- 历史记录保存

### 积分系统
- 注册赠送 1000 积分
- 每次分析消耗 100 积分
- 签到获取积分
- 积分交易记录

### 未币系统（开发中）
- 虚拟货币钱包
- 挖矿机制
- 质押收益
- 交易市场

## API 接口

### 认证接口
```
POST /api/auth/register     # 用户注册
POST /api/auth/login        # 用户登录
GET  /api/auth/verify       # 验证 Token
GET  /api/auth/profile      # 用户信息
```

### 分析接口
```
POST /api/analysis/paipan   # 生成排盘
POST /api/analysis/simple   # 简单分析
POST /api/analysis/deep     # 深度分析
POST /api/analysis/stream   # 流式分析
POST /api/analysis/master   # 大师分析
```

### 积分接口
```
GET  /api/points/balance    # 积分余额
GET  /api/points/history    # 积分历史
POST /api/points/checkIn    # 每日签到
```

### 聊天接口
```
POST /api/chat/session      # 创建会话
POST /api/chat/message      # 发送消息
GET  /api/chat/messages/:id # 获取消息历史
```

## 数据库设计

### 核心表结构

#### 用户相关
- `User` - 用户基本信息
- `Profile` - 用户详细资料
- `UserPoints` - 用户积分账户
- `PointsRecord` - 积分交易记录

#### 分析相关
- `ChatSession` - 聊天会话
- `ChatMessage` - 聊天消息
- `AnalysisHistory` - 分析历史

#### 未币系统
- `UserWeiCoins` - 未币钱包
- `WeiCoinRecord` - 未币交易
- `MiningRecord` - 挖矿记录
- `StakingRecord` - 质押记录

## 构建部署

### 构建前端

```bash
# Taro多端构建
cd qimen-taro
npm run build:h5      # H5 Web
npm run build:weapp   # 微信小程序
npm run build:alipay  # 支付宝小程序

# Next.js构建
cd apps/frontend-nextjs
npm run build         # 生产构建
npm start            # 启动生产服务器
```

### 生产部署

```bash
# 后端部署
cd apps/backend
NODE_ENV=production npm start

# 使用 PM2
pm2 start app.js --name qimen-backend

# 使用 Docker
docker-compose up -d
```

### 服务器配置

生产服务器：`101.201.148.8:3001`

Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name api.qimen.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 前端项目对比

| 特性 | Taro | Next.js |
|------|------|---------|
| **用途** | 多端小程序 + H5 | 纯Web应用 |
| **状态** | ✅ 生产使用 | 🚧 迁移中(60%) |
| **优势** | 一次开发多端运行 | SEO友好, SSR性能好 |
| **技术栈** | Taro + React + Redux | Next.js + React + Redux |
| **路由** | Taro Router | App Router |
| **样式** | CSS Modules | TailwindCSS |
| **构建** | Webpack | Turbopack |
| **部署** | 静态文件/小程序平台 | Node.js服务器 |

### Next.js项目迁移进度

- [x] 项目初始化和基础配置
- [x] Redux状态管理 (SSR兼容)
- [x] 路由中间件和认证守卫
- [x] API代理配置
- [x] 基础页面结构 (home, qimen)
- [ ] 认证组件完整迁移 (30%)
- [ ] 奇门排盘核心功能 (40%)
- [ ] 历史记录和收藏功能
- [ ] 样式和主题系统
- [ ] 移动端适配优化

## 开发规范

### 代码结构

#### 后端模块化架构
```
src/
├── controllers/   # 请求处理器
├── services/     # 业务逻辑
├── routes/       # API路由
├── middleware/   # 中间件
├── agents/       # AI代理
├── config/       # 配置管理
└── validation/   # 数据验证
```

#### 前端组件结构
```
src/
├── pages/        # 页面组件
├── components/   # 通用组件
├── store/        # Redux状态
├── utils/        # 工具函数
└── services/     # API服务
```

### Git 提交规范

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式
refactor: 重构代码
test: 测试相关
chore: 构建或辅助工具变动
```

## 性能优化

### 后端优化
- 内存缓存（5分钟TTL）
- 数据库索引优化
- API 限流（100请求/分钟）
- Gzip 压缩

### 前端优化
- 代码分割
- 懒加载路由
- 图片懒加载
- 虚拟滚动列表

## 安全措施

- JWT 认证（7天有效期）
- bcrypt 密码加密（12轮）
- 输入验证（Joi）
- SQL注入防护（Prisma ORM）
- XSS 防护
- CORS 配置
- 限流保护

## 监控与日志

### 健康检查
```bash
curl http://localhost:3001/health
```

### 日志查看
```bash
# 应用日志
tail -f apps/backend/logs/app.log

# PM2 日志
pm2 logs qimen-backend
```

## 常见问题

### 1. JWT_SECRET 配置错误
确保 JWT_SECRET 至少32个字符。

### 2. 数据库连接失败
```bash
cd apps/backend
npx prisma generate
npx prisma db push
```

### 3. AI服务不可用
检查 ARK_API_KEY 是否配置正确。

### 4. 跨域问题
在 config.env 中添加前端地址到 ALLOWED_ORIGINS。

## 技术支持

- 项目维护：[GitHub Issues](https://github.com/yourusername/yunque-qimen/issues)
- 技术文档：查看 `/docs` 目录
- API文档：`/apps/backend/docs/`

## 许可证

私有项目，版权所有。

---

*版本: 3.1.0 | 最后更新: 2025年11月*