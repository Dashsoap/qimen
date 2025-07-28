<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { gsap } from "gsap";
import { useRouter } from 'vue-router';
import QimenDisk3D from '../components/QimenDisk3D.vue';
import PerformanceMonitor from '../components/PerformanceMonitor.vue';

const typingText = ref();
const router = useRouter();

// 问卜相关状态
const questionInput = ref('');
const showQuestionInput = ref(false);
const isAnalyzing = ref(false);

// 专业问题推荐分类
const professionalQuestions = {
  '官司诉讼': [
    '明天的官司能否胜诉？',
    '这场法律纠纷何时能有结果？',
    '选择哪位律师对案件更有利？',
    '是否应该接受庭外和解？'
  ],
  '事业决策': [
    '这个项目是否值得投资？',
    '何时是跳槽的最佳时机？',
    '与这个合作伙伴的生意能否成功？',
    '公司上市的时机是否合适？'
  ],
  '重大抉择': [
    '是否应该搬到新城市发展？',
    '这段婚姻是否应该继续？',
    '是否应该接受这个工作机会？',
    '何时是购买房产的最佳时机？'
  ],
  '健康疾病': [
    '这次手术的结果如何？',
    '何时能够康复？',
    '选择哪种治疗方案更好？',
    '是否需要更换医生？'
  ],
  '财运投资': [
    '这笔投资是否明智？',
    '何时是出售股票的最佳时机？',
    '这个生意伙伴是否可靠？',
    '是否应该贷款创业？'
  ],
  '人际关系': [
    '这个人是否值得信任？',
    '如何化解与同事的矛盾？',
    '这段感情是否有未来？',
    '是否应该原谅对方？'
  ]
};

// 快速问卜功能
const quickDivination = async () => {
  if (!questionInput.value.trim()) {
    alert('请输入您要问卜的问题');
    return;
  }
  
  isAnalyzing.value = true;
  
  try {
    // 跳转到奇门页面并传递问题
    await router.push({
      path: '/qimen',
      query: { question: questionInput.value.trim() }
    });
  } catch (error) {
    console.error('跳转失败:', error);
    alert('跳转失败，请重试');
  } finally {
    isAnalyzing.value = false;
  }
};

// 选择推荐问题
const selectRecommendedQuestion = (question) => {
  questionInput.value = question;
};

// 打字机动画相关
let typingTimeline;

// 3D场景事件处理
const handleDiskReady = () => {
  console.log('奇门盘已准备就绪');
};

const handleDiskClick = (event) => {
  console.log('奇门盘被点击', event);
};

const handleDiskError = (error) => {
  console.error('奇门盘错误:', error);
};

onMounted(() => {
  // 添加打字机效果
  const text = "奇门遁甲‌是一种时空能量学，它通过符号和模型来窥测地球上的万事万物。奇门遁甲的核心在于查验天体对地球的能量频率以及地球方位的能量与气场";
  const typingSpeed = 0.15; // 打字速度，每个字的时间(秒)
  
  let currentText = "";
  const chars = text.split('');
  typingTimeline = gsap.timeline();
  
  chars.forEach((char, index) => {
    typingTimeline.to(typingText.value, {
      duration: 0.01, // 瞬间更新
      onStart: () => {
        currentText += char;
        if (typingText.value) {
          typingText.value.textContent = currentText;
        }
      },
      delay: typingSpeed // 每个字之间的延迟
    });
  });
});

onUnmounted(() => {
  // 清理打字机动画
  if (typingTimeline) {
    typingTimeline.kill();
    typingTimeline = null;
  }
});
</script>

