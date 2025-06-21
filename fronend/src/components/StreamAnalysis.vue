<template>
  <div class="stream-analysis-container">
    <!-- 流式分析按钮 -->
    <div class="stream-button-wrapper">
      <button 
        class="dao-button stream-button" 
        @click="startStreamAnalysis()" 
        :disabled="!panData || isStreaming"
      >
        <span class="dao-button-text">
          {{ isStreaming ? '🔄 AI实时分析中...' : '🚀 AI流式分析' }}
        </span>
      </button>
      
      <button 
        v-if="isStreaming" 
        class="dao-button stop-button" 
        @click="stopStreamAnalysis()"
      >
        <span class="dao-button-text">⏹️ 停止分析</span>
      </button>
      
      <!-- 🔧 调试按钮 -->
      <button 
        v-if="!isStreaming" 
        class="dao-button debug-button" 
        @click="testDisplay()"
        style="background: #38b2ac;"
      >
        <span class="dao-button-text">🧪 测试显示</span>
      </button>
    </div>

    <!-- 流式分析结果区域 -->
    <div class="stream-result-section" v-if="showStreamResult">
      <div class="stream-header">
        <div class="stream-title">🔮 AI流式分析 - 实时解读</div>
        <div class="stream-subtitle">基于奇门遁甲排盘数据 · 实时生成</div>
        <div class="stream-close" @click="closeStreamResult">×</div>
      </div>
      
      <!-- 问题显示 -->
      <div class="question-display" v-if="currentQuestion">
        <div class="question-title">问题：</div>
        <div class="question-content">{{ currentQuestion }}</div>
      </div>

      <!-- 状态步骤显示 -->
      <div class="stream-steps" v-if="streamSteps.length > 0">
        <div 
          v-for="(step, index) in streamSteps" 
          :key="index"
          class="stream-step"
          :class="{ 'active': index === streamSteps.length - 1 }"
        >
          <div class="step-icon">{{ step.icon }}</div>
          <div class="step-text">{{ step.message }}</div>
          <div class="step-time">{{ formatTime(step.timestamp) }}</div>
        </div>
      </div>

      <!-- 实时内容显示 -->
      <div class="stream-content" v-if="streamContent">
        <div class="content-header">
          <div class="content-title">💫 AI大师解读</div>
          <div class="content-progress" v-if="isStreaming">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="progress-text">正在生成中... {{ Math.round(progressPercent) }}%</div>
          </div>
        </div>
        
        <div class="content-text">
          <div class="typing-text" :class="{ 'typing': isStreaming }">
            {{ streamContent }}
          </div>
          <div class="cursor" v-if="isStreaming">|</div>
        </div>
      </div>

      <!-- 完成状态 -->
      <div class="stream-complete" v-if="analysisComplete">
        <div class="complete-header">
          <div class="complete-icon">✅</div>
          <div class="complete-text">分析完成</div>
        </div>
        <div class="complete-stats">
          <div class="stat-item">
            <div class="stat-label">用时</div>
            <div class="stat-value">{{ Math.round(analysisTime / 1000) }}秒</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">字数</div>
            <div class="stat-value">{{ streamContent?.length || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">置信度</div>
            <div class="stat-value">{{ Math.round(confidence * 100) }}%</div>
          </div>
        </div>
      </div>

      <!-- 错误显示 -->
      <div class="stream-error" v-if="streamError">
        <div class="error-header">
          <div class="error-icon">❌</div>
          <div class="error-text">分析出错</div>
        </div>
        <div class="error-message">{{ streamError }}</div>
        <button class="dao-button retry-button" @click="retryAnalysis()">
          <span class="dao-button-text">🔄 重试</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';
import { API_BASE_URL } from '../utils/api.js';

// Props
const props = defineProps<{
  panData: any;
  questionValue: string;
}>();

// Emits
const emit = defineEmits<{
  analysisComplete: [result: any];
}>();

// 响应式数据
const isStreaming = ref(false);
const showStreamResult = ref(false);
const streamSteps = ref<Array<{icon: string, message: string, timestamp: string}>>([]);
const streamContent = ref('');
const streamError = ref('');
const analysisComplete = ref(false);
const analysisTime = ref(0);
const confidence = ref(0.92);
const progressPercent = ref(0);
const currentQuestion = ref('');

// 流式连接相关
let eventSource: EventSource | null = null;
let startTime = 0;
let progressInterval: NodeJS.Timeout | null = null;

// 开始流式分析
async function startStreamAnalysis() {
  // 🔧 添加调试信息
  console.log('🔍 流式分析调试信息:');
  console.log('- props.questionValue:', props.questionValue);
  console.log('- props.panData:', props.panData);
  console.log('- questionValue type:', typeof props.questionValue);
  console.log('- questionValue length:', props.questionValue?.length);
  
  // 🔧 更健壮的问题验证机制
  let questionText = '';
  
  // 尝试多种方式获取问题内容
  if (props.questionValue) {
    if (typeof props.questionValue === 'string') {
      questionText = props.questionValue.trim();
    } else if (typeof props.questionValue === 'object' && 'value' in props.questionValue) {
      // 处理ref包装的情况
      questionText = (props.questionValue as any).value?.trim() || '';
    }
  }
  
  // 如果仍然为空，尝试从DOM元素获取
  if (!questionText) {
    const inputElement = document.querySelector('.dao-input') as HTMLInputElement;
    if (inputElement && inputElement.value) {
      questionText = inputElement.value.trim();
      console.log('🔧 从DOM元素获取问题:', questionText);
    }
  }
  
  console.log('🎯 最终使用的问题:', questionText);
  
  if (!questionText || questionText.length === 0) {
    alert('请先输入占卜问题\n调试信息: questionValue=' + JSON.stringify(props.questionValue));
    return;
  }

  if (!props.panData) {
    alert('请先进行排盘');
    return;
  }

  console.log('🚀 开始流式分析...', questionText);
  
  // 重置状态
  resetStreamState();
  
  // 显示结果区域
  showStreamResult.value = true;
  isStreaming.value = true;
  currentQuestion.value = questionText;
  startTime = Date.now();

  try {
    // 检测环境并选择合适的连接方式
    const isMobile = window.location.protocol === 'file:' || 
                     window.location.protocol === 'capacitor:' || 
                     /Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      // 移动端使用 fetch stream，传递 questionText
      await startFetchStream(questionText);
    } else {
      // Web端使用 EventSource，传递 questionText
      await startEventSourceStream(questionText);
    }

  } catch (error) {
    console.error('流式分析启动失败:', error);
    handleStreamError(error.message || '启动失败');
  }
}

// Web端 EventSource 流式连接
async function startEventSourceStream(questionText: string) {
  const url = `${API_BASE_URL}/api/analysis/qimen/stream`;
  
  // EventSource 不支持 POST，所以使用查询参数或其他方式
  // 这里我们改用 fetch stream 方式
  await startFetchStream(questionText);
}

// 通用 Fetch Stream 方式
async function startFetchStream(questionText: string) {
  const url = `${API_BASE_URL}/api/analysis/qimen/stream`;
  
  const requestData = {
    question: questionText,
    paipanData: props.panData
  };

  console.log('📡 发送流式请求:', requestData);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法获取响应流');
    }

    // 开始进度模拟
    startProgressSimulation();

    // 读取流数据
    while (isStreaming.value) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('✅ 流式响应完成');
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            handleStreamData(data);
          } catch (e) {
            console.warn('解析数据失败:', line, e);
          }
        }
      }
    }

  } catch (error) {
    console.error('Fetch Stream 错误:', error);
    handleStreamError(error.message || '网络连接失败');
  }
}

