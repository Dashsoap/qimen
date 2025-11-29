# Frontend Next.js Code Quality Specification

## ADDED Requirements

### Requirement: TypeScript 严格模式

Next.js 前端项目 SHALL 启用 TypeScript 严格模式，包括 `strict`、`noImplicitAny`、`strictNullChecks` 等编译选项。

#### Scenario: 类型检查通过

- **WHEN** 开发者运行 `npm run type-check` 或 `tsc --noEmit`
- **THEN** TypeScript 编译器不应报告类型错误
- **AND** 所有组件和函数都有明确的类型定义

#### Scenario: 禁止使用 any 类型

- **WHEN** 代码审查或类型检查时
- **THEN** 不应存在未注释的 `any` 类型
- **AND** 必要的类型断言应使用 `unknown` 或具体类型

### Requirement: JavaScript 到 TypeScript 迁移

所有 JavaScript 文件（`.js` 和 `.jsx`）SHALL 迁移为 TypeScript 文件（`.ts` 和 `.tsx`），并添加完整的类型定义。

#### Scenario: 核心库类型化

- **WHEN** 使用奇门遁甲核心库（`lib/qimendunjia/`）
- **THEN** 所有函数和类都应有 TypeScript 类型定义
- **AND** 导出的接口和类型应在 `types/qimen.ts` 中定义

#### Scenario: 工具函数类型化

- **WHEN** 使用工具函数（`lib/utils/`）
- **THEN** 每个函数都应有输入输出类型定义
- **AND** 复杂类型应提取为独立的类型定义

### Requirement: Next.js 环境变量配置

项目 SHALL 使用 Next.js 官方推荐的环境变量方案，不应使用 Vite 的 `import.meta.env`。

#### Scenario: 客户端环境变量

- **WHEN** 在客户端组件中访问环境变量
- **THEN** 必须使用 `process.env.NEXT_PUBLIC_` 前缀
- **AND** 变量应在 `.env.local` 或 `.env.production` 中定义

#### Scenario: 服务器端环境变量

- **WHEN** 在服务器端代码或 API 路由中访问环境变量
- **THEN** 可以直接使用 `process.env.VARIABLE_NAME`
- **AND** 敏感变量不应有 `NEXT_PUBLIC_` 前缀

#### Scenario: 环境变量类型安全

- **WHEN** 访问任何环境变量
- **THEN** 应通过类型定义文件（`config/env.ts`）提供类型检查
- **AND** 缺失的必需变量应在启动时抛出错误

### Requirement: 自定义 Hooks 组织

项目 SHALL 创建自定义 hooks 提取可复用逻辑，并按功能域组织在 `hooks/` 目录下。

#### Scenario: 排盘逻辑 Hook

- **WHEN** 组件需要执行奇门遁甲排盘
- **THEN** 应使用 `useQimen` hook 而非在组件中直接实现
- **AND** hook 应返回排盘数据、加载状态和错误信息

#### Scenario: API 请求 Hook

- **WHEN** 组件需要调用后端 API
- **THEN** 应使用 `useApi` 或特定的 API hook（如 `useQimenAnalysis`）
- **AND** hook 应处理加载状态、错误和数据缓存

#### Scenario: 认证逻辑 Hook

- **WHEN** 组件需要访问用户认证状态
- **THEN** 应使用 `useAuth` hook
- **AND** hook 应提供登录、登出、获取用户信息等方法

### Requirement: 数据和逻辑分离

组件中的硬编码数据和配置 SHALL 提取到 `constants/` 目录，逻辑应提取到 hooks 或工具函数中。

#### Scenario: 问题分类数据提取

- **WHEN** 首页需要显示问题分类列表
- **THEN** 问题数据应从 `constants/questions.ts` 导入
- **AND** 数据应有完整的 TypeScript 类型定义

#### Scenario: 奇门遁甲常量提取

- **WHEN** 组件需要使用五行、八门、九星等配置
- **THEN** 应从 `constants/qimen.ts` 导入
- **AND** 常量应使用 `as const` 确保类型不变性

#### Scenario: 颜色映射提取

- **WHEN** 组件需要根据五行显示颜色
- **THEN** 颜色映射应从 `constants/colors.ts` 导入
- **AND** 类型应确保只能使用预定义的五行值

### Requirement: 统一的 API 客户端

项目 SHALL 提供统一的类型安全 API 客户端，集中管理所有后端请求。

#### Scenario: API 请求类型安全

- **WHEN** 调用任何后端 API
- **THEN** 请求参数和响应数据都应有明确的类型定义
- **AND** 类型定义应在 `types/api.ts` 中维护

#### Scenario: 统一错误处理

- **WHEN** API 请求失败
- **THEN** 错误应被标准化为统一的错误格式
- **AND** 应提供用户友好的错误消息

#### Scenario: 请求拦截和认证

- **WHEN** 发起需要认证的 API 请求
- **THEN** API 客户端应自动添加 JWT token 到请求头
- **AND** token 过期时应触发登出流程

### Requirement: 类型定义组织

所有 TypeScript 类型定义 SHALL 组织在 `types/` 目录下，按功能域分文件。

#### Scenario: 全局类型定义

- **WHEN** 需要在多个文件中使用的通用类型
- **THEN** 应定义在 `types/index.ts`
- **AND** 应使用命名导出以便按需引入

#### Scenario: API 类型定义

