<template>
  <div class="qimen-container">
    <div class="cosmic-header">
      <div class="title-wrapper">
        <h2 class="dao-title">奇门遁甲</h2>
        <div class="dao-subtitle">玄机推演，运势如神</div>
      </div>
    </div>

    <div class="input-section">
      <div class="question-input">
        <input
          v-model="question"
          type="text"
          class="question-input-field"
          placeholder="请输入占卜问题"
          ref="questionInput"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        />
        <button class="analyze-btn" @click="analyze" :disabled="loading">
          {{ loading ? '启动中...' : '🔮 AI流式分析' }}
        </button>
      </div>
      
      <!-- 功能按钮 -->
      <div class="function-buttons">
        <router-link to="/history" class="function-btn history-btn" title="查看历史记录">
          <span class="btn-icon">📜</span>
          <span class="btn-text">历史记录</span>
        </router-link>
        <router-link to="/favorites" class="function-btn favorites-btn" title="查看收藏夹">
          <span class="btn-icon">⭐</span>
          <span class="btn-text">我的收藏</span>
        </router-link>
      </div>
      
      <!-- 流式AI分析组件 -->
      <StreamAnalysis 
        :panData="panData" 
        :questionValue="question"
        @analysisComplete="handleStreamAnalysisComplete"
        ref="streamAnalysis"
      />
    </div>

    <!-- 分析结果 -->
    <div class="result-display" v-if="result">
      <div class="result-header">
        <h3>分析结果</h3>
      </div>
      <div class="result-content">
        {{ result }}
      </div>
    </div>

    <div class="result-section" v-if="panData">
      <div class="question-display" v-if="question">
        <div class="question-title">问题：</div>
        <div class="question-content">{{ question }}</div>
      </div>
      <div class="data-compact">
        <div class="data-row">
          <span class="data-pair">
            <span class="data-label">干支：</span>
            <span class="data-value">{{ panData.干支 }}</span>
          </span>
          <span class="data-pair">
            <span class="data-label">節氣：</span>
            <span class="data-value">{{ panData.節氣 }}</span>
          </span>
          <span class="data-pair">
            <span class="data-label">排局：</span>
            <span class="data-value">{{ panData.排局 }}</span>
          </span>
        </div>
        <div class="data-row" v-if="panData.旬空">
          <span class="data-pair" v-for="(item, key) in panData.旬空" :key="`xunkong-${key}`">
            <span class="data-label">{{ key }}：</span>
            <span class="data-value">{{ item }}</span>
          </span>
        </div>
        <div class="data-row" v-if="panData.值符值使">
          <span class="data-pair" v-for="(item, key) in panData.值符值使" :key="`zhifu-${key}`">
            <span class="data-label">{{ key }}：</span>
            <span class="data-value">{{ item }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="bagua-wrapper">
      <div class="bagua-background"></div>
      <table class="qimen-table">
        <tr class="row">
          <td class="col palace" data-name="坎宫" @click="showPalaceInfo('坎宫')">
            <QimenItem index="四" />
          </td>
          <td class="col palace" data-name="艮宫" @click="showPalaceInfo('艮宫')">
            <QimenItem index="九" />
          </td>
          <td class="col palace" data-name="震宫" @click="showPalaceInfo('震宫')">
            <QimenItem index="二" />
          </td>
        </tr>
        <tr class="row">
          <td class="col palace" data-name="坤宫" @click="showPalaceInfo('坤宫')">
            <QimenItem index="三" />
          </td>
          <td class="col palace center" data-name="中宫" @click="showPalaceInfo('中宫')">
            <QimenItem index="五" />
          </td>
          <td class="col palace" data-name="巽宫" @click="showPalaceInfo('巽宫')">
            <QimenItem index="七" />
          </td>
        </tr>
        <tr class="row">
          <td class="col palace" data-name="兑宫" @click="showPalaceInfo('兑宫')">
            <QimenItem index="八" />
          </td>
          <td class="col palace" data-name="乾宫" @click="showPalaceInfo('乾宫')">
            <QimenItem index="一" />
          </td>
          <td class="col palace" data-name="离宫" @click="showPalaceInfo('离宫')">
            <QimenItem index="六" />
          </td>
        </tr>
      </table>
    </div>

    <div class="light-orb"></div>
    <div class="light-orb"></div>
    <div class="light-orb"></div>

    <!-- 添加一个底部空间 -->
    <div class="bottom-spacer"></div>

    <!-- Add a meaning popup/modal -->
    <div class="meaning-modal" v-if="infoStore.showMeaning" @click.self="infoStore.hideMeaning()">
      <div class="meaning-content">
        <div class="meaning-header">
          <h3>{{ infoStore.displayName }}解释</h3>
          <span class="close-btn" @click="infoStore.hideMeaning()">×</span>
        </div>
        <div class="meaning-body">
          <!-- 根据内容类型使用不同的渲染方式 -->
          <p v-if="!infoStore.isHtmlContent">{{ infoStore.currentMeaning }}</p>
          <div v-else v-html="infoStore.currentMeaning"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import Qimen from '../qimendunjia/index.js'
import QimenItem from '../components/QimenItem.vue'
import StreamAnalysis from '../components/StreamAnalysis.vue'
import { useQimenStore } from "../stores/index"
import { useQimenInfoStore } from "../stores/qimenInfoStore"
import { storeToRefs } from 'pinia'

const store = useQimenStore()
const infoStore = useQimenInfoStore()
const { panData } = storeToRefs(store)

// 简单的响应式变量
const question = ref('')
const loading = ref(false)
const result = ref('')
const questionInput = ref(null)
const isComposing = ref(false)
const streamAnalysis = ref(null)

// 排盘函数
function paipan() {
  const now = dayjs()
  store.setPanData(new Qimen(now.year(), now.month() + 1, now.date(), now.hour()).p)
}

// 移动端输入法优化的分析函数
async function analyze() {
  // 1. 强制输入框失去焦点，确保输入法完成输入
  if (questionInput.value) {
    questionInput.value.blur()
  }
  
  // 2. 等待输入法完成（特别是中文输入法）
  if (isComposing.value) {
    console.log('输入法正在组合中，等待完成...')
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  // 3. 等待Vue响应式更新
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 4. 多重验证获取问题内容
  let questionText = question.value?.trim() || ''
  
  // 如果Vue的值为空，直接从DOM获取
  if (!questionText && questionInput.value) {
    questionText = questionInput.value.value?.trim() || ''
    // 同步到Vue
    question.value = questionText
  }
  
  console.log('问题内容验证:', {
    'question.value': question.value,
    'DOM value': questionInput.value?.value,
    'isComposing': isComposing.value,
    'final text': questionText
  })
  
  if (!questionText) {
    alert('请输入占卜问题\n\n调试信息：\n' + 
          `Vue值: "${question.value}"\n` + 
          `DOM值: "${questionInput.value?.value || ''}"\n` +
          `组合状态: ${isComposing.value}`)
    return
  }

  loading.value = true
  result.value = '正在分析中...'

  try {
    // 先排盘
    if (!panData.value) {
      paipan()
    }
    
    // 调用真正的StreamAnalysis组件
    console.log('🚀 启动流式AI分析...')
    
    if (streamAnalysis.value && streamAnalysis.value.startStreamAnalysis) {
      await streamAnalysis.value.startStreamAnalysis()
      console.log('✅ 流式分析已启动')
    } else {
      console.error('❌ StreamAnalysis组件未找到或方法不存在')
      throw new Error('流式分析组件加载失败')
    }
    
  } catch (error) {
    console.error('💥 启动流式分析失败:', error)
    result.value = `启动分析失败: ${error.message}\n\n请刷新页面重试。`
  } finally {
    loading.value = false
  }
}

// 处理流式分析完成事件
function handleStreamAnalysisComplete(analysisResult) {
  console.log('🎉 流式分析完成:', analysisResult)
  
  if (analysisResult && analysisResult.answer) {
    result.value = analysisResult.answer
    console.log('📊 分析统计:')
    console.log('- 分析时长:', Math.round((analysisResult.executionTime || 0) / 1000), '秒')
    console.log('- 内容长度:', analysisResult.answer?.length || 0, '字符')
    console.log('- 置信度:', Math.round((analysisResult.confidence || 0.92) * 100), '%')
  }
}

// 初始化
onMounted(() => {
  paipan()
})

// 显示宫位信息
function showPalaceInfo(palaceName) {
  const bagua = palaceName.replace('宫', '')
  const gongData = store.getGongViewData(bagua)
  
  let info = `${palaceName}信息：\n`
  if (gongData.八神) info += `八神：${gongData.八神}\n`
  if (gongData.九星) info += `九星：${gongData.九星}\n`
  if (gongData.八门) info += `八门：${gongData.八门}\n`
  
  infoStore.showPalaceInfo(palaceName, info)
}

</script>

<style scoped>
/* 简化样式 */
.qimen-container {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #d4af37;
  background: #000;
  padding: 20px;
  min-height: 100vh;
  -webkit-tap-highlight-color: transparent;
}

/* 输入区域样式 */
.input-section {
  margin-bottom: 30px;
}

.question-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.question-input-field {
  flex: 1;
  padding: 12px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #111;
  color: #d4af37;
  font-size: 16px;
}

.question-input-field::placeholder {
  color: #666;
}

.analyze-btn {
  padding: 14px 24px;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%);
  color: #000;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(212, 175, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.analyze-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.analyze-btn:hover:not(:disabled)::before {
  left: 100%;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(212, 175, 55, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: rgba(212, 175, 55, 0.6);
}

.analyze-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 
    0 2px 10px rgba(212, 175, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.analyze-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #666;
  border-color: #444;
  box-shadow: none;
}

/* 功能按钮样式 */
.function-buttons {
  display: flex;
  gap: 15px;
  margin: 15px 0;
  justify-content: center;
  flex-wrap: wrap;
}

.function-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 20px;
  color: #d4af37;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.function-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
  transition: left 0.5s ease;
}

.function-btn:hover::before {
  left: 100%;
}

.function-btn:hover {
  transform: translateY(-3px);
  border-color: #d4af37;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.08));
  color: #f4d03f;
}

.function-btn .btn-icon {
  font-size: 16px;
  position: relative;
  z-index: 1;
}

.function-btn .btn-text {
  position: relative;
  z-index: 1;
}

.history-btn:hover .btn-icon {
  animation: bookFlip 0.6s ease-in-out;
}

.favorites-btn:hover .btn-icon {
  animation: starGlow 0.6s ease-in-out;
}

@keyframes bookFlip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}