// 处理流式数据
function handleStreamData(data: any) {
  console.log('📨 收到流式数据:', data);
  console.log('🔍 当前组件状态:', {
    showStreamResult: showStreamResult.value,
    isStreaming: isStreaming.value,
    streamContent: streamContent.value?.length,
    streamSteps: streamSteps.value.length
  });

  switch (data.type) {
    case 'init':
      console.log('🔮 处理初始化消息');
      addStreamStep('🔮', data.message || '正在启动分析...', data.timestamp);
      break;
      
    case 'step':
      console.log('📍 处理步骤消息:', data.step, data.message);
      const stepIcons = ['📊', '🤖', '💫', '✨'];
      const icon = stepIcons[data.step - 1] || '📍';
      addStreamStep(icon, data.message, data.timestamp);
      break;
      
    case 'content':
      console.log('📝 处理内容消息，长度:', data.fullContent?.length || data.content?.length);
      const newContent = data.fullContent || data.content || '';
      streamContent.value = newContent;
      updateProgress(Math.min(90, (newContent.length / 20))); // 根据内容长度估算进度
      console.log('📝 内容已更新，当前长度:', streamContent.value?.length);
      break;
      
    case 'final':
      streamContent.value = data.analysis?.answer || streamContent.value;
      confidence.value = data.analysis?.confidence || 0.92;
      analysisTime.value = data.analysis?.executionTime || (Date.now() - startTime);
      completeAnalysis();
      break;
      
    case 'complete':
      addStreamStep('✅', data.message || '分析完成', data.timestamp);
      completeAnalysis();
      break;
      
    case 'error':
      handleStreamError(data.message || '分析过程中出现错误');
      break;
      
    case 'fallback':
      streamContent.value = data.analysis?.answer || '使用备用分析模式';
      addStreamStep('🔄', data.message || '使用备用模式', data.timestamp);
      completeAnalysis();
      break;
  }
}

