<template>
  <div class="stream-analysis-container">
    <!-- 隐藏按钮，由父组件调用 -->

    <!-- 简化版分析结果区域 -->
    <div class="stream-result-section" v-if="showStreamResult">
      <div class="simple-header">
        <div class="simple-title">
          🔮 奇门解读
          <span v-if="conversationHistory.length > 0" class="conversation-indicator">
            (第{{ conversationHistory.length + 1 }}轮对话)
          </span>
        </div>
        <div class="header-actions">
          <button 
            v-if="conversationHistory.length > 0" 
            @click="resetAllState"
            class="new-conversation-btn"
            title="开始新对话"
          >
            🆕
          </button>
          <div class="simple-close" @click="closeStreamResult">×</div>
        </div>
      </div>
      
      <!-- 对话历史显示（可折叠） -->
      <div class="conversation-history" v-if="conversationHistory.length > 0">
        <div class="history-header" @click="showHistory = !showHistory">
          <span class="history-icon">📚</span>
          <span class="history-title">查看历史对话 ({{ conversationHistory.length }}轮)</span>
          <span class="toggle-icon">{{ showHistory ? '▼' : '▶' }}</span>
        </div>
        <div class="history-content" v-if="showHistory">
          <div 
            v-for="(item, index) in conversationHistory" 
            :key="index"
            class="history-item"
          >
            <div class="history-question">
              <span class="history-label">问{{ index + 1 }}：</span>
              <span class="history-text">{{ item.question }}</span>
            </div>
            <div class="history-answer">
              <span class="history-label">解{{ index + 1 }}：</span>
              <span class="history-text">{{ item.answer.substring(0, 150) }}{{ item.answer.length > 150 ? '...' : '' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 问题显示 -->
      <div class="question-display" v-if="currentQuestion">
        <div class="question-title">问</div>
        <div class="question-content">{{ currentQuestion }}</div>
      </div>

      <!-- 加载状态 -->
      <div class="loading-state" v-if="isStreaming && !streamContent">
        <div class="loading-icon">🔮</div>
        <div class="loading-text">正在推演...</div>
      </div>

      <!-- 实时内容显示 -->
      <div class="answer-content" v-if="streamContent">
        <div class="answer-header">
          <div class="answer-title">解</div>
        </div>
        
        <div class="answer-text">
          <div class="typing-text" :class="{ 'typing': isStreaming }">
            {{ streamContent }}
          </div>
          <div class="cursor" v-if="isStreaming">|</div>
        </div>
        
        <!-- 追问功能 -->
        <div class="follow-up-section" v-if="analysisComplete">
          <div class="follow-up-header">
            <span class="follow-up-icon">💭</span>
            <span class="follow-up-title">继续问卜</span>
          </div>
          <div class="follow-up-input">
            <textarea 
              v-model="followUpQuestion"
              placeholder="基于上述解读，您还想了解什么？&#10;例如：具体应该在什么时候行动？"
              class="follow-up-textarea"
              rows="2"
              maxlength="100"
            ></textarea>
            <div class="follow-up-actions">
              <span class="char-count">{{ followUpQuestion.length }}/100</span>
              <button 
                @click="askFollowUp"
                :disabled="!followUpQuestion.trim() || isStreaming"
                class="follow-up-btn"
              >
                继续问卜
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误显示 -->
      <div class="stream-error" v-if="streamError">
        <div class="error-header">
          <div class="error-icon">⚠️</div>
          <div class="error-text">推演受阻</div>
        </div>
        <div class="error-message">{{ streamError }}</div>
        <div class="error-actions">
          <button class="retry-button" @click="retryAnalysis()">
            <span>🔄 重新推演</span>
          </button>
          <router-link 
            v-if="streamError.includes('积分')" 
            to="/profile" 
            class="profile-link-btn"
          >
            <span>👤 个人中心</span>
          </router-link>
        </div>
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
const followUpQuestion = ref('');

// 对话历史记录
const conversationHistory = ref<Array<{question: string, answer: string, timestamp: string}>>([]);
const showHistory = ref(false);
const progressPercent = ref(0);
const currentQuestion = ref('');

// 流式连接相关
let eventSource: EventSource | null = null;
let startTime = 0;
let progressInterval: NodeJS.Timeout | null = null;

// 开始流式分析
async function startStreamAnalysis() {
  
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
    const inputElement = document.querySelector('.question-input-field') as HTMLInputElement;
    if (inputElement && inputElement.value) {
      questionText = inputElement.value.trim();
    }
  }
  
  if (!questionText || questionText.length === 0) {
    alert('请先输入占卜问题\n调试信息: questionValue=' + JSON.stringify(props.questionValue));
    return;
  }

  if (!props.panData) {
    alert('请先进行排盘');
    return;
  }


  
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



  // 获取认证token
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('用户未登录，请先登录');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData)
    });

    // 🔧 修复：检查response是否存在
    if (!response) {
      throw new Error('网络连接失败，请检查网络状态');
    }

    if (!response.ok) {
      // 尝试读取错误响应体
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            
            // 优先使用message字段，它通常包含更详细的信息
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else {
              errorMessage = errorText;
            }
          } catch (parseError) {
            errorMessage = errorText;
          }
        }
      } catch (readError) {
        // 静默处理读取错误
      }
      throw new Error(errorMessage);
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
            // 静默处理解析错误
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
  switch (data.type) {
    case 'init':
      addStreamStep('🔮', data.message || '正在启动分析...', data.timestamp);
      break;
      
    case 'step':
      const stepIcons = ['📊', '🤖', '💫', '✨'];
      const icon = stepIcons[data.step - 1] || '📍';
      addStreamStep(icon, data.message, data.timestamp);
      break;
      
    case 'content':
      const newContent = data.fullContent || data.content || '';
      streamContent.value = newContent;
      updateProgress(Math.min(90, (newContent.length / 20))); // 根据内容长度估算进度
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

  // 保存到对话历史
  conversationHistory.value.push({
    question: currentQuestion.value,
    answer: streamContent.value,
    timestamp: new Date().toISOString()
  });

  // 通知父组件分析完成
  emit('analysisComplete', {
    answer: streamContent.value,
    confidence: confidence.value,
    executionTime: analysisTime.value,
    steps: streamSteps.value
  });


}

