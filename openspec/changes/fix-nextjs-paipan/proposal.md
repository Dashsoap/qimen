# 修复 Next.js 排盘数据字段不匹配问题

## Why

Next.js 项目中的排盘功能存在严重的数据字段不匹配问题，导致排盘数据无法正确显示和使用：

1. **简繁体字段冲突**：Next.js 使用简体字 `马星.驿马`，但奇门遁甲核心库输出繁体字 `馬星.驛馬`，导致数据读取失败
2. **数据结构丢失**：Next.js 在 `paipan()` 函数中重新格式化数据时，丢失了核心库原有的完整字段（如 `馬星`、`地支`、`長生運` 等）
3. **与 Vue 项目不一致**：Vue 项目（已验证可正常工作）直接使用核心库输出的原始数据结构，而 Next.js 进行了错误的转换

这导致：
- 宫位信息无法正确显示
- AI 分析缺少关键数据（马星、地支等）
- 用户体验受到严重影响

## What Changes

### 1. 修复字段名称一致性
- 统一使用繁体字段名（与核心库保持一致）：
  - `馬星` 而非 `马星`
  - `驛馬` 而非 `驿马`
  - 其他所有中文字段保持繁体

### 2. 重构排盘数据处理逻辑
- **保留原始数据结构**：直接使用 `qimen.p`，不进行额外转换
- **参考 Vue 实现**：采用与 Vue 项目相同的数据处理方式
- **最小化数据转换**：只在必要时格式化显示用数据

### 3. 修复宫位数据结构
- 调整 `gongs` 数组结构，使其与原始数据和组件需求一致
- 确保所有宫位字段完整可用（八门、九星、八神、天盘、地盘、暗干、馬星、地支、旬空）

### 4. 更新类型定义
- 修正 TypeScript 类型定义，反映真实的繁体字段名
- 添加完整的奇门遁甲数据类型（包括 `馬星`、`地支`、`長生運` 等）

### 5. 同步更新相关组件
- `QimenItem.tsx`：更新字段引用为繁体字
- `MeaningModal.tsx`：确保数据读取正确
- Redux Store：调整数据存储结构

## Impact

### 受影响的文件
- ✅ `apps/frontend-nextjs/src/app/(main)/qimen/page.tsx` - 修复 paipan() 函数
- ✅ `apps/frontend-nextjs/src/components/QimenItem.tsx` - 更新字段引用
- ✅ `apps/frontend-nextjs/src/types/qimen.ts` - 修正类型定义
- ✅ `apps/frontend-nextjs/src/lib/store/qimenSlice.ts` - 调整状态结构
- ⚠️  `apps/frontend-nextjs/src/lib/utils/paipanDataOptimizer.js` - 更新优化逻辑

### 受影响的功能
- **排盘显示**：修复后将正确显示所有宫位信息
- **AI 分析**：修复后 AI 将获得完整的排盘数据
- **数据一致性**：与 Vue 项目保持一致，便于维护

### Breaking Changes
⚠️ **BREAKING**: 
- Redux store 中的数据结构将发生变化（字段名从简体改为繁体）
- 已有的前端组件可能需要适配新的字段名
- 建议清除用户本地存储的旧数据

### 风险评估
- **低风险**：核心库本身没有问题，只是数据读取方式错误
- **测试需求**：需要全面测试排盘功能和 AI 分析功能
- **回滚方案**：可以快速恢复到当前版本（虽然当前版本有问题）

## Validation

修复后需要验证：
1. ✅ 排盘数据中所有字段均可正确读取（包括 `馬星.驛馬`）
2. ✅ 九宫格显示完整且正确
3. ✅ AI 分析能够获取完整的排盘数据
4. ✅ 与 Vue 项目的排盘结果完全一致
5. ✅ TypeScript 类型检查通过，无 `any` 类型滥用

## References

- Vue 项目正确实现：`apps/frontend-vue/src/views/QimenView.vue` (line 253-256)
- Vue Store 实现：`apps/frontend-vue/src/stores/index.js` (line 11-31)
- 奇门遁甲核心库：`apps/frontend-nextjs/src/lib/qimendunjia/index.js` (line 10-47)




