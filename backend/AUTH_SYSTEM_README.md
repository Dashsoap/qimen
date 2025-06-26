# 🔮 云雀奇门遁甲 - 认证系统

恭喜！你现在拥有一个完整的用户认证系统，比之前的simple-server.js强大很多！

## 🚀 快速启动

### 方法1：使用启动脚本（推荐）
```bash
./start-auth-server.sh
```

### 方法2：直接启动
```bash
# 启动认证服务器
node server.js

# 或启动旧版简单服务器
node simple-server.js
```

## ✨ 新增功能

### 🔐 认证系统
- ✅ **用户注册** - 支持用户名、邮箱、手机号
- ✅ **用户登录** - 支持用户名或邮箱登录
- ✅ **JWT认证** - 安全的token认证机制
- ✅ **密码加密** - bcrypt加密存储
- ✅ **输入验证** - Joi数据验证

### 💰 积分系统
- ✅ **积分管理** - 获得、消费、查询积分
- ✅ **交易记录** - 完整的积分变动历史
- ✅ **注册奖励** - 新用户自动获得1000积分

### 🛡️ 安全防护
- ✅ **限流保护** - 防止接口被滥用
- ✅ **Helmet防护** - 基础安全headers
- ✅ **CORS配置** - 跨域访问控制
- ✅ **权限验证** - 基于JWT的接口保护

### 🗄️ 数据库集成
- ✅ **Prisma ORM** - 现代化数据库操作
- ✅ **SQLite数据库** - 轻量级本地数据库
- ✅ **关系模型** - 用户、积分、订阅完整关联

## 📋 API接口文档

### 认证接口

#### 用户注册
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com", 
  "password": "123456",
  "phone": "13800138000"  // 可选
}
```

#### 用户登录
```bash
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "testuser",  // 用户名或邮箱
  "password": "123456"
}
```

#### 获取用户资料
```bash
GET /api/auth/profile
Authorization: Bearer <your-jwt-token>
```

#### 用户登出
```bash
POST /api/auth/logout
Authorization: Bearer <your-jwt-token>
```

### 积分接口

#### 查询积分
```bash
GET /api/points
Authorization: Bearer <your-jwt-token>
```

#### 积分交易
```bash
POST /api/points/transaction
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "amount": 100,
  "type": "earned",  // 或 "spent"
  "description": "每日签到奖励"
}
```

### 奇门功能

#### 排盘
```bash
POST /api/qimen/paipan
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "question": "今日运势如何？"
}
```

#### AI分析（消费100积分）
```bash
POST /api/analysis/qimen
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "question": "近期事业发展如何？",
  "paipanData": {...}  // 排盘数据
}
```

## 🧪 测试系统

### 安装测试依赖
```bash
npm install axios
```

### 运行完整测试
```bash
# 先启动服务器
node server.js

# 在另一个终端运行测试
node test-auth.js run
```

## 🔧 配置说明

### 环境变量（可选）
创建 `.env` 文件：
```env
# JWT配置
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# 数据库配置
DATABASE_URL="file:./prisma/dev.db"

# 服务器配置
PORT=3001
NODE_ENV="development"

# AI配置
ARK_API_KEY="your-api-key"
ARK_BASE_URL="https://www.sophnet.com/api/open-apis/v1"
ARK_MODEL="DeepSeek-R1"
```

### 数据库管理
```bash
# 初始化数据库
npm run init-db

# 重置数据库
npm run reset-db

# 查看数据库
npx prisma studio
```

## 📊 对比：新版 vs 旧版

| 功能 | 旧版(simple-server.js) | 新版(server.js) |
|------|----------------------|----------------|
| 用户系统 | ❌ 无 | ✅ 完整认证系统 |
| 安全性 | ❌ 基础 | ✅ JWT + 限流 + 验证 |
| 数据库 | ❌ 无 | ✅ Prisma + SQLite |
| 积分系统 | ❌ 无 | ✅ 完整积分管理 |
| 权限控制 | ❌ 无 | ✅ 基于Token的权限 |
| 错误处理 | ❌ 简单 | ✅ 完整错误处理 |
| 数据验证 | ❌ 无 | ✅ Joi输入验证 |
| API规范 | ❌ 简单 | ✅ RESTful设计 |

## 🎯 下一步建议

1. **前端集成** - 更新前端代码使用新的认证API
2. **生产部署** - 配置生产环境数据库
3. **功能扩展** - 添加更多业务功能
4. **性能优化** - 根据使用情况优化性能

## 🐛 常见问题

### Q: 启动时出现"Cannot find package"错误
A: 运行 `npm install` 安装依赖

### Q: 数据库相关错误
A: 运行 `npm run init-db` 初始化数据库

### Q: JWT token过期
A: 重新登录获取新token，默认有效期7天

### Q: 积分不足无法使用AI分析
A: 通过 `/api/points/transaction` 接口增加积分

## 🎉 总结

你的系统现在具备了：
- 🔐 **专业级认证系统**
- 💰 **完整积分体系**  
- 🛡️ **企业级安全防护**
- 🗄️ **现代化数据库**
- 🤖 **AI智能集成**

这已经是一个非常完整和专业的后端系统了！比之前的simple-server.js强大太多！

---

> 💡 **提示**: 使用 `./start-auth-server.sh` 可以快速启动和管理服务器！ 