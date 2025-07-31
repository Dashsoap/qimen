<template>
  <div class="home-container">


    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 头部区域 -->
      <div class="header-section">
        <div class="header-left">
          <h1 class="app-title">奇门遁甲</h1>
          <p class="app-subtitle">问天地玄机，卜万事吉凶</p>
        </div>
        <div class="header-right">
          <button class="history-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#753C15" stroke-width="1.5"/>
              <path d="M10 5v5l3 3" stroke="#753C15" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

        </div>
      </div>

      <!-- 问卜输入区域 -->
      <div class="input-section">
        <div class="input-card">
          <textarea 
            v-model="questionInput"
            placeholder="在这里写下你的困惑，奇门会给你答案"
            class="question-textarea"
            maxlength="200"
          ></textarea>
          <div class="input-footer">
            <span class="char-count">{{ questionInput.length }}/200</span>
            <button 
              class="submit-btn"
              @click="handleSubmit"
              :disabled="!questionInput.trim()"
            >
              立即问卜
            </button>
          </div>
        </div>
      </div>

      <!-- 猜你想问区域 -->
      <div class="suggestions-section">
        <div class="section-header">
          <h2 class="section-title">猜你想问</h2>
          <button class="refresh-btn" @click="refreshQuestions">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.65 6.35A6.5 6.5 0 1 0 8 14.5" stroke="#999" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M11 4l2.65 2.35L11 8.7" stroke="#999" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="question-list">
          <div 
            v-for="(item, index) in questionItems" 
            :key="index"
            class="question-item"
            @click="selectQuestion(item)"
          >
            <div class="question-icon">
              <img :src="item.icon" :alt="item.text" />
            </div>
            <span class="question-text">{{ item.text }}</span>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" class="arrow-icon">
              <path d="M2 2l4 4-4 4" stroke="#D3844E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 导入图片
import lawIcon from '@/assets/img/home/官司诉讼.png'
import decisionIcon from '@/assets/img/home/重大决策.png'
import careerIcon from '@/assets/img/home/事业.png'
import healthIcon from '@/assets/img/home/健康.png'
import moneyIcon from '@/assets/img/home/财运.png'
import loveIcon from '@/assets/img/home/情感.png'
import bgImage from '@/assets/img/home/bg.svg';

const router = useRouter()
const questionInput = ref('')

// 问题分类数据库
const questionCategories = {
  law: {
    name: '官司诉讼',
    icon: lawIcon,
    value: 'law',
    questions: [
      '明天的官司能否胜诉？',
      '这场诉讼的结果如何？',
      '对方会主动和解吗？',
      '律师费用能否追回？',
      '证据是否足够有力？',
      '何时能结束这场官司？'
    ]
  },
  decision: {
    name: '重大决策',
    icon: decisionIcon,
    value: 'decision',
    questions: [
      '是否应该搬到新城市发展？',
      '这个投资项目值得参与吗？',
      '现在是买房的好时机吗？',
      '应该选择哪个工作机会？',
      '是否应该创业？',
      '这个合作伙伴可靠吗？'
    ]
  },
  career: {
    name: '事业',
    icon: careerIcon,
    value: 'career',
    questions: [
      '何时是跳槽的时机？',
      '升职加薪的机会何时到来？',
      '新项目能否成功？',
      '同事关系如何改善？',
      '职业转型是否明智？',
      '创业项目前景如何？'
    ]
  },
  health: {
    name: '健康',
    icon: healthIcon,
    value: 'health',
    questions: [
      '这次手术的结果如何？',
      '身体检查会有问题吗？',
      '这个治疗方案有效吗？',
      '何时能完全康复？',
      '需要换医生吗？',
      '家人的健康状况如何？'
    ]
  },
  money: {
    name: '财运',
    icon: moneyIcon,
    value: 'money',
    questions: [
      '何时是出售股票的最佳时机？',
      '这笔投资能否盈利？',
      '财运何时好转？',
      '债务何时能还清？',
      '生意能否做大？',
      '意外之财会降临吗？'
    ]
  },
  love: {
    name: '情感',
    icon: loveIcon,
    value: 'love',
    questions: [
      '这段感情是否有未来？',
      '对方是否真心爱我？',
      '何时能遇到真爱？',
      '分手后还能复合吗？',
      '婚姻生活会幸福吗？',
      '暗恋的人对我有意思吗？'
    ]
  }
}

// 当前显示的问题列表
const questionItems = ref([])
// 记录每个分类当前使用的问题索引
const usedQuestionIndexes = ref({})

