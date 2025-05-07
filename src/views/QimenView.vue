<template>
  <div class="qimen-container">
    <div class="cosmic-header">
      <div class="title-wrapper">
        <h2 class="dao-title">奇门遁甲</h2>
        <div class="dao-subtitle">玄机推演，运势如神</div>
      </div>
    </div>

    <div class="input-section">
      <div class="picker-wrapper">
        <div class="picker-item">
          <label class="picker-label">日期</label>
          <DatePicker
            :locale="locale"
            v-model:value="dateValue"
            class="dao-picker"
            placeholder="请选择日期"
            :bordered="false"
            :dropdownClassName="'dao-dropdown'"
          ></DatePicker>
        </div>
        <div class="picker-item">
          <label class="picker-label">时辰</label>
          <TimePicker
            :locale="locale"
            v-model:value="timeValue"
            class="dao-picker"
            placeholder="请选择时间"
            :bordered="false"
            :dropdownClassName="'dao-dropdown'"
          ></TimePicker>
        </div>
        <div class="question-wrapper">
          <label class="picker-label">占问</label>
          <input
            v-model="questionValue"
            type="text"
            class="dao-input"
            placeholder="请输入您的占卜问题"
          />
          <div class="input-hint">输入您想要占卜的具体问题</div>
        </div>
      </div>
      <button class="dao-button" @click="enhancedPaipan()">
        <span class="dao-button-text">排盘</span>
      </button>
    </div>

    <div class="result-section" v-if="panData">
      <div class="question-display" v-if="questionValue">
        <div class="question-title">问题：</div>
        <div class="question-content">{{ questionValue }}</div>
      </div>
      <div class="data-grid">
        <div class="data-item">
          <div class="data-label">干支：</div>
          <div class="data-value">{{ panData.干支 }}</div>
        </div>
        <div class="data-item">
          <div class="data-label">節氣：</div>
          <div class="data-value">{{ panData.節氣 }}</div>
        </div>
        <div class="data-item">
          <div class="data-label">排局：</div>
          <div class="data-value">{{ panData.排局 }}</div>
        </div>
        <div class="data-item" v-for="(item, key) in panData.旬空" :key="`xunkong-${key}`">
          <div class="data-label">{{ key }}：</div>
          <div class="data-value">{{ item }}</div>
        </div>
        <div class="data-item" v-for="(item, key) in panData.值符值使" :key="`zhifu-${key}`">
          <div class="data-label">{{ key }}：</div>
          <div class="data-value">{{ item }}</div>
        </div>
      </div>
    </div>

    <div class="bagua-wrapper">
      <div class="bagua-background"></div>
      <table class="qimen-table">
        <tr class="row">
          <td class="col palace" data-name="坎宫">
            <QimenItem index="四" />
          </td>
          <td class="col palace" data-name="艮宫">
            <QimenItem index="九" />
          </td>
          <td class="col palace" data-name="震宫">
            <QimenItem index="二" />
          </td>
        </tr>
        <tr class="row">
          <td class="col palace" data-name="坤宫">
            <QimenItem index="三" />
          </td>
          <td class="col palace center" data-name="中宫">
            <QimenItem index="五" />
          </td>
          <td class="col palace" data-name="巽宫">
            <QimenItem index="七" />
          </td>
        </tr>
        <tr class="row">
          <td class="col palace" data-name="兑宫">
            <QimenItem index="八" />
          </td>
          <td class="col palace" data-name="乾宫">
            <QimenItem index="一" />
          </td>
          <td class="col palace" data-name="离宫">
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
  </div>
</template>

<script setup lang="ts">
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import { ref, onMounted } from "vue";
import dayjs from 'dayjs';
import Qimen from '../qimendunjia/index.js'
import QimenItem from '../components/QimenItem.vue'
import { useQimenStore } from "../stores/index";
import { DatePicker, TimePicker } from 'ant-design-vue';
import 'dayjs/locale/zh-cn';
import type { Dayjs } from 'dayjs';
import { storeToRefs } from 'pinia';

dayjs.locale('zh-cn');

// 定义 panData 的类型接口
interface PanDataType {
    干支?: string;
    節氣?: string;
    排局?: string;
    旬空?: Record<string, string>;
    值符值使?: Record<string, string>;
    [key: string]: any;
}

const dateValue = ref<Dayjs>();
const timeValue = ref<Dayjs>();
const questionValue = ref<string>('');
const store = useQimenStore();

const { panData } = storeToRefs(store);

function paipan() {
  // Always use valid date/time, defaulting to current if not selected
  const date = dateValue.value || dayjs();
  const time = timeValue.value || dayjs();

  store.setPanData(new Qimen(date.year(), date.month()+1, date.date(), time.hour() || 0).p);
  console.log(store.panData);
}

// 添加鼠标跟随效果
const moveOrbs = (e) => {
  const orbs = document.querySelectorAll('.light-orb');
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  orbs.forEach((orb, index) => {
    // 创建轻微跟随效果，每个光晕有不同的移动量
    const moveX = (mouseX / window.innerWidth - 0.5) * (index + 1) * 20;
    const moveY = (mouseY / window.innerHeight - 0.5) * (index + 1) * 20;

    setTimeout(() => {
      orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }, index * 100);
  });
};

// 优化排盘按钮点击体验
const isPanningActive = ref(false);
const enhancedPaipan = () => {
  isPanningActive.value = true;

  // Vibration effect for tactile feedback
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  // Ensure date and time values always exist
  if (!dateValue.value) {
    dateValue.value = dayjs();
  }
  if (!timeValue.value) {
    timeValue.value = dayjs();
  }

  // Call the paipan function
  paipan();

  // Simulate calculation process
  setTimeout(() => {
    isPanningActive.value = false;
  }, 1000);
};