// 添加步骤
function addStreamStep(icon: string, message: string, timestamp?: string) {
  const newStep = {
    icon,
    message,
    timestamp: timestamp || new Date().toISOString()
  };
  streamSteps.value.push(newStep);
  console.log('📋 步骤已添加:', newStep, '总步骤数:', streamSteps.value.length);
  
  // 强制触发响应式更新
  streamSteps.value = [...streamSteps.value];
}

// 更新进度
function updateProgress(percent: number) {
  progressPercent.value = Math.min(100, Math.max(0, percent));
}

// 开始进度模拟
function startProgressSimulation() {
  progressInterval = setInterval(() => {
    if (progressPercent.value < 85) {
      progressPercent.value += Math.random() * 5;
    }
  }, 1000);
}

// 完成分析
function completeAnalysis() {
  isStreaming.value = false;
  analysisComplete.value = true;
  updateProgress(100);
  
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }

  // 通知父组件分析完成
  emit('analysisComplete', {
    answer: streamContent.value,
    confidence: confidence.value,
    executionTime: analysisTime.value,
    steps: streamSteps.value
  });

  console.log('🎉 流式分析完成!');
}

// 处理错误
function handleStreamError(message: string) {
  console.error('❌ 流式分析错误:', message);
  streamError.value = message;
  isStreaming.value = false;
  
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// 停止分析
function stopStreamAnalysis() {
  console.log('⏹️ 停止流式分析');
  isStreaming.value = false;
  
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// 重试分析
function retryAnalysis() {
  resetStreamState();
  startStreamAnalysis();
}

// 关闭结果
function closeStreamResult() {
  showStreamResult.value = false;
  stopStreamAnalysis();
  resetStreamState();
}

// 重置状态
function resetStreamState() {
  streamSteps.value = [];
  streamContent.value = '';
  streamError.value = '';
  analysisComplete.value = false;
  analysisTime.value = 0;
  progressPercent.value = 0;
}

// 格式化时间
function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// 🔧 测试显示功能
function testDisplay() {
  console.log('🧪 测试显示功能');
  showStreamResult.value = true;
  currentQuestion.value = '测试问题：我想测试流式显示功能';
  
  // 添加测试步骤
  addStreamStep('🧪', '测试步骤1：初始化', new Date().toISOString());
  addStreamStep('📝', '测试步骤2：添加内容', new Date().toISOString());
  
  // 设置测试内容
  streamContent.value = '这是一个测试内容，用来验证流式显示是否正常工作。如果您能看到这段文字，说明组件显示功能正常。';
  
  console.log('🔍 测试后状态:', {
    showStreamResult: showStreamResult.value,
    currentQuestion: currentQuestion.value,
    streamContent: streamContent.value,
    streamSteps: streamSteps.value.length
  });
}

// 组件销毁时清理
onUnmounted(() => {
  stopStreamAnalysis();
});
</script>

<style scoped>
.stream-analysis-container {
  width: 100%;
}

.stream-button-wrapper {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.stream-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  position: relative;
  overflow: hidden;
}

.stream-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.stream-button:hover:before {
  left: 100%;
}

.stop-button {
  background: linear-gradient(45deg, #f56565, #e53e3e);
}

.stream-result-section {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.95) 100%);
  border: 2px solid rgba(212, 175, 55, 0.4);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 1rem;
  box-shadow: 
    0 0 30px rgba(212, 175, 55, 0.3),
    inset 0 0 20px rgba(212, 175, 55, 0.1);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
}

.stream-result-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(212, 175, 55, 0.3);
  padding-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.stream-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #d4af37;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.stream-subtitle {
  font-size: 1rem;
  color: rgba(212, 175, 55, 0.8);
  font-weight: 400;
  letter-spacing: 1px;
}

