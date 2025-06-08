# 云雀奇门遁甲 - 后端设置指南

## 已完成功能

1. **用户认证系统**
   - 用户注册
   - 用户登录
   - 用户登出
   - JWT认证
   - 用户资料获取
   - Token黑名单管理

2. **积分系统**
   - 积分获取
   - 积分消费
   - 积分记录
   - 积分历史查询

3. **订阅系统**
   - 订阅计划管理
   - 订阅购买
   - 订阅续费
   - 订阅取消

## 开发环境设置

### 先决条件
- Node.js 18+
- SQLite (开发环境)
- PostgreSQL 15 (生产环境)
- Redis 7

### 安装步骤

1. **克隆代码库**
   ```
   git clone <repository-url>
   cd yunque-qimen/backend
   ```

2. **安装依赖**
   ```
   npm install --legacy-peer-deps
   npm install --save-dev @types/node @types/express --legacy-peer-deps
   ```

3. **配置环境变量**
   创建或修改 `.env` 文件，确保以下变量正确设置：
   ```
   # SQLite开发环境
   DATABASE_URL="file:./prisma/dev.db"
   
   # PostgreSQL生产环境
   # DATABASE_URL="postgresql://user:password@localhost:5432/qimen?schema=public"
   
   # JWT配置
   JWT_SECRET="your-jwt-secret"
   JWT_EXPIRES_IN="7d"
   
   # Redis配置
   REDIS_URL="redis://localhost:6379"
   ```

4. **创建数据库结构**
   ```
   # 1. 修改schema.prisma确保使用SQLite
   # provider = "sqlite"
   # url = "file:./dev.db"
   
   # 2. 删除生成的客户端缓存
   rm -rf node_modules/.prisma generated
   
   # 3. 重新生成Prisma客户端
   npx prisma generate
   
   # 4. 推送数据库结构
   npx prisma db push
   ```

5. **启动开发服务器**
   ```
   npm run start:dev
   ```

## API 端点

### 认证 API

#### 注册
- **URL**: `/api/auth/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱@example.com",
    "password": "密码",
    "phone": "手机号码（可选）"
  }
  ```
- **响应**:
  ```json
  {
    "id": "用户ID",
    "username": "用户名",
    "email": "邮箱",
    "token": "JWT令牌"
  }
  ```

#### 登录
- **URL**: `/api/auth/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "usernameOrEmail": "用户名或邮箱",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "id": "用户ID",
    "username": "用户名",
    "email": "邮箱",
    "token": "JWT令牌"
  }
  ```

#### 登出
- **URL**: `/api/auth/logout`
- **方法**: `POST`
- **授权**: 需要 Bearer Token
- **响应**:
  ```json
  {
    "success": true
  }
  ```

#### 获取个人资料
- **URL**: `/api/auth/profile`
- **方法**: `GET`
- **授权**: 需要 Bearer Token
- **响应**:
  ```json
  {
    "id": "用户ID",
    "username": "用户名",
    "email": "邮箱"
  }
  ```

### 积分 API

#### 获取积分
- **URL**: `/api/points`
- **方法**: `GET`
- **授权**: 需要 Bearer Token
- **响应**:
  ```json
  {
    "id": "积分ID",
    "userId": "用户ID",
    "balance": 1000,
    "totalEarned": 1200,
    "totalSpent": 200,
    "pointsRecords": [...]
  }
  ```

#### 积分交易
- **URL**: `/api/points/transaction`
- **方法**: `POST`
- **授权**: 需要 Bearer Token
- **请求体**:
  ```json
  {
    "amount": 100,
    "type": "earned", // 或 "spent"
    "description": "签到奖励"
  }
  ```
- **响应**:
  ```json
  {
    "transaction": {
      "id": "交易ID",
      "amount": 100,
      "type": "earned",
      "description": "签到奖励",
      "createdAt": "2023-05-01T12:00:00Z"
    },
    "updatedPoints": {
      "balance": 1100,
      "totalEarned": 1300,
      "totalSpent": 200
    }
  }
  ```

#### 积分历史
- **URL**: `/api/points/history`
- **方法**: `GET`
- **授权**: 需要 Bearer Token
- **查询参数**: `limit=20&offset=0`