@keyframes starGlow {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(15deg); }
}

/* 结果显示样式 */
.result-display {
  margin: 20px 0;
  padding: 20px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 8px;
  border: 1px solid #333;
}

.result-header h3 {
  margin: 0 0 15px 0;
  color: #d4af37;
}

.result-content {
  color: #fff;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .qimen-container {
    padding: 10px;
  }
  
  .question-input {
    flex-direction: column;
    gap: 10px;
  }
  
  .question-input-field {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .analyze-btn {
    width: 100%;
    padding: 15px;
  }
}

/* Premium header styling */
.cosmic-header {
  text-align: center;
  margin-bottom: 15px;
  position: relative;
  padding: 15px 0;
  animation: fadeInUp 1s ease-out forwards;
}

.cosmic-header::before,
.cosmic-header::after {
  content: "";
  position: absolute;
  height: 2px; /* Thicker lines */
  width: 70%;
  left: 15%;
}

.cosmic-header::before {
  top: 0;
  background: linear-gradient(to right, transparent, #85754e 20%, #d4af37 50%, #85754e 80%, transparent);
}

.cosmic-header::after {
  bottom: 0;
  background: linear-gradient(to right, transparent, #85754e 20%, #d4af37 50%, #85754e 80%, transparent);
}

.dao-title {
  font-size: 32px;
  font-weight: normal;
  letter-spacing: 12px; /* Increased spacing */
  color: #d4af37;
  margin: 0;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
  position: relative;
  display: inline-block;
  animation: titleGlow 3s infinite alternate ease-in-out;
}

.dao-subtitle {
  font-size: 15px;
  margin-top: 12px;
  color: #a38a36; /* Softer gold */
  letter-spacing: 4px;
  font-style: italic;
}

/* 超紧凑输入区域 */
.input-section-compact {
  margin-bottom: 12px;
  padding: 8px;
  background-color: rgba(10, 10, 10, 0.8);
  border: 1px solid #85754e;
  border-radius: 2px;
  animation: fadeInUp 1s ease-out forwards;
  animation-delay: 0.2s;
}

.question-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}



.dao-picker {
  border: 1px solid #85754e !important;
  border-radius: 2px;
  background-color: rgba(10, 10, 10, 0.9) !important;
  color: #d4af37 !important;
  padding: 12px 15px;
  margin: 5px 0;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.dao-picker:active {
  border-color: rgba(243, 215, 126, 0.7) !important;
  box-shadow: 0 0 12px rgba(243, 215, 126, 0.4);
}

.dao-picker input {
  color: #f6e27a !important;
  font-family: "FangSong", "STKaiti", serif !important;
}

.dao-dropdown {
  font-family: "FangSong", "STKaiti", serif !important;
  border: 1px solid rgba(243, 215, 126, 0.5) !important;
  background-color: rgba(15, 15, 15, 0.95) !important;
}

/* More dynamic and animated button */
.dao-button {
  align-self: center;
  min-width: 150px;
  padding: 14px 30px;
  margin-top: 10px;
  background: linear-gradient(45deg, #85754e 0%, #d4af37 50%, #85754e 100%);
  background-size: 200% 200%;
  color: #000;
  border: none;
  font-size: 18px;
  border-radius: 2px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  font-family: "FangSong", "STKaiti", serif;
  letter-spacing: 5px;
  font-weight: bold;
  animation: buttonGradient 8s ease infinite;
}

@keyframes buttonGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.dao-button:active {
  transform: scale(0.96);
  box-shadow: 0 0 10px rgba(243, 215, 126, 0.7);
  background-position: 100% 50%;
}

.dao-button::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.dao-button.tapped::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0) translate(-50%, -50%);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20) translate(-50%, -50%);
    opacity: 0;
  }
}

