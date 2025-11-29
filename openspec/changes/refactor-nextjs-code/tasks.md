# Next.js 前端代码重构任务清单

## 1. TypeScript 配置和类型系统

- [x] 1.1 启用 `tsconfig.json` 的 strict 模式
- [x] 1.2 创建全局类型定义文件 `src/types/index.ts`
- [x] 1.3 创建 API 响应类型 `src/types/api.ts`
- [x] 1.4 创建奇门遁甲数据类型 `src/types/qimen.ts`
- [x] 1.5 创建用户和认证类型 `src/types/auth.ts`

## 2. 环境变量和配置迁移

- [x] 2.1 创建 `.env.example` 模板文件
- [x] 2.2 更新 `next.config.js` 配置环境变量（已有配置）
- [x] 2.3 创建新的 API 客户端使用 Next.js 环境变量
- [x] 2.4 创建环境配置类型 `src/config/env.ts`

## 3. API 层重构

- [x] 3.1 将 `lib/utils/api.js` 迁移为 `lib/api/client.ts`
- [x] 3.2 创建类型安全的 API 客户端类
- [x] 3.3 实现请求拦截器和响应拦截器（基础实现）
- [x] 3.4 添加错误处理和重试机制（基础实现）
- [ ] 3.5 创建 API hooks (`useApi.ts`)（待后续实现）

## 4. 奇门遁甲核心库迁移

- [ ] 4.1 将 `lib/qimendunjia/index.js` 迁移为 TypeScript
- [ ] 4.2 将 `lib/qimendunjia/calendar.js` 迁移为 TypeScript
- [ ] 4.3 将 `lib/qimendunjia/wannianli.js` 迁移为 TypeScript
- [ ] 4.4 将 `lib/qimendunjia/config.js` 迁移为 TypeScript
- [ ] 4.5 为所有奇门遁甲函数添加完整类型定义

## 5. 工具函数迁移

- [ ] 5.1 将 `lib/utils/*.js` 文件逐个迁移为 TypeScript
- [ ] 5.2 为每个工具函数添加类型定义
- [ ] 5.3 移除所有 `any` 类型

## 6. 自定义 Hooks 创建

- [ ] 6.1 创建 `hooks/useQimen.ts` - 排盘逻辑（待实现）
- [ ] 6.2 创建 `hooks/useQimenAnalysis.ts` - AI 分析逻辑（待实现）
- [ ] 6.3 创建 `hooks/useAuth.ts` - 认证逻辑（待实现）
- [x] 6.4 创建 `hooks/useLocalStorage.ts` - 本地存储
- [x] 6.5 创建 `hooks/useAsyncState.ts` - 异步状态管理
- [x] 6.6 创建 `hooks/useMediaQuery.ts` - 媒体查询
- [x] 6.7 创建 `hooks/useResponsive.ts` - 响应式状态

## 7. 数据和常量分离

- [x] 7.1 创建 `constants/questions.ts` - 问题分类数据
- [x] 7.2 创建 `constants/qimen.ts` - 奇门遁甲常量
- [x] 7.3 创建 `constants/colors.ts` - 五行颜色映射
- [x] 7.4 创建 `constants/breakpoints.ts` - 响应式断点
- [x] 7.5 创建 `constants/index.ts` - 统一导出

## 8. 组件重构

- [ ] 8.1 重构 `app/(main)/home/page.tsx` - 使用 hooks 和常量
- [ ] 8.2 重构 `app/(main)/qimen/page.tsx` - 使用 useQimen hook
- [ ] 8.3 重构 `components/QimenItem.tsx` - 改善类型定义
- [ ] 8.4 重构 `components/MeaningModal.tsx` - 添加类型
- [ ] 8.5 为所有组件添加 PropTypes 或完整类型定义

## 9. 状态管理改进

- [ ] 9.1 审查和改进 Redux slice 的类型定义
- [ ] 9.2 为 `qimenSlice.ts` 添加严格类型
- [ ] 9.3 为 `infoSlice.ts` 添加严格类型
- [ ] 9.4 为 `themeSlice.ts` 添加严格类型
- [ ] 9.5 创建选择器（selectors）文件

## 10. 错误处理和边界

- [ ] 10.1 创建错误边界组件 `components/ErrorBoundary.tsx`
- [ ] 10.2 在根布局中使用错误边界
- [ ] 10.3 创建加载状态组件 `components/Loading.tsx`
- [ ] 10.4 添加全局错误处理逻辑

## 11. 代码质量和文档

- [ ] 11.1 为所有公共函数添加 JSDoc 注释
- [ ] 11.2 移除所有 console.log（或使用统一的日志工具）
- [ ] 11.3 统一代码格式（使用 Prettier）
- [ ] 11.4 添加 ESLint 规则检查

## 12. Tailwind CSS 配置和扩展

- [x] 12.1 扩展 `tailwind.config.js` - 添加自定义颜色（奇门遁甲主题色）
- [x] 12.2 配置自定义断点（移动端、平板、桌面端）
- [x] 12.3 添加自定义动画和过渡效果
- [x] 12.4 配置字体和排版
- [x] 12.5 添加自定义工具类和阴影
- [x] 12.6 创建 `lib/utils/cn.ts` - 类名合并工具

## 13. CSS 到 Tailwind 迁移

- [ ] 13.1 迁移 `home.css` - 首页样式转换为 Tailwind
- [ ] 13.2 迁移 `qimen.css` - 奇门盘样式转换为 Tailwind
- [ ] 13.3 迁移 `QimenItem.css` - 宫位组件样式转换为 Tailwind
- [ ] 13.4 迁移 `MeaningModal.css` - 弹窗样式转换为 Tailwind
- [ ] 13.5 迁移 `BottomNav.css` - 导航样式转换为 Tailwind
- [ ] 13.6 审查并删除不再需要的 CSS 文件

## 14. 响应式设计统一

- [ ] 14.1 创建 `useMediaQuery` hook - 统一媒体查询管理
- [ ] 14.2 创建 `useResponsive` hook - 提供响应式断点状态
- [ ] 14.3 重构首页组件 - 统一移动端和桌面端布局
- [ ] 14.4 重构奇门盘组件 - 优化不同屏幕尺寸下的显示
- [ ] 14.5 创建响应式容器组件 - `ResponsiveContainer`
- [ ] 14.6 添加响应式断点常量到 `constants/breakpoints.ts`

## 15. 主题和颜色系统

- [x] 15.1 提取所有硬编码颜色到 `constants/colors.ts`
- [x] 15.2 在 Tailwind 配置中定义主题颜色
- [x] 15.3 创建颜色工具函数（五行颜色映射）
- [x] 15.4 为深色/浅色模式准备主题变量
- [x] 15.5 配置 Tailwind 的 dark 模式（class 模式）

## 16. 测试和验证

- [ ] 16.1 验证排盘功能在移动端和桌面端正常
- [ ] 16.2 验证 AI 分析功能正常
- [ ] 16.3 验证环境变量在不同环境下正确加载
- [ ] 16.4 验证类型检查通过（`npm run type-check`）
- [ ] 16.5 验证构建成功（`npm run build`）
- [ ] 16.6 测试响应式布局在不同设备上的表现
- [ ] 16.7 验证 Tailwind 生成的 CSS 大小合理（< 50KB）