<template>
  <div class="scene-container">
    <!-- 性能监控组件 -->
    <PerformanceMonitor />
    
    <!-- 3D奇门盘组件 -->
    <QimenDisk3D
      :enable-controls="true"
      :enable-click-interaction="true"
      :enable-camera-animation="true"
      :enable-particles="true"
      :background-color="0x000022"
      container-class="disk-container"
      canvas-class="disk-canvas"
      @ready="handleDiskReady"
      @click="handleDiskClick"
      @error="handleDiskError"
    />
    
    <!-- 专业问卜界面 -->
    <div class="divination-overlay">
      <!-- 主标题 -->
      <div class="main-header">
        <h1 class="main-title">奇门遁甲</h1>
        <p class="main-subtitle">问天地玄机，卜万事吉凶</p>
      </div>
      
      <!-- 快速问卜区域 -->
      <div class="quick-divination">
        <div class="divination-card">
          <div class="card-header">
            <span class="card-icon">🔮</span>
            <span class="card-title">即时问卜</span>
          </div>
          
          <div class="question-area">
            <textarea 
              v-model="questionInput"
              placeholder="请输入您要问卜的问题&#10;例如：97年的我明天去打官司能不能赢？"
              class="question-textarea"
              rows="3"
              maxlength="200"
            ></textarea>
            <div class="input-footer">
              <span class="char-count">{{ questionInput.length }}/200</span>
              <button 
                @click="quickDivination"
                :disabled="isAnalyzing || !questionInput.trim()"
                class="divination-btn"
              >
                {{ isAnalyzing ? '问卜中...' : '立即问卜' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 问题推荐区域 -->
      <div class="question-recommendations">
        <h3 class="recommendations-title">常见问卜类型</h3>
        <div class="categories">
          <div v-for="(questions, category) in professionalQuestions" :key="category" class="category">
            <h4 class="category-title">{{ category }}</h4>
            <div class="question-list">
              <button 
                v-for="question in questions" 
                :key="question"
                @click="selectRecommendedQuestion(question)"
                class="question-btn"
              >
                {{ question }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 功能入口 -->
      <div class="function-entries">
        <router-link to="/qimen" class="function-entry primary">
          <span class="entry-icon">⚡</span>
          <span class="entry-text">进入排盘</span>
        </router-link>
        <router-link to="/history" class="function-entry">
          <span class="entry-icon">📋</span>
          <span class="entry-text">历史记录</span>
        </router-link>
        <router-link to="/favorites" class="function-entry">
          <span class="entry-icon">⭐</span>
          <span class="entry-text">我的收藏</span>
        </router-link>
        <router-link to="/profile" class="function-entry">
          <span class="entry-icon">👤</span>
          <span class="entry-text">个人档案</span>
        </router-link>
      </div>
    </div>
    
    <!-- 添加文字动画容器 -->
    <div class="typing-container">
      <div class="typing-text" ref="typingText"></div>
    </div>
  </div>
</template>

<style scoped>
.scene-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: visible;
  background: linear-gradient(to bottom, #000022, #000033, #000044);
}

/* 3D奇门盘容器样式 */
:deep(.disk-container) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

:deep(.disk-canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

/* 添加打字机文字样式 */
.typing-container {
  position: absolute;
  top: 30px;
  left: 0;
  width: 100%;
  z-index: 10;
  text-align: center;
  pointer-events: none; /* 允许通过文字点击下方的内容 */
}

.typing-text {
  display: inline-block;
  max-width: 80%;
  padding: 15px 25px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 300;
  line-height: 1.6;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  letter-spacing: 1px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .typing-text {
    font-size: 14px;
    padding: 10px 15px;
    max-width: 90%;
  }
}

/* 专业问卜界面样式 */
.divination-overlay {
  position: relative;
  width: 100%;
  min-height: 100vh;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 15px;
  box-sizing: border-box;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  backdrop-filter: blur(2px);
}

.main-header {
  text-align: center;
  margin-bottom: 25px;
  margin-top: 40px;
}

.main-title {
  font-size: 2.5rem;
  color: #d4af37;
  margin: 0;
  font-weight: 700;
  text-shadow: 
    0 0 20px rgba(212, 175, 55, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 2px;
  background: linear-gradient(135deg, #d4af37, #ffd700, #d4af37);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  0% { 
    filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.3));
  }
  100% { 
    filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.8));
  }
}

.main-subtitle {
  font-size: 1.1rem;
  color: rgba(184, 134, 11, 0.9);
  margin: 8px 0 0 0;
  font-weight: 400;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.quick-divination {
  width: 100%;
  max-width: 550px;
  margin-bottom: 30px;
}

.divination-card {
  background: linear-gradient(
    135deg,
    rgba(8, 8, 8, 0.95) 0%,
    rgba(20, 20, 20, 0.98) 50%,
    rgba(8, 8, 8, 0.95) 100%
  );
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(212, 175, 55, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.divination-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  opacity: 0.8;
}

.divination-card:hover {
  transform: translateY(-2px);
  border-color: rgba(212, 175, 55, 0.6);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.7),
    0 0 50px rgba(212, 175, 55, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.card-icon {
  font-size: 1.3rem;
  filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.5));
}

.card-title {
  font-size: 1.1rem;
  color: #d4af37;
  font-weight: 600;
  letter-spacing: 1px;
}

.question-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  padding: 15px;
  color: #d4af37;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 70px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  line-height: 1.5;
}

.question-textarea:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.7);
  box-shadow: 
    0 0 20px rgba(212, 175, 55, 0.2),
    inset 0 2px 4px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.8);
}