.dao-button-text {
  position: relative;
  z-index: 1;
}

/* Elegant results section */
.result-section {
  margin: 15px 0;
  padding: 15px;
  background-color: rgba(8, 8, 8, 0.9);
  border: 1px solid #85754e;
  position: relative;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
}

.question-display {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid rgba(133, 117, 78, 0.3);
  background-color: rgba(10, 10, 10, 0.5);
  border-radius: 2px;
}

/* 紧凑的数据展示布局 */
.data-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 8px 12px;
  border: 1px solid rgba(133, 117, 78, 0.3);
  background-color: rgba(10, 10, 10, 0.5);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.data-row:hover {
  border-color: #d4af37;
  background-color: rgba(15, 15, 15, 0.7);
}

.data-pair {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: fit-content;
}

.data-label {
  color: #85754e;
  font-weight: bold;
  letter-spacing: 1px;
  font-size: 14px;
}

.data-value {
  color: #d4af37;
  letter-spacing: 1px;
  font-size: 14px;
  font-weight: 500;
}

.question-title {
  color: #85754e;
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.question-content {
  color: #d4af37;
  font-size: 16px;
  line-height: 1.5;
}

/* Flat Qimen Dunjia chart (no 3D) with premium border */
.bagua-wrapper {
  position: relative;
  margin: 20px auto;
  width: 100%;
  animation: fadeInUp 1s ease-out forwards;
  animation-delay: 0.6s;
  background: rgba(0,0,0,0.5);
  border-radius: 4px;
}

.bagua-background {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="%23f6e27a" stroke-width="0.5" opacity="0.1"/><circle cx="50" cy="50" r="40" fill="none" stroke="%23f6e27a" stroke-width="0.5" opacity="0.1"/><circle cx="50" cy="50" r="32" fill="none" stroke="%23f6e27a" stroke-width="0.5" opacity="0.1"/></svg>');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.2;
  z-index: 0;
  pointer-events: none;
}

/* Luxurious double-border frame */
.bagua-wrapper::before {
  content: "";
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 1px solid #85754e;
  pointer-events: none;
  z-index: 0;
}

/* Inner gold border */
.bagua-wrapper::after {
  content: "";
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 1px solid #d4af37;
  pointer-events: none;
  z-index: 0;
}

/* Refined table with premium styling */
.qimen-table {
  padding: 8px;
  border-collapse: separate;
  border-spacing: 2px; /* Add subtle spacing between cells */
  width: 100%;
  position: relative;
  z-index: 1;
  background-color: transparent;
  table-layout: fixed;
  border: none;
  overflow: hidden;
  transition: all 0.2s ease;
  transform: none !important;
  aspect-ratio: 1; /* 保持正方形比例 */
}

/* Elegant cells */
.col {
  width: 33.33%;
  height: 100px;
  border: 1px solid #85754e !important; /* Softer gold border */
  position: relative;
  background-color: rgba(10, 10, 10, 0.9);
  vertical-align: top;
  padding: 20px 6px 6px 6px;
  transition: all 0.2s ease-out;
  transform: none !important;
  -webkit-tap-highlight-color: transparent;
}

.col::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border: 1px solid rgba(133, 117, 78, 0.3); /* Inner subtle border */
  pointer-events: none;
}

