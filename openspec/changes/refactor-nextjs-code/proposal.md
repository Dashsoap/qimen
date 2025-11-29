# Next.js 前端代码重构提案

## Why

Next.js 前端项目存在多个代码质量问题：TypeScript 严格模式未启用、大量使用 `any` 类型、JavaScript 与 TypeScript 文件混杂、环境变量配置错误（使用 Vite 配置而非 Next.js）、缺少自定义 hooks、数据逻辑未分离。这些问题降低了代码的可维护性、类型安全性和开发体验。

## What Changes

- 启用 TypeScript 严格模式，消除所有 `any` 类型
- 将所有 JavaScript 文件迁移为 TypeScript
- 修复环境变量配置，从 Vite 的 `import.meta.env` 迁移到 Next.js 的 `process.env`
- 创建自定义 hooks 提取可复用逻辑（`useQimen`、`useApi`、`useAuth` 等）
- 分离数据和逻辑，将硬编码数据提取到独立的常量文件
- 统一 API 层架构，创建类型安全的 API 客户端
- **将所有传统 CSS 迁移到 Tailwind CSS，减少自定义样式**
- **统一响应式设计策略，分离移动端（H5）和桌面端（PC）代码**
- **优化组件响应式布局，使用 Tailwind 断点系统**
- 添加错误边界和加载状态管理
- 改善组件结构和代码组织


## Impact

### 受影响的规范
- 新增 `frontend-nextjs` 能力规范（代码质量和架构）

### 受影响的代码
- `apps/frontend-nextjs/tsconfig.json` - 启用严格模式
- `apps/frontend-nextjs/src/lib/utils/api.js` - 迁移为 TypeScript，修复环境变量
- `apps/frontend-nextjs/src/lib/utils/*.js` - 所有 JS 文件迁移为 TS
- `apps/frontend-nextjs/src/lib/qimendunjia/*.js` - 核心库迁移为 TS
- `apps/frontend-nextjs/src/app/(main)/home/page.tsx` - 提取数据和逻辑，迁移到 Tailwind
- `apps/frontend-nextjs/src/app/(main)/qimen/page.tsx` - 使用自定义 hooks，迁移到 Tailwind
- `apps/frontend-nextjs/src/components/QimenItem.tsx` - 改善类型定义，迁移到 Tailwind
- `apps/frontend-nextjs/src/app/(main)/home/home.css` - 迁移到 Tailwind，可删除
- `apps/frontend-nextjs/src/app/(main)/qimen/qimen.css` - 迁移到 Tailwind，可删除
- `apps/frontend-nextjs/src/components/*.css` - 所有组件样式迁移到 Tailwind
- `apps/frontend-nextjs/src/hooks/` - 创建自定义 hooks（包括 useMediaQuery）
- `apps/frontend-nextjs/src/constants/` - 新建常量目录（包括主题颜色配置）
- `apps/frontend-nextjs/src/types/` - 新建类型定义目录
- `apps/frontend-nextjs/tailwind.config.js` - 扩展 Tailwind 配置（自定义颜色、断点）
- `apps/frontend-nextjs/next.config.js` - 配置环境变量

### 风险评估
- **低风险**：逐步重构，不改变业务逻辑
- **向后兼容**：保持 API 接口不变
- **测试覆盖**：重构后需要全面测试排盘和 AI 分析功能