.question-textarea::placeholder {
  color: rgba(212, 175, 55, 0.5);
  line-height: 1.4;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 0.8rem;
  color: rgba(212, 175, 55, 0.6);
  font-weight: 500;
}

.divination-btn {
  background: linear-gradient(135deg, #d4af37, #b8860b, #d4af37);
  background-size: 200% 200%;
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(212, 175, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  animation: buttonShine 3s ease-in-out infinite;
}

@keyframes buttonShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.divination-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.divination-btn:hover:not(:disabled)::before {
  left: 100%;
}

.divination-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(212, 175, 55, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  filter: brightness(1.1);
}

.divination-btn:active {
  transform: translateY(0);
}

.divination-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  filter: none;
  animation: none;
}

.question-recommendations {
  width: 100%;
  max-width: 900px;
  margin-bottom: 30px;
}

.recommendations-title {
  text-align: center;
  color: #d4af37;
  font-size: 1.3rem;
  margin-bottom: 20px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 15px;
}

.category {
  background: linear-gradient(
    135deg,
    rgba(8, 8, 8, 0.9) 0%,
    rgba(20, 20, 20, 0.95) 100%
  );
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.05), transparent);
  transition: left 0.6s ease;
}

.category:hover::before {
  left: 100%;
}

.category:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(212, 175, 55, 0.1);
}

.category-title {
  color: #d4af37;
  font-size: 1rem;
  margin: 0 0 12px 0;
  font-weight: 600;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  position: relative;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.question-btn {
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: rgba(212, 175, 55, 0.9);
  font-size: 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  line-height: 1.4;
}

.question-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
  transition: left 0.4s ease;
}

.question-btn:hover::before {
  left: 100%;
}

.question-btn:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.4);
  color: #d4af37;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.1);
}

.question-btn:active {
  transform: translateX(2px);
}

.function-entries {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
}

.function-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(
    135deg,
    rgba(8, 8, 8, 0.9) 0%,
    rgba(20, 20, 20, 0.95) 100%
  );
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  color: #d4af37;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.function-entry::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
  transition: left 0.5s ease;
}

.function-entry:hover::before {
  left: 100%;
}

.function-entry.primary {
  background: linear-gradient(
    135deg,
    rgba(212, 175, 55, 0.2) 0%,
    rgba(212, 175, 55, 0.1) 100%
  );
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
}

.function-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.25);
  border-color: rgba(212, 175, 55, 0.6);
}

.function-entry.primary:hover {
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.35);
  filter: brightness(1.1);
}

.entry-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.4));
}

.entry-text {
  font-size: 0.9rem;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .divination-overlay {
    padding: 10px;
  }
  
  .main-header {
    margin-top: 30px;
    margin-bottom: 20px;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .main-subtitle {
    font-size: 1rem;
  }
  
  .divination-card {
    padding: 15px;
  }
  
  .categories {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .function-entries {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .function-entry {
    width: 200px;
    justify-content: center;
  }
  
  .question-textarea {
    font-size: 0.9rem;
    min-height: 60px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 1.8rem;
  }
  
  .divination-card {
    padding: 12px;
  }
  
  .category {
    padding: 12px;
  }
  
  .question-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  
  .function-entry {
    width: 180px;
    padding: 8px 15px;
  }
}
</style>