// 随机获取每个分类的一个问题（避免重复）
const getRandomQuestions = (avoidCurrent = false) => {
  const categories = Object.keys(questionCategories)
  return categories.map(categoryKey => {
    const category = questionCategories[categoryKey]
    let randomIndex
    
    if (avoidCurrent && usedQuestionIndexes.value[categoryKey] !== undefined) {
      // 刷新时避免选择当前已显示的问题
      const availableIndexes = category.questions
        .map((_, index) => index)
        .filter(index => index !== usedQuestionIndexes.value[categoryKey])
      
      randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
    } else {
      // 初始化时随机选择
      randomIndex = Math.floor(Math.random() * category.questions.length)
    }
    
    // 记录当前使用的索引
    usedQuestionIndexes.value[categoryKey] = randomIndex
    
    return {
      text: category.questions[randomIndex],
      icon: category.icon,
      category: category.value,
      categoryName: category.name
    }
  })
}

// 初始化问题列表
questionItems.value = getRandomQuestions()

// 刷新问题列表（确保不重复）
const refreshQuestions = () => {
  questionItems.value = getRandomQuestions(true)
}

// 选择问题
const selectQuestion = (item) => {
  questionInput.value = item.text
}

// 提交问卜
const handleSubmit = () => {
  if (!questionInput.value.trim()) return
  
  // 查找当前问题所属的分类
  const selectedItem = questionItems.value.find(item => item.text === questionInput.value.trim())
  
  router.push({
    path: '/qimen',
    query: { 
      question: questionInput.value.trim(),
      category: selectedItem?.category || 'custom',
      categoryName: selectedItem?.categoryName || '自定义'
    }
  })
}
</script>

<style scoped>
.home-container {
  width: 100%;
  position: relative;
}


.bar {
  width: 3px;
  background: #000;
  border-radius: 1px;
}

.bar:nth-child(1) { height: 4px; }
.bar:nth-child(2) { height: 6px; }
.bar:nth-child(3) { height: 8px; }
.bar:nth-child(4) { height: 10px; }

.wifi-icon {
  width: 15px;
  height: 11px;
  background: #000;
  border-radius: 2px 2px 0 0;
  position: relative;
}

.wifi-icon::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background: #FEFDF7;
  border-radius: 1px 1px 0 0;
}

.battery-icon {
  width: 24px;
  height: 12px;
  border: 1px solid #000;
  border-radius: 2px;
  position: relative;
}

.battery-icon::after {
  content: '';
  position: absolute;
  right: -3px;
  top: 3px;
  width: 2px;
  height: 6px;
  background: #000;
  border-radius: 0 1px 1px 0;
}

.battery-level {
  position: absolute;
  left: 1px;
  top: 1px;
  width: 18px;
  height: 8px;
  background: #000;
  border-radius: 1px;
}

/* 主要内容 */
.main-content {
  padding: 22px 16px 0px;
  max-width: 375px;
  margin: 0 auto;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left {
  flex: 1;
}

.app-title {
  font-family: 'Source Han Serif CN', serif;
  font-weight: 700;
  font-size: 26px;
  line-height: 37px;
  color: #753C15;
  margin: 0 0 4px 0;
}

.app-subtitle {
  font-family: 'Source Han Serif CN', serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 19px;
  color: #753C15;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.history-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.avatar-container {
  position: relative;
}





/* 输入区域 */
.input-section {
  margin-bottom: 40px;
}

.input-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.question-textarea {
  width: 100%;
  min-height: 100px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'PingFang SC', sans-serif;
  font-size: 15px;
  line-height: 22px;
  color: #333;
  background: transparent;
}

.question-textarea::placeholder {
  color: #999;
  opacity: 0.8;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.char-count {
  font-size: 14px;
  color: #999;
}

.submit-btn {
  background: #D3844E;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #B8743E;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 建议区域 */
.suggestions-section {
  margin-bottom: 40px;
  position: relative;
  background-image: url('@/assets/img/home/bg.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  border-radius: 16px;
}

.suggestions-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: -16px;
  right: -16px;
  bottom: 0;

}

.suggestions-section > * {
  position: relative;
  z-index: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #753C15;
  margin: 0;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #F8F8F8;
}

/* 问题列表 */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #ffffff01;
  border: 1px solid #F0E6D6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 70%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.question-item:hover {
  border-color: #D3844E;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(211, 132, 78, 0.15);
}

.question-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.question-text {
  flex: 1;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #753C15;
  line-height: 20px;
}

.arrow-icon {
  margin-left: 8px;
  flex-shrink: 0;
}

</style>