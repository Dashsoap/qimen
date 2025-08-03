# 🔮 丁未奇门遁甲项目 - 快速上线版

## 📋 项目概述

丁未奇门遁甲项目是一个集成了传统奇门遁甲算法和现代AI分析的全栈应用系统。

### 🎯 核心功能
- 🔐 用户认证系统（手机号/邮箱登录）
- 🎲 奇门遁甲排盘算法
- 🤖 AI智能分析服务
- 💰 积分系统和签到功能
- 📱 移动端适配支持

### 🏗️ 技术架构

#### 后端技术栈
- **运行环境**: Node.js 20.x LTS
- **Web框架**: Express.js 4.x
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT + bcryptjs
- **进程管理**: PM2
- **部署**: CentOS + Nginx

#### 前端技术栈
- **框架**: Vue.js 3.x
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI组件**: 自定义组件库
- **移动端**: Capacitor

## 🚀 快速开始

### 🛠️ 开发环境
```bash
# 1. 安装依赖
./start-dev.sh install

# 2. 启动开发环境（交互式选择）
./start-dev.sh start
```

### 🌟 生产部署
```bash
# 使用标准部署脚本
./config/deploy.sh

# 使用修复版（如遇兼容性问题）
./config/deploy-fix.sh
```

### 🔧 手动部署
```bash
# 1. 上传代码到服务器
rsync -avz ./apps/backend/ root@101.201.148.8:/home/qimen-backend/

# 2. 登录服务器
ssh root@101.201.148.8

# 3. 安装依赖
cd /home/qimen-backend
npm install --production

# 4. 初始化数据库
npx prisma generate
npx prisma db push

# 5. 启动服务
pm2 start ecosystem.config.js --env production
```

## 📁 项目结构

**⚡ 项目结构已全面优化！** 查看 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) 了解详细结构。

```
yunque-qimen/
├── apps/                       # 🚀 应用程序目录
│   ├── backend/                # 🔧 后端应用
│   │   ├── app.js              # 统一入口点
│   │   ├── src/                # 源代码
│   │   └── prisma/             # 数据库配置
│   ├── frontend-vue/           # 🎨 Vue.js前端
│   └── frontend-react/         # ⚛️ React前端
├── config/                     # ⚙️ 配置文件
│   ├── deploy.sh               # 部署脚本
│   └── docker-compose.yml      # Docker配置
├── docs/                       # 📚 项目文档
└── start-dev.sh                # 🚀 开发环境启动脚本
```

## 🔧 服务管理

### PM2 命令
```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs qimen-backend

# 重启服务
pm2 restart qimen-backend

# 停止服务
pm2 stop qimen-backend

# 实时监控
pm2 monit
```

### 健康检查
```bash
# 检查后端API
curl http://101.201.148.8:3001/health

# 检查服务进程
ps aux | grep node

# 检查端口占用
netstat -tuln | grep 3001
```

## 🌐 API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/send-sms` - 发送短信验证码
- `POST /api/auth/login-sms` - 短信验证码登录
- `GET /api/auth/profile` - 获取用户信息

### 奇门遁甲接口
- `POST /api/qimen/paipan` - 奇门遁甲排盘
- `POST /api/analysis/qimen` - AI深度分析
- `POST /api/analysis/qimen/simple` - AI简单分析
- `POST /api/analysis/qimen/stream` - AI流式分析

### 积分系统接口
- `GET /api/points` - 获取积分信息
- `POST /api/points/transaction` - 积分交易
- `GET /api/points/history` - 积分历史

### 签到接口
- `GET /api/checkin/status` - 签到状态
- `POST /api/checkin` - 执行签到
- `GET /api/checkin/history` - 签到历史

## 🔐 环境配置

### 生产环境变量
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=file:./prisma/prod.db
JWT_SECRET=your-super-secure-jwt-secret-for-production
```

### 开发环境变量
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-jwt-secret-for-development
```

## 📊 性能监控

### 系统资源监控
```bash
# CPU和内存使用情况
htop

# 磁盘使用情况
df -h

# 网络连接状态
ss -tuln
```

### 应用监控
```bash
# PM2监控面板
pm2 monit

# 查看应用日志
tail -f /home/qimen-backend/logs/combined.log

# 查看错误日志
tail -f /home/qimen-backend/logs/error.log
```

## 🚨 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 检查端口占用
netstat -tuln | grep 3001

# 杀死占用进程
pkill -f node

# 重新启动
pm2 restart qimen-backend
```

#### 2. 数据库连接失败
```bash
# 检查数据库文件权限
ls -la /home/qimen-backend/prisma/

# 重新生成Prisma客户端
cd /home/qimen-backend
npx prisma generate
```

#### 3. 依赖安装失败
```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install --production
```

### 紧急恢复
```bash
# 快速重启所有服务
ssh root@101.201.148.8 '
  cd /home/qimen-backend && 
  pm2 stop qimen-backend && 
  pm2 start ecosystem.config.js --env production
'
```

## 📈 后续优化建议

### 短期优化（1-2周）
- [ ] 添加Redis缓存
- [ ] 优化数据库查询
- [ ] 增加API限流
- [ ] 完善错误监控

### 中期优化（1-2月）
- [ ] 升级到PostgreSQL
- [ ] 实现负载均衡
- [ ] 添加容器化部署
- [ ] 完善自动化测试

### 长期优化（3-6月）
- [ ] 迁移到NestJS架构
- [ ] 微服务化改造
- [ ] 实现分布式部署
- [ ] 添加监控告警系统

## 📞 技术支持

### 联系方式
- 项目仓库: [GitHub链接]
- 技术文档: [文档链接]
- 问题反馈: [Issue链接]

### 开发团队
- 后端开发: Express.js + Prisma
- 前端开发: Vue.js + Vite
- 运维部署: CentOS + PM2 + Nginx

---

## 🎉 快速上线完成！

您的丁未奇门遁甲项目已经准备好快速上线了！

**下一步操作：**
1. 执行 `./quick-deploy.sh` 进行一键部署
2. 访问 `http://101.201.148.8:3001/health` 检查服务状态
3. 访问 `http://101.201.148.8` 查看前端应用

**祝您部署顺利！** 🚀