// 处理错误
function handleStreamError(message: string) {
  
  // 优化错误信息显示
  let displayMessage = message;
  
  if (message.includes('积分不足') || message.includes('积分')) {
    displayMessage = `${message}\n\n💡 提示：您可以通过以下方式获取积分：\n• 每日签到\n• 完善个人资料\n• 分享给好友`;
  } else if (message.includes('未登录') || message.includes('登录')) {
    displayMessage = `${message}\n\n请先登录您的账户`;
  } else if (message.includes('网络') || message.includes('连接')) {
    displayMessage = `${message}\n\n请检查网络连接后重试`;
  }
  
  streamError.value = displayMessage;
  isStreaming.value = false;
  
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// 停止分析
function stopStreamAnalysis() {
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

// 追问功能
async function askFollowUp() {
  if (!followUpQuestion.value.trim()) return;
  
  // 构建完整的对话历史上下文
  let conversationContext = '';
  
  // 包含所有历史对话
  conversationHistory.value.forEach((item, index) => {
    conversationContext += `【对话${index + 1}】\n问：${item.question}\n解：${item.answer}\n\n`;
  });
  
  // 如果当前还有内容（但还没保存到历史），也加上
  if (streamContent.value && !conversationHistory.value.find(h => h.answer === streamContent.value)) {
    conversationContext += `【当前对话】\n问：${currentQuestion.value}\n解：${streamContent.value}\n\n`;
  }
  
  // 构建带完整上下文的追问
  const contextualQuestion = `${conversationContext}【新的追问】${followUpQuestion.value.trim()}`;
  
  // 保存用户输入的追问内容
  const userFollowUp = followUpQuestion.value.trim();
  
  // 重置状态，开始新的分析
  resetStreamState();
  currentQuestion.value = userFollowUp;
  followUpQuestion.value = '';
  

  
  // 开始新的分析，发送包含完整对话历史的上下文
  await startStreamAnalysisWithContext(contextualQuestion);
}

// 带上下文的分析函数
async function startStreamAnalysisWithContext(contextualQuestion: string) {
  if (!props.panData) {
    streamError.value = '请先进行排盘';
    return;
  }
  isStreaming.value = true;
  showStreamResult.value = true;
  streamError.value = '';
  startTime = Date.now();

  try {
    // 获取认证token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('用户未登录，请先登录');
    }

    const response = await fetch(`${API_BASE_URL}/api/analysis/qimen/stream`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paipanData: props.panData,
        question: contextualQuestion // 发送包含上下文的问题
      })
    });

    if (!response.ok) {
      // 尝试读取错误响应体
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        console.log('📋 追问错误响应原始内容:', errorText);
        
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            console.log('📋 追问解析后的错误数据:', errorData);
            
            // 优先使用message字段，它通常包含更详细的信息
            if (errorData.message) {
              errorMessage = errorData.message;
              console.log('✅ 追问使用message字段:', errorMessage);
            } else if (errorData.error) {
              errorMessage = errorData.error;
              console.log('✅ 追问使用error字段:', errorMessage);
            } else {
              console.log('⚠️ 追问未找到message或error字段，使用原始文本');
              errorMessage = errorText;
            }
          } catch (parseError) {
            console.log('⚠️ 追问JSON解析失败，使用原始文本:', errorText);
            errorMessage = errorText;
          }
        }
      } catch (readError) {
        console.log('⚠️ 追问读取响应体失败:', readError);
      }
      
      console.log('🔴 追问最终错误信息:', errorMessage);
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法创建流读取器');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            handleStreamData(data);
          } catch (e) {
            console.warn('解析数据失败:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ 流式分析失败:', error);
    handleStreamError(`分析过程中出现错误: ${error.message}`);
  }
}

// 关闭结果
function closeStreamResult() {
  showStreamResult.value = false;
  stopStreamAnalysis();
  resetStreamState();
}

