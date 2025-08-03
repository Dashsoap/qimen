# 🏗️ 丁未奇门遁甲项目 - 项目结构规范

## 📁 优化后的项目结构

经过重构优化，项目现在采用清晰的模块化架构，完全消除了重复和废弃代码。

```
yunque-qimen/
├── apps/                           # 🚀 应用程序目录
│   ├── backend/                    # 🔧 后端应用
│   │   ├── app.js                  # 统一入口点
│   │   ├── src/                    # 源代码
│   │   │   ├── config/             # 配置管理
│   │   │   ├── services/           # 业务服务
│   │   │   ├── routes/             # 路由模块
│   │   │   └── middleware/         # 中间件
│   │   ├── prisma/                 # 数据库模式
│   │   └── package.json            # 依赖配置
│   ├── frontend-vue/               # 🎨 Vue.js前端
│   │   ├── src/                    # 源代码
│   │   ├── public/                 # 静态资源
│   │   ├── ios/                    # iOS移动端
│   │   └── package.json            # 依赖配置
│   └── frontend-react/             # ⚛️ React前端
│       ├── src/                    # 源代码
│       ├── public/                 # 静态资源
│       ├── android/                # Android移动端
│       ├── ios/                    # iOS移动端
│       └── package.json            # 依赖配置
├── config/                         # ⚙️ 配置文件
│   ├── deploy.sh                   # 部署脚本
│   ├── deploy-fix.sh               # 修复版部署脚本
│   └── docker-compose.yml          # Docker配置
├── docs/                           # 📚 项目文档
│   ├── README.md                   # 项目说明
│   ├── PROJECT_STRUCTURE.md        # 项目结构（本文件）
│   ├── FEATURE_SUMMARY.md          # 功能总结
│   └── ...                         # 其他文档
├── .env                            # 环境变量
├── .gitignore                      # Git忽略规则
└── package.json                    # 根级依赖（如有）
```

## 🎯 架构设计原则

### 1. 模块化分离
- **应用分离**: 前端、后端各自独立，便于单独部署
- **版本并存**: Vue和React前端可同时维护
- **配置集中**: 所有配置文件统一管理

### 2. 清晰命名
- **apps/**: 所有可执行应用
- **config/**: 部署和环境配置
- **docs/**: 项目文档和说明

### 3. 废弃清理
已删除的无用目录：
- ❌ `backend-nestjs/` - 空的NestJS目录
- ❌ `enterprise-backend/` - 空的企业后端目录
- ❌ `pages/` - 空的页面目录
- ❌ `components/` - 空的组件目录
- ❌ `prisma/` - 废弃的数据库配置
- ❌ `qimen-apk/` - 旧的APK构建目录

## 🚀 应用说明

### 后端应用 (apps/backend/)
- **技术栈**: Node.js + Express + Prisma + SQLite
- **入口文件**: `app.js` (统一入口点)
- **功能**: 用户认证、奇门遁甲计算、AI分析、积分系统
- **状态**: ✅ 生产就绪

### Vue前端 (apps/frontend-vue/)
- **技术栈**: Vue 3 + Pinia + Vite + Capacitor
- **版本**: 1.0.1750352961
- **功能**: 完整的奇门遁甲界面，移动端支持
- **状态**: ✅ 生产就绪

### React前端 (apps/frontend-react/)
- **技术栈**: React 18 + Redux Toolkit + Vite + Capacitor
- **版本**: 0.0.0 (迁移版本)
- **功能**: Vue版本的完整迁移，增强的移动端支持
- **状态**: ✅ 迁移完成，生产就绪

## 📱 移动端支持

### Vue前端移动端
- **平台**: Android + iOS
- **构建**: `npm run build:mobile`
- **包名**: `com.guiguqimen.app.1750352961`

### React前端移动端
- **平台**: Android + iOS
- **构建**: `npm run build:mobile`
- **包名**: `com.guiguqimen.react.app`
- **特色**: API配置优化，强制使用服务器地址

## 🔧 开发工作流

### 后端开发
```bash
cd apps/backend
npm install
node app.js
```

### Vue前端开发
```bash
cd apps/frontend-vue
npm install
npm run dev
```

### React前端开发
```bash
cd apps/frontend-react
npm install
npm run dev
```

### 移动端构建
```bash
# Vue移动端
cd apps/frontend-vue
npm run build:mobile

# React移动端
cd apps/frontend-react
npm run build:mobile
```

## 🌐 部署配置

### 生产部署
```bash
# 使用标准部署脚本
./config/deploy.sh

# 使用修复版（如遇兼容性问题）
./config/deploy-fix.sh
```

### 环境配置
- **开发环境**: 使用本地API (localhost:3001)
- **生产环境**: 使用服务器API (101.201.148.8:3001)
- **移动端**: 强制使用服务器API

## 📈 项目优势

### 优化前问题
- ❌ 重复的后端文件 (index.js, server.js, simple-server.js)
- ❌ 混乱的目录结构
- ❌ 废弃文件未清理
- ❌ 配置文件分散

### 优化后解决方案
- ✅ 统一的后端入口 (app.js)
- ✅ 清晰的模块化结构
- ✅ 废弃代码完全清理
- ✅ 配置文件集中管理
- ✅ 文档体系完善

## 🎯 未来规划

### 短期 (1-2周)
- [ ] 更新CI/CD管道适配新结构
- [ ] 创建开发环境快速启动脚本
- [ ] 补充API文档

### 中期 (1-2月)
- [ ] 考虑微服务架构
- [ ] 添加监控和日志系统
- [ ] 优化移动端构建流程

---

## 🏆 项目现状

**架构状态**: ✅ 完全优化  
**代码质量**: ✅ 高质量，零重复  
**部署就绪**: ✅ 所有环境可用  
**文档完善**: ✅ 结构清晰

---

*🔮 传承千年智慧，拥抱现代架构 - 丁未奇门遁甲项目* 