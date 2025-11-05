# Project Context

## Purpose
丁未奇门遁甲 AI 分析系统 - 一个集成传统奇门遁甲排盘和现代 AI 智能解读的全栈应用。用户可以进行奇门遁甲排盘计算，并通过 AI 获得深度分析和连续对话咨询。

## Tech Stack

### 后端 (Backend)
- **框架**: Express.js (Node.js 18+)
- **数据库**: Prisma ORM + SQLite/PostgreSQL
- **认证**: JWT + bcryptjs
- **AI服务**: OpenAI API (GPT-4)
- **缓存**: 内存缓存 + 可选 Redis
- **限流**: express-rate-limit

### 前端 (Frontend)
- **主前端**: Next.js 14+ (React 18, TypeScript)
- **移动端**: Vue 3 + Capacitor (iOS/Android)
- **小程序**: Taro (React) - 支持微信/支付宝小程序
- **状态管理**: Redux Toolkit (Next.js), Pinia (Vue)
- **UI框架**: Tailwind CSS, Ant Design Mobile

### 核心库
- **奇门遁甲核心**: 自研万年历和排盘算法 (`qimendunjia/`)
- **部署**: Docker + PM2

## Project Conventions

### Code Style
- **语言**: 中文注释和变量名（业务逻辑），英文技术术语
- **命名**:
  - 文件: kebab-case (`qimen-item.tsx`)
  - 组件: PascalCase (`QimenItem`)
  - 函数/变量: camelCase (`getPaipanResult`)
  - 常量: UPPER_SNAKE_CASE (`DEFAULT_POINTS`)
- **注释**: JSDoc 风格，关键业务逻辑必须有中文说明

### Architecture Patterns
- **后端**: 三层架构
  - Controllers: 处理请求/响应
  - Services: 业务逻辑
  - Models: 数据访问（Prisma）
- **前端**: 组件化设计
  - Pages: 页面级组件
  - Components: 可复用组件
  - Hooks: 自定义钩子（API、状态）
  - Stores: 全局状态管理
- **API设计**: RESTful + 流式响应（SSE）

### Testing Strategy
- 重点测试奇门遁甲核心算法准确性
- API 端点功能测试
- 前端关键用户流程测试

### Git Workflow
- **主分支**: `main`
- **提交规范**: Conventional Commits
  - feat: 新功能
  - fix: 修复
  - refactor: 重构
  - docs: 文档

## Domain Context

### 奇门遁甲核心概念
- **排盘**: 根据时间计算天盘、地盘、八门、九星、八神的配置
- **节气**: 使用真太阳时和节气系统
- **九宫格**: 8个方位宫位 + 中宫
- **符使落宫**: 值符（九星之首）和值使（八门之首）的位置

### 业务流程
1. 用户输入时间和问题类型
2. 系统计算排盘结果（免费）
3. 用户消耗积分请求 AI 分析
4. AI 基于排盘结果提供解读
5. 支持连续对话追问（会话管理）

### 积分系统
- 注册赠送初始积分
- 每次 AI 分析消耗积分
- 支持邀请码增加积分

## Important Constraints

### 性能要求
- 排盘计算 < 100ms
- AI 分析响应首字节 < 3s
- 支持流式输出减少等待感知

### 安全要求
- 所有 AI 分析接口需要认证
- 密码使用 bcrypt 加密
- JWT token 有效期管理
- API 限流防止滥用

### 数据约束
- 用户积分不能为负数
- 时间范围: 1900-2100年（万年历支持范围）
- 排盘数据包含60+字段，需要优化传输

## External Dependencies

### 必需服务
- **OpenAI API**: GPT-4 模型用于 AI 分析
  - 需要 `OPENAI_API_KEY` 环境变量
  - 使用流式响应 (stream: true)

### 可选服务
- **Redis**: 生产环境缓存（开发环境使用内存缓存）
- **PostgreSQL**: 生产数据库（开发环境使用 SQLite）
- **短信服务**: 短信验证码登录（已集成但未启用）

### 开发工具
- Prisma Studio: 数据库管理界面
- PM2: 进程管理
- Docker: 容器化部署