.stream-close {
  cursor: pointer;
  font-size: 1.5rem;
  color: rgba(212, 175, 55, 0.6);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  border: 1px solid rgba(212, 175, 55, 0.3);
  background: rgba(0, 0, 0, 0.3);
}

.stream-close:hover {
  background: rgba(220, 38, 38, 0.8);
  color: white;
  border-color: #dc2626;
}

.question-display {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.question-title {
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 1rem;
  text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
  letter-spacing: 1px;
}

.question-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  font-family: "FangSong", "STKaiti", serif;
}

.stream-steps {
  margin-bottom: 25px;
}

.stream-step {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.8rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  transition: all 0.3s;
}

.stream-step.active {
  background: rgba(212, 175, 55, 0.1);
  border-left: 4px solid #d4af37;
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateX(5px);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.step-icon {
  font-size: 1.2rem;
  margin-right: 1rem;
  width: 25px;
  text-align: center;
  color: #d4af37;
}

.step-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-family: "FangSong", "STKaiti", serif;
}

.step-time {
  font-size: 0.8rem;
  color: rgba(212, 175, 55, 0.6);
}

.stream-content {
  margin-bottom: 25px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.content-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #d4af37;
  text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
  letter-spacing: 1px;
}

.content-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 120px;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #d4af37, #ffd700);
  transition: width 0.5s ease;
  box-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
}

.progress-text {
  font-size: 0.8rem;
  color: rgba(212, 175, 55, 0.8);
}

.content-text {
  position: relative;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  min-height: 100px;
}

.typing-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  white-space: pre-line;
  word-wrap: break-word;
  font-family: "FangSong", "STKaiti", serif;
  text-align: justify;
}

.typing-text.typing {
  animation: fadeIn 0.5s ease-in-out;
}

.cursor {
  display: inline-block;
  background: #d4af37;
  width: 2px;
  height: 20px;
  animation: blink 1s infinite;
  margin-left: 2px;
  box-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
}

.stream-complete {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
}

.complete-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.complete-icon {
  font-size: 24px;
}

.complete-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #d4af37;
  text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
}

.complete-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(212, 175, 55, 0.8);
  margin-bottom: 0.3rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #d4af37;
  text-shadow: 0 0 3px rgba(212, 175, 55, 0.4);
}

.stream-error {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
}

.error-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 1.5rem;
  color: #dc2626;
}

.error-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #dc2626;
}

.error-message {
  color: rgba(220, 38, 38, 0.9);
  margin-bottom: 1rem;
  line-height: 1.6;
  font-family: "FangSong", "STKaiti", serif;
}

.retry-button {
  background: linear-gradient(45deg, #f56565, #e53e3e);
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .stream-result-section {
    padding: 20px 15px;
    margin: 15px -10px 0;
    border-radius: 10px;
  }
  
  .stream-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .stream-close {
    position: absolute;
    top: 15px;
    right: 15px;
  }
  
  .complete-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .stream-step {
    padding: 10px;
  }
  
  .step-icon {
    font-size: 16px;
    margin-right: 10px;
    width: 20px;
  }
}
</style> 