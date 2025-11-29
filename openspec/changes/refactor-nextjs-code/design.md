# Next.js 前端代码重构设计文档

## Context

Next.js 前端项目是奇门遁甲 AI 分析系统的主要 Web 界面，目前存在以下问题：

1. TypeScript 严格模式未启用（`strict: false`），降低类型安全性
2. 大量使用 `any` 类型，失去 TypeScript 的优势
3. JavaScript 和 TypeScript 文件混杂，增加维护难度
4. 使用 Vite 的环境变量配置（`import.meta.env`），但这是 Next.js 项目
5. hooks 目录为空，逻辑分散在组件中
6. 数据和逻辑耦合，硬编码数据直接写在组件中
7. 缺少统一的 API 层和错误处理

这些问题需要系统性重构以提高代码质量、可维护性和开发体验。

## Goals / Non-Goals

### Goals
- 启用 TypeScript 严格模式，消除所有 `any` 类型
- 将所有 JavaScript 文件迁移为 TypeScript
- 修复环境变量配置，适配 Next.js 规范
- 创建自定义 hooks 提取可复用逻辑
- 分离数据和逻辑，提高可维护性
- 建立统一的 API 层和错误处理机制
- **将所有传统 CSS 迁移到 Tailwind CSS，提高样式一致性**
- **统一响应式设计，清晰分离移动端和桌面端代码**
- **建立主题颜色系统，便于维护和扩展**
- 保持业务功能不变，确保向后兼容

### Non-Goals
- 不改变现有的业务逻辑和功能
- 不涉及 UI/UX 的重新设计
- 不修改后端 API 接口
- 不引入新的第三方库（除必要的类型定义）

## Decisions

### 1. TypeScript 严格模式配置

**决策**：启用所有严格模式选项

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

**理由**：
- 提供更好的类型安全保障
- 在开发阶段捕获潜在错误
- 改善 IDE 的自动补全和类型提示

**替代方案**：
- 逐步启用严格模式：先启用 `noImplicitAny`，再逐步启用其他选项
- **不选择原因**：一次性启用更彻底，避免后续再次重构

### 2. 环境变量迁移策略

**决策**：使用 Next.js 官方推荐的环境变量方案

```typescript
// 客户端变量（NEXT_PUBLIC_ 前缀）
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// 服务器端变量
const secret = process.env.API_SECRET;
```

**理由**：
- Next.js 官方推荐方案
- 明确区分客户端和服务器端变量
- 构建时注入，性能更好

**替代方案**：
- 继续使用运行时配置
- **不选择原因**：不符合 Next.js 最佳实践，性能较差

### 3. API 层架构

**决策**：创建基于类的 API 客户端

```typescript
class ApiClient {
  private baseUrl: string;
  private token?: string;

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // 统一的请求处理
  }

  // 具体的 API 方法
  async qimenAnalysis(data: QimenAnalysisRequest): Promise<QimenAnalysisResponse> {
    return this.request('/api/analysis/qimen', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
```

**理由**：
- 集中管理 API 请求
- 统一错误处理和重试逻辑
- 易于扩展和测试
- 完整的类型支持

**替代方案**：
- 使用函数式 API（如 `createApiClient()` 工厂函数）
- **不选择原因**：类结构更清晰，便于维护状态（如 token）

### 4. 自定义 Hooks 设计

**决策**：按功能域划分 hooks

- `useQimen` - 排盘核心逻辑
- `useQimenAnalysis` - AI 分析逻辑
- `useAuth` - 认证逻辑
- `useAsyncState` - 通用异步状态管理

**理由**：
- 按业务功能组织，职责清晰
- 便于复用和测试
- 减少组件复杂度

**替代方案**：
- 创建更细粒度的 hooks（如 `usePaipan`、`useShowPalaceInfo` 等）
- **不选择原因**：过于细碎，增加维护成本

### 5. 数据组织策略

**决策**：创建 `constants/` 目录，按领域分文件

```
constants/
├── questions.ts      # 问题分类数据
├── qimen.ts         # 奇门遁甲常量（五行、八门等）
├── colors.ts        # 颜色映射
└── index.ts         # 统一导出
```

**理由**：
- 数据和逻辑分离
- 便于维护和更新
- 可复用性高

**替代方案**：
- 使用 JSON 文件存储数据
- **不选择原因**：TypeScript 文件可以提供类型检查和导出类型

### 6. 错误处理策略

**决策**：三层错误处理

1. **API 层**：捕获网络错误，标准化错误格式
2. **Hook 层**：处理业务逻辑错误，提供用户友好提示
3. **组件层**：使用 ErrorBoundary 捕获渲染错误

**理由**：
- 分层处理，职责清晰
- 提供更好的用户体验
- 便于调试和日志记录

## Risks / Trade-offs

### 风险1：迁移过程中引入 bug

**风险等级**：中

**缓解措施**：
- 逐文件迁移，每次提交后测试
- 保持业务逻辑不变，只改变代码组织
- 重点测试关键功能（排盘、AI 分析）

### 风险2：TypeScript 严格模式导致大量类型错误

**风险等级**：中

**缓解措施**：
- 逐步启用严格模式规则
- 使用 `// @ts-expect-error` 临时标记复杂类型问题
- 优先修复高优先级类型错误

### 风险3：环境变量迁移影响不同环境部署

**风险等级**：低

**缓解措施**：
- 创建详细的环境变量文档
- 在开发、测试、生产环境分别验证
- 提供 `.env.example` 模板

### Trade-off1：重构时间 vs 业务功能开发

**决策**：分阶段重构，不阻塞业务功能