- **WHEN** 定义后端 API 的请求和响应类型
- **THEN** 应在 `types/api.ts` 中定义
- **AND** 应使用接口继承减少重复定义

#### Scenario: 领域模型类型

- **WHEN** 定义奇门遁甲领域模型（如宫位、天盘、地盘）
- **THEN** 应在 `types/qimen.ts` 中定义
- **AND** 应与后端数据模型保持一致

### Requirement: 错误边界和异常处理

应用 SHALL 提供多层次的错误处理机制，包括错误边界、异步错误捕获和用户友好的错误提示。

#### Scenario: 组件渲染错误捕获

- **WHEN** 组件渲染过程中抛出异常
- **THEN** 错误边界应捕获错误并显示降级 UI
- **AND** 错误信息应被记录到日志系统

#### Scenario: 异步操作错误处理

- **WHEN** API 请求或异步操作失败
- **THEN** 错误应被 hook 捕获并设置到错误状态
- **AND** 组件应显示用户友好的错误提示

#### Scenario: 全局错误处理

- **WHEN** 发生未捕获的全局错误
- **THEN** 应有顶层错误边界捕获
- **AND** 应提供重新加载或返回首页的选项

### Requirement: 代码质量和规范

项目代码 SHALL 遵循统一的代码规范，包括格式化、命名约定和注释标准。

#### Scenario: 代码格式化

- **WHEN** 提交代码前
- **THEN** 应使用 Prettier 格式化所有代码
- **AND** 格式化规则应在 `.prettierrc` 中统一配置

#### Scenario: 函数和组件注释

- **WHEN** 编写公共函数、组件或 hook
- **THEN** 应添加 JSDoc 注释说明用途、参数和返回值
- **AND** 复杂业务逻辑应有中文注释说明

#### Scenario: 未使用代码清理

- **WHEN** 代码审查时
- **THEN** 不应存在未使用的变量、函数或导入
- **AND** 应移除或注释掉的调试代码（如 `console.log`）

### Requirement: Tailwind CSS 样式系统

所有组件样式 SHALL 优先使用 Tailwind CSS 工具类，减少自定义 CSS 文件。

#### Scenario: 组件样式迁移

- **WHEN** 创建或重构组件
- **THEN** 应使用 Tailwind 工具类实现样式
- **AND** 复杂样式可组合多个工具类或使用 `@apply` 指令

#### Scenario: 自定义样式限制

- **WHEN** 需要编写自定义 CSS
- **THEN** 仅在复杂动画、特殊布局或浏览器兼容性场景下使用
- **AND** 应在组件文件中使用 CSS Modules 或添加注释说明原因

#### Scenario: Tailwind 配置扩展

- **WHEN** 需要项目特定的颜色、字体或间距
- **THEN** 应在 `tailwind.config.js` 的 `extend` 中定义
- **AND** 使用语义化的命名（如 `qimen-gold`、`wuxing-fire`）

### Requirement: 响应式设计系统

项目 SHALL 使用统一的响应式设计策略，清晰支持移动端、平板和桌面端。

#### Scenario: Tailwind 断点使用

- **WHEN** 实现响应式布局
- **THEN** 应使用 Tailwind 的响应式前缀（`sm:`、`md:`、`lg:`、`xl:`）
- **AND** 遵循移动优先原则（默认样式为移动端）

#### Scenario: JavaScript 响应式判断

- **WHEN** 需要在 JavaScript 逻辑中判断屏幕尺寸
- **THEN** 应使用 `useResponsive` 或 `useMediaQuery` hook
- **AND** 不应直接使用 `window.innerWidth`

#### Scenario: 组件响应式变体

- **WHEN** 移动端和桌面端需要显著不同的布局
- **THEN** 应使用条件渲染或响应式工具类
- **AND** 避免创建完全独立的组件导致代码重复

### Requirement: 主题颜色系统

项目 SHALL 建立统一的主题颜色系统，所有颜色值通过 Tailwind 配置管理。

#### Scenario: 奇门遁甲主题色

- **WHEN** 使用项目主题色（金色、棕色等）
- **THEN** 应使用 Tailwind 的 `qimen-*` 颜色类
- **AND** 不应在代码中硬编码十六进制颜色值

#### Scenario: 五行颜色映射

- **WHEN** 根据五行属性显示颜色
- **THEN** 应使用 `wuxing-*` 颜色类或工具函数
- **AND** 颜色映射逻辑应在 `constants/colors.ts` 中定义

#### Scenario: 深色模式支持

- **WHEN** 实现深色模式
- **THEN** 应使用 Tailwind 的 `dark:` 前缀
- **AND** 在 `tailwind.config.js` 中配置 `darkMode: 'class'`

### Requirement: 响应式 Hooks

项目 SHALL 提供统一的响应式 hooks 用于屏幕尺寸判断和媒体查询。

#### Scenario: 屏幕尺寸判断

- **WHEN** 组件需要知道当前是移动端还是桌面端
- **THEN** 应使用 `useResponsive` hook
- **AND** hook 应返回 `{ isMobile, isTablet, isDesktop }` 状态

#### Scenario: 自定义媒体查询

- **WHEN** 需要自定义断点判断
- **THEN** 应使用 `useMediaQuery(query)` hook
- **AND** query 参数应与 Tailwind 断点保持一致

#### Scenario: SSR 兼容性

- **WHEN** hooks 在服务器端渲染时执行
- **THEN** 应返回默认值（如 `isMobile: false`）
- **AND** 在客户端水合后更新为实际值

