# 修复 Next.js 排盘数据字段不匹配 - 技术设计

## Context

奇门遁甲排盘是整个应用的核心功能，排盘数据的准确性直接影响 AI 分析的质量。当前 Next.js 项目存在以下技术债：

1. **历史原因**：Next.js 项目从 Vue 项目迁移时，错误地将繁体字段简化为简体字
2. **核心库约束**：奇门遁甲核心库 (`qimendunjia/index.js`) 使用繁体中文输出，这是传统易学的标准
3. **数据流断裂**：核心库输出 → Redux Store → 组件显示的数据流中，字段名称不匹配导致数据丢失

### 为什么 Vue 项目没问题？

Vue 项目的实现（`stores/index.js`）直接使用核心库输出的原始数据结构：

```javascript
function setPanData(data) {
  panData.value = data;  // 直接保存，不转换
}

function getGongViewData(bagua) {
  return computed(() => {
    if (panData.value['門']) {
      return {
        八门: panData.value['門'][bagua],
        馬星: panData.value['馬星']['驛馬'],  // 使用繁体字
        // ...
      }
    }
  })
}
```

### Next.js 的错误实现

Next.js 在 `page.tsx` 中进行了错误的数据转换：

```typescript
const gongData = {
  马星: (data as any).马星?.驿马 || ''  // ❌ 简体字，无法匹配
};
```

## Goals / Non-Goals

### Goals
✅ 修复字段名称不匹配问题，使用繁体字（与核心库一致）
✅ 保留完整的排盘数据结构，不丢失任何字段
✅ 与 Vue 项目保持数据结构一致
✅ 提供强类型定义，避免 `any` 类型滥用
✅ 确保 AI 分析能获取完整数据

### Non-Goals
❌ 不修改奇门遁甲核心库本身（核心库是正确的）
❌ 不创建字段名称转换层（简体⇔繁体），直接使用繁体
❌ 不改变核心库的输出格式
❌ 不支持简繁体混用（统一使用繁体）

## Decisions

### 决策 1：直接使用核心库输出，最小化转换

**选择**：在 `paipan()` 函数中直接使用 `qimen.p`，不进行额外的数据转换。

**理由**：
- Vue 项目的成功实践证明这是正确的方式
- 减少数据转换可以避免字段丢失
- 保持与核心库输出的强一致性

**替代方案考虑**：
1. ❌ **创建字段映射层**（简体→繁体）
   - 缺点：增加维护成本，容易遗漏字段
   - 缺点：性能开销，代码复杂度增加
   
2. ❌ **修改核心库使用简体字**
   - 缺点：破坏传统易学规范
   - 缺点：与 Vue 项目不一致
   - 缺点：核心库是第三方或共享代码

**实现方式**：

```typescript
// ✅ 推荐：直接使用原始数据
const paipan = () => {
  const now = dayjs();
  const qimen = new Qimen(now.year(), now.month() + 1, now.date(), now.hour());
  dispatch(setPanData(qimen.p));  // 直接保存原始数据
};
```

### 决策 2：统一使用繁体字段名

**选择**：所有 TypeScript 类型定义和组件访问都使用繁体字段名。

**理由**：
- 与核心库保持一致
- 避免简繁体混用带来的混乱
- 传统易学术语应使用繁体字

**实现指南**：

```typescript
// ✅ 正确的类型定义
export interface QimenPanData {
  干支: string;
  馬星: {
    天馬: string;
    丁馬: string;
    驛馬: string;
  };
  // ...
}

// ✅ 正确的组件访问
const maStar = panData.馬星?.驛馬;

// ❌ 错误的方式（不要使用）
const maStar = (panData as any).马星?.驿马;
```

### 决策 3：宫位数据按需计算

**选择**：不在 `paipan()` 中预先创建 `gongs` 数组，而是通过辅助函数按需获取宫位数据。

**理由**：
- 减少冗余数据存储
- 与 Vue 实现一致
- 便于维护和类型检查

**实现方式**：

```typescript
// 辅助函数：根据八卦名获取宫位数据
export function getGongViewData(panData: QimenPanData, bagua: string): GongViewData {
  if (!panData || !panData.門) return {};
  
  return {
    八门: panData.門[bagua],
    八神: panData.神[bagua],
    九星: panData.星[bagua],
    天盘: panData.天盤[0][bagua],
    天盘1: panData.天盤[1][bagua],
    地盘: panData.地盤[bagua],
    暗干: panData.暗干[bagua],
    馬星: panData.馬星.驛馬,
    地支: panData.地支[bagua],
    旬空: panData.旬空.時空,
  };
}
```

### 决策 4：严格的 TypeScript 类型定义

**选择**：为所有排盘数据创建完整的 TypeScript 类型，避免 `any` 类型。

**理由**：
- 在编译时捕获字段名称错误
- 提供更好的 IDE 智能提示
- 提高代码可维护性