- 第一阶段：核心类型和 API 层（2-3天）
- 第二阶段：自定义 hooks 和数据分离（2-3天）
- 第三阶段：组件重构和优化（2-3天）

### Trade-off2：完美类型 vs 开发效率

**决策**：实用主义，允许合理的类型断言

- 对于第三方库的复杂类型，允许使用 `as` 断言
- 对于临时数据转换，可以使用 `unknown` 类型
- 核心业务逻辑必须有完整类型定义

## Migration Plan

### 阶段1：基础设施（第1-2天）

1. 启用 TypeScript 严格模式
2. 创建类型定义目录和基础类型
3. 迁移环境变量配置
4. 创建新的 API 客户端

**验证标准**：
- `tsc --noEmit` 通过编译（允许少量 `@ts-expect-error`）
- 环境变量在 dev 和 build 模式下正确加载

### 阶段2：核心逻辑迁移（第3-4天）

1. 迁移奇门遁甲核心库为 TypeScript
2. 创建自定义 hooks
3. 提取常量数据

**验证标准**：
- 排盘功能正常，结果与原版一致
- 无 TypeScript 错误

### 阶段3：组件重构（第5-6天）

1. 重构页面组件使用新的 hooks
2. 改善组件类型定义
3. 添加错误边界

**验证标准**：
- 所有页面正常渲染
- AI 分析功能正常
- 用户交互无异常

### 阶段4：完善和优化（第7天）

1. 添加代码注释和文档
2. 清理 console.log
3. 代码格式化和 lint

**验证标准**：
- `npm run build` 成功
- 无 ESLint 错误
- 代码审查通过

### Rollback Plan

如果重构出现严重问题：

1. Git 回滚到重构前的 commit
2. 保留已创建的类型定义文件
3. 关闭 TypeScript 严格模式
4. 逐步应用成功的部分重构

### 7. CSS 迁移策略

**决策**：渐进式迁移，优先使用 Tailwind，保留少量必要的自定义样式

```typescript
// 迁移前（CSS）
<div className="input-card">
  <textarea className="question-textarea" />
</div>

// 迁移后（Tailwind）
<div className="bg-white rounded-xl p-5 shadow-md">
  <textarea className="w-full min-h-[100px] border-none outline-none resize-none text-base leading-relaxed text-gray-900" />
</div>
```

**理由**：
- Tailwind 提供一致的设计系统
- 减少 CSS 文件大小和维护成本
- 更好的响应式支持
- 便于主题定制

**保留自定义 CSS 的场景**：
- 复杂动画（如奇门盘旋转、光晕效果）
- 特殊布局（如九宫格表格）
- 浏览器兼容性需要的 hack

**替代方案**：
- 继续使用传统 CSS 模块
- **不选择原因**：难以维护，响应式处理不一致

### 8. 响应式设计策略

**决策**：使用 Tailwind 断点系统 + 自定义 hooks

```typescript
// 断点定义
const breakpoints = {
  sm: '640px',   // 移动端
  md: '768px',   // 平板
  lg: '1024px',  // 桌面端
  xl: '1280px',  // 大屏
};

// 使用示例
const { isMobile, isTablet, isDesktop } = useResponsive();

<div className={cn(
  "grid gap-3",
  isMobile && "grid-cols-1",
  isTablet && "grid-cols-2",
  isDesktop && "grid-cols-3"
)}>
```

**理由**：
- 统一响应式断点管理
- TypeScript 类型安全
- 便于在 JS 逻辑中使用
- 减少媒体查询代码

**替代方案**：
- 为移动端和桌面端创建完全独立的组件
- **不选择原因**：代码重复，维护成本高

### 9. 主题颜色系统

**决策**：在 Tailwind 配置中定义奇门遁甲主题色

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        qimen: {
          gold: '#d4af37',      // 主色调（金色）
          brown: '#753C15',     // 棕色
          cream: '#FEFDF7',     // 米黄色
          border: '#85754e',    // 边框色
        },
        wuxing: {
          gold: '#f28413',      // 五行金
          wood: '#167318',      // 五行木
          water: '#4499ff',     // 五行水
          fire: '#bf403a',      // 五行火
          earth: '#87561e',     // 五行土
        }
      }
    }
  }
};
```

**理由**：
- 集中管理所有颜色
- 便于实现主题切换
- 提供语义化的颜色名称
- 支持 Tailwind 的所有颜色工具类

**替代方案**：
- 使用 CSS 变量（`--color-primary`）
- **不选择原因**：与 Tailwind 整合不如直接配置方便

## Open Questions

1. **是否需要引入 Zod 进行运行时类型验证？**
   - 当前决策：暂不引入，先使用 TypeScript 静态类型
   - 后续可根据需要评估

2. **是否需要迁移到 React Server Components？**
   - 当前决策：保持现有架构，专注代码质量改进
   - Next.js 15 已支持，可作为后续优化项

3. **是否需要添加单元测试？**
   - 当前决策：本次重构不包含测试
   - 建议作为独立任务后续添加

4. **如何处理奇门遁甲核心库的类型定义？**
   - 当前决策：逐步添加类型，复杂算法部分先使用明确的接口定义
   - 完整类型化可能需要深入理解算法逻辑

5. **是否需要保留暗色/亮色主题切换？**
   - 当前决策：优先实现单一主题（暗色），预留主题切换能力
   - Tailwind 的 dark 模式可以轻松实现

6. **复杂动画是否继续使用 CSS 还是迁移到 Framer Motion？**
   - 当前决策：保持简单动画使用 Tailwind，复杂动画保留 CSS
   - 不引入新的动画库，避免增加包体积