// 重置状态（保留对话历史）
function resetStreamState() {
  streamSteps.value = [];
  streamContent.value = '';
  streamError.value = '';
  analysisComplete.value = false;
  analysisTime.value = 0;
  progressPercent.value = 0;
  // 注意：不清除 conversationHistory，保持对话连续性
}

// 完全重置（清除对话历史）
function resetAllState() {
  resetStreamState();
  conversationHistory.value = [];
  currentQuestion.value = '';
  console.log('🗑️ 已清除所有对话历史');
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

// 暴露方法给父组件
defineExpose({
  startStreamAnalysis,
  stopStreamAnalysis,
  testDisplay,
  resetStreamState,
  resetAllState
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

/* 简化版头部样式 */
.simple-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(212, 175, 55, 0.3);
  padding-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.simple-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #d4af37;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
  letter-spacing: 1px;
}

.conversation-indicator {
  font-size: 0.9rem;
  color: rgba(212, 175, 55, 0.7);
  font-weight: 400;
  margin-left: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-conversation-btn {
  cursor: pointer;
  font-size: 1.2rem;
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

.new-conversation-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
  border-color: rgba(212, 175, 55, 0.4);
  transform: scale(1.1);
}

.simple-close {
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

.simple-close:hover {
  background: rgba(212, 175, 55, 0.3);
  color: #d4af37;
  border-color: rgba(212, 175, 55, 0.5);
}

/* 对话历史样式 */
.conversation-history {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  margin-bottom: 20px;
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: rgba(212, 175, 55, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-header:hover {
  background: rgba(212, 175, 55, 0.15);
}

.history-icon {
  font-size: 1rem;
}

.history-title {
  flex: 1;
  font-size: 0.9rem;
  color: #d4af37;
  font-weight: 500;
}

.toggle-icon {
  font-size: 0.8rem;
  color: rgba(212, 175, 55, 0.7);
  transition: transform 0.3s ease;
}

.history-content {
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-question,
.history-answer {
  margin-bottom: 8px;
}

.history-question:last-child,
.history-answer:last-child {
  margin-bottom: 0;
}

.history-label {
  font-weight: 600;
  color: #d4af37;
  margin-right: 8px;
  min-width: 40px;
  display: inline-block;
}

.history-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  font-size: 13px;
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
  letter-spacing: 3px;
  font-size: 1.2rem;
}

.question-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  font-family: "FangSong", "STKaiti", serif;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 3rem 2rem;
  text-align: center;
}

.loading-icon {
  font-size: 2rem;
  animation: pulse 2s infinite ease-in-out;
}

.loading-text {
  font-size: 1.1rem;
  color: #d4af37;
  font-weight: 500;
  letter-spacing: 1px;
}

/* 答案内容样式 */
.answer-content {
  margin-bottom: 25px;
}

.answer-header {
  margin-bottom: 20px;
}

.answer-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #d4af37;
  text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
  letter-spacing: 3px;
  margin-bottom: 15px;
}

.answer-text {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  padding: 20px;
  position: relative;
}

/* 追问功能样式 */
.follow-up-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.follow-up-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.follow-up-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.5));
}

.follow-up-title {
  font-size: 1rem;
  color: #d4af37;
  font-weight: 600;
  letter-spacing: 1px;
}

.follow-up-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  padding: 15px;
}

.follow-up-textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: #d4af37;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.6;
}

.follow-up-textarea::placeholder {
  color: rgba(212, 175, 55, 0.5);
}

.follow-up-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.char-count {
  font-size: 12px;
  color: rgba(212, 175, 55, 0.6);
}

.follow-up-btn {
  background: linear-gradient(135deg, #d4af37, #b8860b);
  color: #000;
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follow-up-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.follow-up-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
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
  color: #d4af37;
}

.error-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #d4af37;
  letter-spacing: 1px;
}

.error-message {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  line-height: 1.6;
  font-family: "FangSong", "STKaiti", serif;
  white-space: pre-line; /* 支持换行符显示 */
  text-align: left;
}

.retry-button {
  background: linear-gradient(135deg, #d4af37, #b8860b);
  color: #000;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.error-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.profile-link-btn {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-link-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  background: linear-gradient(135deg, #357abd, #2968a3);
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

@keyframes pulse {
  0% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% { 
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
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
  
  .follow-up-section {
    margin-top: 20px;
    padding-top: 15px;
  }
  
  .follow-up-textarea {
    font-size: 13px;
  }
  
  .follow-up-btn {
    padding: 6px 16px;
    font-size: 13px;
  }
  
  .simple-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    align-self: flex-end;
    position: absolute;
    top: 0;
    right: 0;
  }
  
  .conversation-history {
    margin-bottom: 15px;
  }
  
  .history-content {
    max-height: 200px;
  }
  
  .history-item {
    padding: 10px;
  }
  
  .history-text {
    font-size: 12px;
  }
  
  .error-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .retry-button,
  .profile-link-btn {
    width: 100%;
    padding: 10px 15px;
    font-size: 14px;
  }
}
</style> 