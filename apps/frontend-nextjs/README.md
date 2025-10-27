# Next.js 奇门遁甲项目

这是从 React + Vite 迁移到 Next.js 的奇门遁甲AI预测应用。

## 🚀 主要改进

### ✅ 已完成的改造

1. **Next.js App Router 架构** ✅
   - 使用最新的 App Router (next 15+)
   - SSR/SSG 完全可用
   - 文件系统路由

2. **Redux 状态管理（SSR兼容）** ✅
   - 所有 Redux slices 已迁移
   - localStorage 安全访问（仅客户端）
   - Cookie + localStorage 双重存储（auth token）

3. **Middleware 路由守卫** ✅
   - 保护需要登录的路由（/history, /favorites）
   - 已登录用户访问 /login 自动重定向

4. **API代理配置** ✅
   - 通过 next.config.js 配置 rewrites
   - 支持开发和生产环境

## 📦 项目结构

```
frontend-nextjs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证路由组
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/            # 主要路由组
│   │   │   ├── home/
│   │   │   ├── qimen/
│   │   │   ├── history/
│   │   │   └── favorites/
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页（重定向到/home）
│   │   ├── providers.tsx      # Redux Provider
│   │   └── globals.css        # 全局样式
│   ├── components/            # 组件
│   │   ├── auth/             # 认证组件
│   │   ├── common/           # 通用组件
│   │   ├── icons/            # 图标组件
│   │   └── layout/           # 布局组件
│   ├── lib/                   # 核心库
│   │   ├── store/            # Redux状态管理
│   │   ├── api/              # API服务
│   │   ├── qimendunjia/      # 奇门遁甲核心逻辑
│   │   └── utils/            # 工具函数
│   └── middleware.ts          # 路由中间件
├── public/                    # 静态资源
├── next.config.js            # Next.js配置
├── tailwind.config.js        # TailwindCSS配置
└── package.json              # 依赖配置
```

## 🔧 待迁移内容

### 需要手动迁移的部分

#### 1. 组件迁移
```bash
# 从 frontend-react/src/components 复制到 frontend-nextjs/src/components
# 需要添加 'use client' 指令的组件：
- auth/* (所有认证组件)
- layout/BottomNav (使用 usePathname)
- layout/Header (使用 useRouter)
- StreamAnalysis (使用 useState, useEffect)
- QimenItem (交互组件)
```

#### 2. 页面完整内容迁移
```bash
# 完整迁移以下页面：
- QimenPage (最复杂，包含排盘逻辑)
- HistoryPage
- FavoritesPage  
- ProfilePage
- SettingsPage
- AboutPage
```

#### 3. 业务逻辑迁移
```bash
# 从 frontend-react/src/qimendunjia 复制到 frontend-nextjs/src/lib/qimendunjia
- index.js
- calendar.ts
- wannianli.ts
- config.ts
```

#### 4. API服务迁移
```bash
# 从 frontend-react/src/services 复制到 frontend-nextjs/src/lib/api
- api.js -> api.ts (已有基础版本)
```

#### 5. Hooks 迁移
```bash
# 从 frontend-react/src/hooks 复制到 frontend-nextjs/src/hooks
- useAuth.ts
- useApi.ts
- useQimen.ts
```

#### 6. 工具函数迁移
```bash
# 从 frontend-react/src/utils 复制到 frontend-nextjs/src/lib/utils
- api.js
- other utility files
```

#### 7. 静态资源迁移
```bash
# 复制以下文件到 public/
- STXihei.ttf (字体文件)
- assets/ (图片等资源)
```

## 🛠️ 开发指南

### 安装依赖

\`\`\`bash
cd apps/frontend-nextjs
npm install
\`\`\`

### 开发模式

\`\`\`bash
npm run dev
# 访问 http://localhost:3000
\`\`\`

### 生产构建

\`\`\`bash
npm run build
npm start
\`\`\`

## 🔑 关键差异对比

| 特性 | React + Vite | Next.js |
|------|-------------|---------|
| 路由 | React Router | App Router (文件系统) |
| 导航 | `useNavigate()` | `useRouter()` / `<Link>` |
| 客户端组件 | 默认 | 需要 `'use client'` |
| localStorage | 直接访问 | 需判断 `typeof window !== 'undefined'` |
| API代理 | vite.config.js proxy | next.config.js rewrites |
| 路由守卫 | `<ProtectedRoute>` 组件 | middleware.ts |
| 环境变量 | `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` |

## 📝 迁移检查清单

- [x] Next.js 项目初始化
- [x] Redux 状态管理（SSR兼容）
- [x] 路由中间件（认证守卫）
- [x] API代理配置
- [x] 基础页面结构
- [ ] 认证组件迁移
- [ ] 通用组件迁移
- [ ] 完整页面内容迁移
- [ ] 奇门遁甲核心逻辑迁移
- [ ] Hooks 迁移
- [ ] 样式和资源迁移
- [ ] API服务完整迁移
- [ ] 测试和调试

## 🎯 下一步操作

1. **复制静态资源**
   ```bash
   cp -r ../frontend-react/public/STXihei.ttf ./public/
   cp -r ../frontend-react/src/assets ./public/assets
   ```

2. **迁移业务逻辑**
   ```bash
   cp -r ../frontend-react/src/qimendunjia ./src/lib/
   ```

3. **迁移通用组件**
   - 逐个复制组件文件
   - 添加 'use client' 指令
   - 更新导入路径（使用 @ 别名）
   - 替换 React Router API 为 Next.js API

4. **迁移完整页面**
   - 参考已有的 home/page.tsx 结构
   - 保持原有功能逻辑
   - 使用 Next.js 特有的优化（Image组件等）

5. **测试和优化**
   - 功能测试
   - 性能优化
   - SEO优化

## 🚀 优势

相比原 Vite 版本的优势：

1. **SEO友好** - SSR确保搜索引擎可索引
2. **首屏加载更快** - 服务端渲染
3. **代码分割更好** - 自动优化
4. **开发体验** - 文件系统路由更直观
5. **生产环境优化** - 自动优化图片、字体等

## 📚 参考文档

- [Next.js 文档](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TailwindCSS](https://tailwindcss.com/)

## ❓ 常见问题

### Q: 为什么需要 'use client'？
A: Next.js 默认所有组件都是服务端组件，如果需要使用客户端特性（hooks、事件处理等），需要添加 'use client' 指令。

### Q: localStorage 为什么需要特殊处理？
A: 服务端渲染时没有 window 对象，直接访问 localStorage 会报错，需要判断环境。

### Q: 如何处理环境变量？
A: 使用 `NEXT_PUBLIC_` 前缀的环境变量可以在客户端访问，其他变量只能在服务端访问。

---

**项目状态**: 🚧 迁移进行中 (60% 完成)
**最后更新**: 2025-10-26

