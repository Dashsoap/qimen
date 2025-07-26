# 🚀 丁未奇门遁甲系统 - 快速启动指南

## 📋 系统要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- SQLite（内置）或 PostgreSQL

## 🛠️ 安装步骤

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 配置环境变量
创建 `config.env` 文件：
```env
# 服务器配置
NODE_ENV=development
PORT=3001
HOST=localhost

# 数据库配置
DATABASE_URL="file:./dev.db"

# JWT配置（必需，至少32位字符）
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-32-chars-minimum"
JWT_EXPIRES_IN="7d"

# 加密配置
BCRYPT_ROUNDS=12

# AI服务配置（必需）
ARK_API_KEY="your-ark-api-key-here"
ARK_BASE_URL="https://www.sophnet.com/api/open-apis/v1"
ARK_MODEL="DeepSeek-R1"

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# 积分配置
ANALYSIS_POINTS_COST=100
REGISTER_BONUS_POINTS=1000

# 缓存配置
CACHE_TTL_MINUTES=5

# CORS配置
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"

# 日志配置
LOG_LEVEL="info"
LOG_FILE_PATH="./logs/app.log"
```

### 3. 初始化数据库
```bash
# 运行数据库迁移
npx prisma migrate dev

# （可选）生成Prisma客户端
npx prisma generate
```

## 🚀 启动系统

### 开发环境
```bash
# 启动开发服务器（带热重载）
npm run dev

# 或者直接运行
node app.js
```

### 生产环境
```bash
# 设置生产环境
export NODE_ENV=production

# 启动生产服务器
npm start
```

## 🔍 验证安装

### 1. 健康检查
```bash
curl http://localhost:3001/health
```

期待响应：
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0",
  "environment": "development",
  "database": "connected",
  "ai_provider": "sophnet_deepseek",
  "services": {
    "authentication": "ready",
    "database": "connected",
    "ai_agent": "ready",
    "points_system": "ready",
    "cache": "ready"
  }
}
```

### 2. 服务器信息
```bash
curl http://localhost:3001/
```

### 3. 用户注册测试
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

## 📊 监控面板

访问以下端点查看系统状态：

- **健康检查**: `GET /health`
- **服务器信息**: `GET /`
- **缓存统计**: 在积分查询响应中查看 `cacheStats`

## 🐛 故障排除

### 常见问题

#### 1. 配置验证失败
```
错误: 配置验证失败: JWT_SECRET必须设置，且不少于32位字符
解决: 确保JWT_SECRET至少32个字符
```

#### 2. 数据库连接失败
```
错误: 数据库连接失败
解决: 检查DATABASE_URL配置，运行 npx prisma migrate dev
```

#### 3. AI服务不可用
```
错误: ARK_API_KEY必须设置
解决: 在config.env中设置有效的ARK_API_KEY
```

### 日志查看
```bash
# 查看应用日志
tail -f logs/app.log

# 查看实时日志（开发环境）
npm run dev
```

## 🧪 API测试

使用以下curl命令测试主要功能：

### 用户认证
```bash
# 注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user1@test.com","password":"Pass123"}'

# 登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"user1","password":"Pass123"}'
```

### 积分系统
```bash
# 获取积分（需要JWT token）
curl -X GET http://localhost:3001/api/points \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 奇门排盘
```bash
# 排盘
curl -X POST http://localhost:3001/api/qimen/paipan \
  -H "Content-Type: application/json" \
  -d '{"question":"测试问题"}'
```

### AI分析
```bash
# AI分析（需要JWT token）
curl -X POST http://localhost:3001/api/analysis/qimen \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"question":"测试问题","paipanData":{...}}'
```

## 📈 性能优化建议

### 开发环境
- 启用详细日志：`LOG_LEVEL=debug`
- 减少缓存时间：`CACHE_TTL_MINUTES=1`

### 生产环境
- 设置合适的限流：`RATE_LIMIT_MAX_REQUESTS=500`
- 增加缓存时间：`CACHE_TTL_MINUTES=10`
- 使用强JWT密钥：至少64位字符

## 🔧 高级配置

### 使用PostgreSQL数据库
```env
DATABASE_URL="postgresql://user:password@localhost:5432/qimen_db"
```

### 启用Redis缓存（未来版本）
```env
REDIS_URL="redis://localhost:6379"
ENABLE_REDIS=true
```

### 集群模式（未来版本）
```env
CLUSTER_MODE=true
CLUSTER_WORKERS=4
```

---

## 📞 技术支持

如果遇到问题，请检查：

1. **配置文件**: 确保所有必需的环境变量都已设置
2. **依赖版本**: 确保Node.js和npm版本符合要求
3. **网络连接**: 确保可以访问AI服务API
4. **文件权限**: 确保应用有权限读写数据库和日志文件

---

*系统版本：v3.0.0 (统一优化版)*
*最后更新：2024年* 