// Add tap effects for mobile experience
const addTapEffects = () => {
  // Add tap effect to button
  const button = document.querySelector('.dao-button');
  if (button) {
    button.addEventListener('click', function() {
      this.classList.add('tapped');
      setTimeout(() => {
        this.classList.remove('tapped');
      }, 600);
    });
  }

  // Add tap effects to cells
  const cells = document.querySelectorAll('.col');
  cells.forEach(cell => {
    cell.addEventListener('click', function() {
      // Remove tapped class from all cells
      cells.forEach(c => c.classList.remove('tapped'));

      // Add tapped class to this cell
      this.classList.add('tapped');

      // Remove tapped class after animation
      setTimeout(() => {
        this.classList.remove('tapped');
      }, 800);
    });
  });
};

onMounted(() => {
  // Register mouse movement events
  document.addEventListener('mousemove', moveOrbs);

  // Default loading today's chart
  const now = dayjs();
  dateValue.value = now;
  timeValue.value = now;
  paipan();

  // IMPORTANT: Remove the 3D rotation effect completely
  const qimenTable = document.querySelector('.qimen-table');
  if (qimenTable) {
    // Reset any transform to ensure flat appearance
    (qimenTable as HTMLElement).style.transform = 'none';

    // Remove scroll listener that was adding 3D effects
    document.removeEventListener('scroll', () => {});
  }

  // Add tap/click effects for mobile
  addTapEffects();
});

</script>

<style>
/* Vibrant gold palette */
.qimen-container {
  font-family: "FangSong", "STKaiti", "SimSun", serif;
  color: #d4af37; /* Richer gold color */
  background: #000000; /* Deeper black */
  padding: 20px 15px 40px;
  border-radius: 0;
  margin: 0;
  position: relative;
  min-height: 100vh;
  box-shadow: none;
  border: none;
  overflow: visible;
  -webkit-tap-highlight-color: transparent;
}

.qimen-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
  background-size: cover, cover;
  background-position: center, center;
  opacity: 1;
  z-index: -1;
}

/* Premium header styling */
.cosmic-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  padding: 25px 0;
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

/* More elegant input section */
.input-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 30px;
  padding: 25px;
  background-color: rgba(10, 10, 10, 0.8);
  border: 1px solid #85754e;
  border-radius: 2px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 1s ease-out forwards;
  animation-delay: 0.2s;
}

.section-title {
  font-size: 18px;
  color: #d4af37;
  margin-bottom: 15px;
  letter-spacing: 3px;
  position: relative;
  padding-left: 15px;
  font-weight: normal;
}

.section-title::before {
  content: "『";
  position: absolute;
  left: 0;
  color: #85754e;
}

.section-title::after {
  content: "』";
  margin-left: 5px;
  color: #85754e;
}

.picker-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 25px;
}

.picker-item {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
}

.picker-label {
  font-size: 14px;
  color: #a38a36;
  margin-bottom: 8px;
  letter-spacing: 1px;
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
  margin: 35px 0;
  padding: 25px;
  background-color: rgba(8, 8, 8, 0.9);
  border: 1px solid #85754e;
  position: relative;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
}

.question-display {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid rgba(133, 117, 78, 0.3);
  background-color: rgba(10, 10, 10, 0.5);
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
}

.data-item {
  padding: 12px;
  border: 1px solid rgba(133, 117, 78, 0.3);
  background-color: rgba(10, 10, 10, 0.5);
  transition: all 0.3s ease;
}

.data-item:hover {
  border-color: #d4af37;
  background-color: rgba(15, 15, 15, 0.7);
}

.data-label {
  color: #85754e;
  flex: 0 0 80px;
  font-weight: bold;
  letter-spacing: 1px;
}

.data-value {
  flex: 1;
  color: #d4af37;
  letter-spacing: 1px;
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
  margin: 40px auto;
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
  padding: 10px;
  border-collapse: separate;
  border-spacing: 3px; /* Add subtle spacing between cells */
  width: 100%;
  position: relative;
  z-index: 1;
  background-color: transparent;
  table-layout: fixed;
  border: none;
  overflow: hidden;
  transition: all 0.2s ease;
  transform: none !important;
}

/* Elegant cells */
.col {
  width: 33.33%;
  height: 120px;
  border: 1px solid #85754e !important; /* Softer gold border */
  position: relative;
  background-color: rgba(10, 10, 10, 0.9);
  vertical-align: top;
  padding: 25px 8px 8px 8px;
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
:deep(.tian-gan) { color: #3688ff; /* Blue */ }
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
  height: 50px;
  width: 100%;
  margin-top: 30px;
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

.dao-input {
  border: 1px solid #85754e !important;
  border-radius: 2px;
  background-color: rgba(10, 10, 10, 0.9) !important;
  color: #d4af37 !important;
  padding: 12px 15px;
  width: 100%;
  font-family: "FangSong", "STKaiti", serif;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
}

.question-wrapper {
  width: 100%;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

.input-hint {
  font-size: 12px;
  color: #85754e;
  margin-top: 5px;
  font-style: italic;
}

/* 添加响应式布局支持 */
@media (max-width: 768px) {
  .picker-item {
    min-width: 100%;
  }

  .data-grid {
    grid-template-columns: 1fr;
  }

  .bagua-wrapper {
    max-width: 320px;
  }
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
</style>
