# 项目技术现状总览

*最后更新: 2025年11月*

## 项目整体概况

丁未奇门遁甲是一个集成AI技术的奇门遁甲分析系统，采用前后端分离架构，支持多端部署。

## 技术栈现状

### 🎯 生产环境使用

#### 后端 (稳定运行)
- **技术**: Express.js v4.21.2 + Prisma ORM
- **版本**: v3.1.0
- **部署**: 101.201.148.8:3001
- **数据库**: SQLite (开发) / PostgreSQL-ready (生产)
- **AI服务**: Doubao AI (火山引擎) DeepSeek-R1模型

#### 前端 (生产使用)
- **主要**: Taro 4.1.5 (qimen-taro/)
- **平台**: H5 Web + 微信小程序 + 支付宝小程序
- **框架**: React 18 + Redux Toolkit

### 🚧 开发进行中

#### Next.js前端 (迁移60%)
- **位置**: apps/frontend-nextjs/
- **版本**: Next.js 15.1.4 + React 19
- **特性**: SSR/SSG, App Router, 中间件认证
- **进度**: 基础框架完成，业务功能迁移中

### 📦 遗留代码 (仅参考)

- `apps/frontend-vue/` - Vue 3前端 (不再维护)
- `apps/frontend-react/` - React前端 (不存在，仅文档提及)
- `react-frontend/` - 空目录

## 目录结构清单

```
yunque-qimen/
│
├── 【生产代码】
│   ├── qimen-taro/              # ✅ Taro多端前端 (生产使用)
│   └── apps/backend/            # ✅ Express后端 (生产使用)
│
├── 【开发中】
│   └── apps/frontend-nextjs/    # 🚧 Next.js前端 (迁移60%)
│
├── 【遗留代码】
│   ├── apps/frontend-vue/       # ❌ Vue前端 (仅参考)
│   └── react-frontend/          # ❌ 空目录
│
└── 【配置文档】
    ├── docs/                    # 项目文档
    ├── .env                     # 环境变量
    └── README.md               # 主文档 (已更新)
```

## 核心功能清单

### ✅ 已实现功能

1. **用户系统**
   - 注册/登录 (邮箱、手机号)
   - JWT认证
   - 个人资料管理

2. **奇门分析**
   - 实时排盘计算
   - 4种AI分析模式 (简单/深度/流式/大师)
   - 多轮对话支持
   - 历史记录保存

3. **积分系统**
   - 注册赠送1000积分
   - 分析消耗100积分/次
   - 签到奖励
   - 积分交易记录

4. **数据持久化**
   - 分析历史
   - 收藏夹功能
   - 会话管理

### 🚧 开发中功能

1. **未币系统**
   - 虚拟货币钱包
   - 挖矿机制
   - 质押收益
   - 交易市场

2. **订阅系统**
   - VIP等级 (basic/advanced/professional)
   - 支付记录
   - 充值订单

## API接口汇总

### 认证模块 (/api/auth/)
- POST /register - 用户注册
- POST /login - 邮箱登录
- POST /login-sms - 短信登录
- GET /verify - Token验证
- GET /profile - 用户资料

### 分析模块 (/api/analysis/)
- POST /paipan - 生成排盘
- POST /simple - 简单分析
- POST /deep - 深度分析
- POST /stream - 流式分析
- POST /master - 大师分析

### 积分模块 (/api/points/)
- GET /balance - 积分余额
- GET /history - 积分历史
- POST /checkIn - 每日签到

### 聊天模块 (/api/chat/)
- POST /session - 创建会话
- POST /message - 发送消息
- GET /messages/:id - 消息历史

## 数据库表结构

### 用户相关 (11个表)
- User, Profile, InviteCode, SmsCode
- Subscription, PaymentRecord, RechargeOrder
- UserPoints, PointsRecord
- UserWeiCoins, WeiCoinRecord

### 业务相关 (7个表)
- ChatSession, ChatMessage
- AnalysisHistory
- MiningRecord, StakingRecord
- TradeOrder, EcosystemReward

### 知识库 (5个表，SQLite特有)
- symbols, combinations
- analysis_history
- knowledge_base
- mcp_tool_logs

## 部署配置

### 开发环境
```bash
# 后端: http://localhost:3001
# Taro: http://localhost:5173
# Next.js: http://localhost:3000
```

### 生产环境
```bash
# API服务器: http://101.201.148.8:3001
# 进程管理: PM2
# 反向代理: Nginx
# 数据库: PostgreSQL
```

## 技术债务

### 需要清理
1. ❌ apps/frontend-vue/ - Vue前端 (205个文件，可删除)
2. ❌ react-frontend/ - 空目录
3. ❌ 过期文档 (已删除8个)

### 需要决策
1. ❓ Next.js是否继续迁移还是专注Taro
2. ❓ 是否保留Vue代码作为参考
3. ❓ 未币系统是否继续开发

### 需要优化
1. ⚠️ 统一前端技术栈
2. ⚠️ 完善测试覆盖率
3. ⚠️ 添加CI/CD流程

## 开发建议

### 短期 (1-2周)
1. 决定Next.js项目去留
2. 清理遗留代码
3. 完善API文档

### 中期 (1个月)
1. 完成前端技术栈统一
2. 添加单元测试
3. 优化构建流程

### 长期 (3个月)
1. 实现未币系统
2. 完善订阅功能
3. 添加数据分析面板

## 关键文件路径

```bash
# 后端核心
/apps/backend/app.js                    # 主入口
/apps/backend/src/                      # 模块化代码
/apps/backend/prisma/schema.prisma      # 数据库模型

# Taro前端核心
/qimen-taro/src/pages/                  # 页面组件
/qimen-taro/src/store/                  # Redux状态
/qimen-taro/src/utils/api.ts           # API服务

# Next.js前端核心
/apps/frontend-nextjs/src/app/          # App Router
/apps/frontend-nextjs/src/lib/store/    # Redux状态
/apps/frontend-nextjs/src/components/   # 组件库

# 配置文件
/.env                                   # 根环境变量
/apps/backend/config.env               # 后端配置
/qimen-taro/.env.production            # Taro生产配置
```

## 总结

项目整体架构清晰，核心功能完整。主要问题是前端技术栈不统一，存在多个前端项目。建议：

1. **明确前端策略**: 选择Taro（多端）或Next.js（纯Web）作为主力
2. **清理遗留代码**: 删除不再使用的Vue前端和空目录
3. **完善文档**: 保持README.md与实际代码同步
4. **优化流程**: 添加自动化测试和部署

---

*项目版本: v3.1.0 | 文档版本: 2025.11*