.col.tapped {
  background-color: rgba(30, 25, 15, 0.8) !important;
  border-color: #d4af37 !important;
  box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.2);
}

/* Center cell special styling */
.center {
  background-color: rgba(15, 12, 5, 0.9);
  border-color: #d4af37 !important;
}

/* Refined palace names */
.palace::before {
  content: attr(data-name);
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  color: #d4af37;
  opacity: 1;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Enhanced color scheme for elements */
:deep(.tian-gan) { color: #66bbff; /* Bright Blue */ }
:deep(.di-zhi) { color: #2dd12d; /* Green */ }
:deep(.shen-sha) { color: #ff3333; /* Red */ }
:deep(.gong-name) { color: #d4af37; /* Rich Gold */ font-weight: bold; }
:deep(.star) { color: #ff8c00; /* Orange */ }
:deep(.men) { color: #cc66ff; /* Purple */ }

/* More sophisticated title glow */
@keyframes titleGlow {
  0% { text-shadow: 0 0 5px rgba(212, 175, 55, 0.2); }
  100% { text-shadow: 0 0 15px rgba(212, 175, 55, 0.5), 0 0 30px rgba(212, 175, 55, 0.2); }
}

/* Add elegant corner embellishments to each cell */
.col::before {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  border-top: 1px solid #d4af37;
  border-left: 1px solid #d4af37;
  top: 5px;
  left: 5px;
  opacity: 0.7;
}

.col::after {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  border-bottom: 1px solid #d4af37;
  border-right: 1px solid #d4af37;
  bottom: 5px;
  right: 5px;
  opacity: 0.7;
}

/* 底部空间样式 */
.bottom-spacer {
  height: 20px;
  width: 100%;
}

/* Add a subtle circle animation to show tap point */
@keyframes circleTap {
  0% {
    box-shadow: 0 0 0 0 rgba(243, 215, 126, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(243, 215, 126, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(243, 215, 126, 0);
  }
}

/* Focus state for question input */
.dao-input:focus {
  border-color: #fcdd6d !important;
  box-shadow: 0 0 15px rgba(243, 215, 126, 0.3);
  outline: none;
}

/* Luxury gold button */
.dao-button {
  background: linear-gradient(45deg, #85754e, #d4af37, #85754e);
  background-size: 200% 200%;
  color: #000;
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 2px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  font-family: "FangSong", "STKaiti", serif;
  letter-spacing: 3px;
  font-weight: bold;
  animation: buttonGradient 8s ease infinite;
  -webkit-tap-highlight-color: transparent;
}

/* Elegant input fields */
.dao-picker {
  border: 1px solid #85754e !important;
  border-radius: 2px;
  background-color: rgba(10, 10, 10, 0.9) !important;
  color: #d4af37 !important;
  padding: 12px 15px;
  margin: 5px 0;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.dao-input-compact {
  border: 1px solid #85754e !important;
  border-radius: 2px;
  background-color: rgba(10, 10, 10, 0.9) !important;
  color: #d4af37 !important;
  padding: 8px 12px;
  flex: 1;
  font-family: "FangSong", "STKaiti", serif;
  font-size: 14px;
  height: 36px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
}

.dao-input-compact:focus {
  border-color: #fcdd6d !important;
  box-shadow: 0 0 8px rgba(243, 215, 126, 0.3);
  outline: none;
}




/* 添加光晕效果 */
.light-orb {
  position: fixed;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
  transition: transform 0.8s ease-out;
}

.light-orb:nth-child(1) {
  top: 10%;
  left: 10%;
}

.light-orb:nth-child(2) {
  top: 50%;
  right: 10%;
}

.light-orb:nth-child(3) {
  bottom: 10%;
  left: 30%;
}

/* 添加优雅的淡入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add styles for the meaning modal */
.meaning-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.meaning-content {
  background-color: rgba(10, 10, 10, 0.95);
  border: 2px solid #d4af37;
  border-radius: 2px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
}

.meaning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #85754e;
}

.meaning-header h3 {
  margin: 0;
  color: #d4af37;
  font-size: 20px;
  letter-spacing: 4px;
}

.close-btn {
  color: #85754e;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #d4af37;
}

.meaning-body {
  padding: 20px;
  color: #d4af37;
  line-height: 1.7;
  font-size: 16px;
  text-align: justify;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 按钮样式调整 */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.ai-button {
  background: linear-gradient(45deg, #4a90e2, #357abd, #4a90e2);
  background-size: 200% 200%;
  animation: buttonGradient 8s ease infinite;
}

.dao-button:disabled {
  background: linear-gradient(45deg, #555, #666, #555);
  cursor: not-allowed;
  opacity: 0.7;
}

/* AI分析结果区域样式 - 紧凑版 */
.ai-result-section {
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 8px;
  padding: 12px;
  margin: 10px 0;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
  position: relative;
  animation: fadeInUp 0.5s ease-out;
}

.ai-header {
  text-align: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.ai-title {
  font-size: 16px;
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.ai-subtitle {
  font-size: 12px;
  color: rgba(212, 175, 55, 0.7);
  letter-spacing: 0.5px;
}

.analysis-answer {
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.answer-title {
  font-size: 14px;
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.answer-text {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  font-family: "FangSong", "STKaiti", serif;
  white-space: pre-line;
  max-height: 200px;
  overflow-y: auto;
}

.analysis-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  padding: 0.8rem;
  text-align: center;
  transition: all 0.3s ease;
}

.meta-item:hover {
  border-color: rgba(212, 175, 55, 0.4);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.meta-label {
  font-size: 0.9rem;
  color: rgba(212, 175, 55, 0.8);
  display: block;
  margin-bottom: 0.3rem;
}

.meta-value {
  font-size: 1rem;
  font-weight: 600;
  color: #d4af37;
  text-shadow: 0 0 5px rgba(212, 175, 55, 0.4);
}

.analysis-steps {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
}

.steps-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 1rem;
  text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
  letter-spacing: 1px;
}

.step-list {
  space-y: 0.8rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  margin-bottom: 0.8rem;
  transition: all 0.3s ease;
}

.step-item:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.2);
}

.step-number {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #d4af37, #ffd700);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.step-action {
  font-weight: 600;
  color: #d4af37;
  min-width: 100px;
  flex-shrink: 0;
  font-family: "FangSong", "STKaiti", serif;
}

.step-summary {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  flex: 1;
  font-family: "FangSong", "STKaiti", serif;
}

/* 紧凑按钮样式 */
.dao-button-compact {
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%);
  color: #000;
  border: none;
  border-radius: 2px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  font-family: "FangSong", "STKaiti", serif;
  height: 36px;
  min-width: 80px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 154, 86, 0.3);
  -webkit-tap-highlight-color: transparent;
}

.dao-button-compact:hover {
  background: linear-gradient(135deg, #ff8844 0%, #ff5959 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 154, 86, 0.4);
}

.dao-button-compact:active {
  transform: scale(0.98);
}

.dao-button-compact:disabled {
  background: linear-gradient(135deg, #666 0%, #555 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

</style>