**类型结构**：

```typescript
// 马星类型
export interface MaXingData {
  天馬: string;
  丁馬: string;
  驛馬: string;
}

// 旬空类型
export interface XunkongData {
  日空: string;
  時空: string;
}

// 值符值使类型
export interface ZhifuZhishiData {
  值符星宮: any[];
  值使門宮: any[];
}

// 完整的奇门遁甲盘数据
export interface QimenPanData {
  干支: string;
  干支1: {
    年: string;
    月: string;
    日: string;
    時: string;
  };
  旬首: any;
  旬空: XunkongData;
  局日: any;
  排局: string;
  節氣: any;
  值符值使: ZhifuZhishiData;
  天乙: any;
  天盤: any[];
  地盤: Record<string, string>;
  門: Record<string, string>;
  星: Record<string, string>;
  神: Record<string, string>;
  暗干: Record<string, string>;
  馬星: MaXingData;  // ✅ 使用繁体
  長生運: any;
  地支: Record<string, string>;
}
```

## Risks / Trade-offs

### 风险 1：Breaking Changes

**风险**：修改字段名称会破坏现有代码。

**缓解措施**：
1. 全面搜索所有使用 `马星`、`驿马` 的地方，统一修改
2. 运行 TypeScript 类型检查，确保所有引用都已更新
3. 建议用户清除本地存储的旧数据

### 风险 2：与后端 API 的兼容性

**风险**：后端 API 可能期望简体字段。

**评估**：
- 检查后端 API 代码，确认字段使用情况
- 如果后端使用简体，需要在 API 边界进行转换

**缓解措施**：
- 在 API 客户端层添加字段名称适配（如果需要）
- 优先考虑统一后端也使用繁体字

### Trade-off：繁体字 vs 简体字

**选择繁体字的原因**：
1. 核心库使用繁体（无法轻易修改）
2. 传统易学术语应保持原貌
3. Vue 项目使用繁体，保持一致性

**代价**：
1. 代码中需要输入繁体字（可使用输入法或复制粘贴）
2. 对不熟悉繁体字的开发者可能有学习成本

**接受理由**：技术正确性优先于便利性，且现代 IDE 提供良好的智能提示。

## Migration Plan

### 阶段 1：类型定义 (30 分钟)
1. 创建完整的 `QimenPanData` 接口
2. 添加所有子类型（`MaXingData`、`XunkongData` 等）
3. 验证类型定义的完整性

### 阶段 2：核心逻辑修复 (1 小时)
1. 重写 `paipan()` 函数
2. 创建 `getGongViewData()` 辅助函数
3. 更新 Redux slice

### 阶段 3：组件更新 (1-2 小时)
1. 逐个更新组件的字段引用
2. 运行类型检查，修复所有类型错误
3. 移除所有 `any` 类型断言

### 阶段 4：测试验证 (1-2 小时)
1. 对比 Vue 和 Next.js 的排盘输出
2. 测试所有功能路径
3. 性能测试（确保无性能下降）

### 回滚计划

如果修复出现问题：
1. 恢复 Git 提交到修复前状态
2. 保留类型定义的改进
3. 重新评估修复方案

## Open Questions

1. ❓ **后端 API 是否也使用繁体字段？**
   - 需要检查：`/api/qimen/paipan` 等端点
   - 如果不一致，需要在 API 边界添加转换

2. ❓ **是否有其他项目（如 qimen-taro）也有此问题？**
   - 需要检查 `qimen-taro` 目录
   - 如果有，应一并修复

3. ❓ **是否需要支持历史数据迁移？**
   - 如果用户有保存的排盘数据（简体字段），需要迁移逻辑
   - 建议：直接清除，重新排盘（数据量小）

4. ❓ **是否需要添加数据版本控制？**
   - 考虑在数据中添加 `version` 字段
   - 便于未来的数据结构升级

## References

- [Vue 项目排盘实现](../../apps/frontend-vue/src/views/QimenView.vue#L253-L256)
- [Vue Store 实现](../../apps/frontend-vue/src/stores/index.js#L11-L31)
- [奇门遁甲核心库](../../apps/frontend-nextjs/src/lib/qimendunjia/index.js#L10-L47)
- [Next.js 当前实现](../../apps/frontend-nextjs/src/app/(main)/qimen/page.tsx#L20-L65)

## Decision Log

| 日期 | 决策 | 理由 |
|------|------|------|
| 2025-11-05 | 使用繁体字段名 | 与核心库和 Vue 项目保持一致 |
| 2025-11-05 | 直接使用 `qimen.p` | 减少数据转换，避免字段丢失 |
| 2025-11-05 | 按需计算宫位数据 | 与 Vue 实现一致，减少冗余 |
| 2025-11-05 | 严格类型定义 | 提高代码质量，避免运行时错误 |




