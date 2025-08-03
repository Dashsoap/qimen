<template>
    <div class="wrapper">
        <div class="wrapper-item">
            <span class="clickable-element tiangan-name" v-if="viewData.暗干" @click.stop="showElementInfo('天干', viewData.暗干)">{{ viewData.暗干 }}</span>
            <span class="clickable-element divine-name" v-if="viewData.八神" @click.stop="showElementInfo('八神', viewData.八神)">{{ getFullDivineName(viewData.八神) }}</span>
            <span class="placeholder" v-else>空</span>
        </div>
        <div class="wrapper-item">
            <span class="placeholder">空 </span>
            <span class="clickable-element star-name" v-if="viewData.九星" 
                  :style="{ color: getFontColor('九星', viewData.九星) }" 
                  @click.stop="showElementInfo('九星', viewData.九星)">
                {{ getFullStarName(viewData.九星) }}
            </span>
            <span class="placeholder">空</span>
        </div>
        <div class="wrapper-item">
            <span class="placeholder">空</span>
            <span class="placeholder">空</span>
            <span class="clickable-element gate-name" v-if="viewData.八门" 
                  :style="{ color: getFontColor('八门', viewData.八门) }" 
                  @click.stop="showElementInfo('八门', viewData.八门)">
                {{ simplifyText(viewData.八门) }}
            </span>
            <span class="placeholder" v-if="!viewData.天盘1">空</span>
            <span class="clickable-element tiangan-name" v-if="viewData.天盘1" 
                  :style="{ color: getFontColor('天干', viewData.天盘1) }" 
                  @click.stop="showElementInfo('天干', viewData.天盘1)">
                {{ viewData.天盘1 }}
            </span>
            <span class="clickable-element tiangan-name" v-if="viewData.天盘" 
                  :style="{ color: getFontColor('天干', viewData.天盘) }" 
                  @click.stop="showElementInfo('天干', viewData.天盘)">
                {{ viewData.天盘 }}
            </span>
        </div>
        <div class="wrapper-item">
            <span class="placeholder">符</span>
            <span v-if="getKongWang(viewData)" class="kong-indicator clickable-element"
                  style="font-size: 18px !important; font-weight: 700;"
                  @click.stop="showElementInfo('旬空', '旬空')">
                {{ getKongWang(viewData) }}
            </span>
            <span class="clickable-element dizhi-name" v-if="viewData.地盘" 
                  :style="{ color: getFontColor('地支', viewData.地盘) }" 
                  @click.stop="showElementInfo('地支', viewData.地盘)">
                {{ viewData.地盘 }}
            </span>
        </div>
        <!-- 马星指示器 -->
        <span v-if="formatHorseInfo(viewData)" 
              :class="['horse-indicator', getHorseIndicatorPosition()]"
              @click.stop="showElementInfo('马星', '马星')">
            {{ formatHorseInfo(viewData) }}
        </span>
    </div>
</template>

<script setup>
import { computed, defineProps, reactive } from "vue";
import { useQimenStore } from "../stores/index";
import Config from "../qimendunjia/config";
import { useQimenInfoStore } from "../stores/qimenInfoStore";

const props = defineProps(
    { index: String }
);

// 奇门盘数据
const store = useQimenStore();
const infoStore = useQimenInfoStore();
const index = props.index;

// 获取当前八卦方位
const bagua = Config.gongs_code[index];
const viewData = store.getGongViewData(bagua);
const dizhi_pan = {
    '坎': ['子'],
    '艮': ['丑', '寅'],
    '震': ['卯'],
    '巽': ['辰', '巳'],
    '離': ['午'],
    '坤': ['未', '申'],
    '兌': ['酉'],
    '乾': ['戌', '亥']
};

// 格式化马星信息
function formatHorseInfo(horseInfo) {
    const ma = horseInfo['馬星'];
    if(!ma || !dizhi_pan[bagua]) return '';
    return dizhi_pan[bagua].includes(ma) ? '🐎' :'';
}

// 获取旬空信息
function getKongWang(viewData){
    const kongwang = viewData['旬空'];
    if(!kongwang || !dizhi_pan[bagua]) return '';
    const kongwang_list = kongwang.split('');
    // 如果dizhi包含kongwanglist中的一个则返回空
    if (dizhi_pan[bagua].some(dizhi => kongwang_list.includes(dizhi))) {
        return 'O';
    }
    return '';
}

// 获取马星位置样式
function getHorseIndicatorPosition(){
    if(bagua) {
        if(bagua=='乾') return 'qian';
        if(bagua=='坤') return 'kun';
        if(bagua=='艮') return 'geng';
        if(bagua=='巽') return 'xun';
    }
    return '';
}

// 五行颜色对照表
const wuxingColor = {
    金: '#f28413',
    木: '#167318',
    水: '#4499ff',
    火: '#bf403a',
    土: '#87561e',
};

// 繁体字转简体字映射
const traditionalToSimplified = {
    // 八门
    "休": "休",
    "死": "死",
    "傷": "伤",
    "杜": "杜",
    "開": "开",
    "驚": "惊",
    "生": "生",
    "景": "景",
    // 九星
    "蓬": "蓬",
    "芮": "芮",
    "沖": "冲",
    "輔": "辅",
    "禽": "禽",
    "心": "心",
    "柱": "柱",
    "任": "任",
    "英": "英",
    "馬": "马",
    "天馬": "天马",
    "丁馬": "丁马",
    "驛馬": "驿马",
    "空亡宮": "空亡宫",
    "空亡": "空亡",
    // 其他可能需要转换的字符
};

// 繁体字转简体字函数
function simplifyText(text) {
    if (!text) return text;
    return traditionalToSimplified[text] || text;
}

// 八神简称到全称的显示映射
function getFullDivineName(shortName) {
    const divineMappings = {
        // 简体字映射
        '符': '值符',
        '蛇': '螣蛇', 
        '阴': '太阴',
        '合': '六合',
        '虎': '白虎',
        '武': '玄武',
        '玄': '玄武',  // 处理数据源是"玄"的情况
        '地': '九地',
        '天': '九天',
        
        // 繁体字映射
        '陰': '太阴',  // 繁体字"陰"映射到太阴
        '螣': '螣蛇',  // 处理可能的繁体字
        
        // 全称映射（数据源直接是全称的情况）
        '太阴': '太阴',
        '六合': '六合',
        '白虎': '白虎',
        '玄武': '玄武',
        '九地': '九地',
        '九天': '九天',
        '值符': '值符',
        '螣蛇': '螣蛇'
    };
    
    return divineMappings[shortName] || shortName;
}

// 九星简称到全称的显示映射
function getFullStarName(shortName) {
    const starMappings = {
        '蓬': '天蓬',
        '芮': '天芮',
        '冲': '天冲',
        '辅': '天辅',
        '禽': '天禽',
        '心': '天心',
        '柱': '天柱',
        '任': '天任',
        '英': '天英'
    };
    // 如果是繁体字，先转简体
    const simplified = simplifyText(shortName);
    return starMappings[simplified] || shortName;
}

// 所有符号的五行属性对照表 (使用简体字)
const wuxingMap = {
    八门: {
        "休": '水',
        "死": '土',
        "伤": '木',
        "杜": '木',
        "开": '金',
        "惊": '金',
        "生": '土',
        "景": '火',
    },
    八神: {
        "符": '土',
        "蛇": '火',
        "阴": '金',
        "合": '木',
        "虎": '金',
        "武": '水',
        "地": '金',
        "天": '金',
    },
    九星: {
        "蓬": '水',
        "芮": '土',
        "冲": '木',
        "辅": '土',
        "禽": '土',
        "心": '金',
        "柱": '金',
        "任": '土',
        "英": '火',
    },
    天干: {
        甲: '木',
        乙: '木',
        丙: '火',
        丁: '火',
        戊: '土',
        己: '土',
        庚: '金',
        辛: '金',
        壬: '水',
        癸: '水',
    },
    地支: {
        "子": '水',
        "丑": '土',
        "寅": '木',
        "卯": '木',
        "辰": '土',
        "巳": '火',
        "午": '火',
        "未": '土',
        "申": '金',
        "酉": '金',
        "戌": '土',
        "亥": '水',
    }
};

/**
 * 根据类型和符号获取五行对应的颜色
 * @param {*} type 类型：八门、九星、天干、地支等
 * @param {*} value 值
 */
function getFontColor(type, value) {
    // 如果是繁体字，先转为简体字再查找
    const simplifiedValue = simplifyText(value);
    const wuxing = wuxingMap[type]?.[simplifiedValue];
    return wuxingColor[wuxing] || '#d4af37'; // 默认金色
}

/**
 * 显示元素解释函数，确保正确匹配存储库中的键
 */
function showElementInfo(type, value) {
    if (!value) return;
    
    // 准备用于查找解释的键和显示名称
    let elementName = value;
    let displayName = value;
    
    // 根据元素类型格式化名称
    switch(type) {
        case '九星':
            elementName = '天' + simplifyText(value);
            displayName = '九星·天' + simplifyText(value);
            break;
        case '八门':
            elementName = simplifyText(value) + '门';
            displayName = '八门·' + simplifyText(value) + '门';
            break;
        case '八神':
            // 直接使用 getFullDivineName 函数来获取正确的全称
            elementName = getFullDivineName(value);
            // 显示时也使用全称，保持一致
            displayName = '八神·' + getFullDivineName(value);
            break;
        case '天干':
            displayName = '天干·' + value;
            elementName = value; // 直接使用天干的值作为键
            break;
        case '地支':
            displayName = '地支·' + value;
            elementName = value; // 直接使用地支的值作为键
            break;
        case '马星':
            displayName = '马星';
            elementName = '马星';
            break;
        case '旬空':
            displayName = '旬空';
            elementName = '旬空';
            break;
    }
    
    // 确保事件不冒泡到父元素
    event.stopPropagation();
    
    // 显示解释
    infoStore.showPalaceMeaning(elementName, displayName);
}
</script>
  
<style>
.wrapper {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 4px;
}

.wrapper-item {
    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;
    align-items: center;
    min-height: 20px;
}

/** 占位 */
.placeholder {
    visibility: hidden;
    margin: 0;
    font-size: 16px;
    min-width: 16px;
}

/* 马星位置样式 */
.horse-indicator {
    position: absolute;
}
.horse-indicator.xun {
    position: absolute;
    top: -25px;
    left: -25px;
}

.horse-indicator.kun {
    position: absolute;
    top: -25px;
    right: -25px;
}

.horse-indicator.geng {
    position: absolute;
    bottom: -25px;
    left: -25px;
}

/* 乾宫马星位置 马星应该在宫外角落上 */
.horse-indicator.qian {
    position: absolute;
    bottom: -25px;
    right: -25px;
}

.horse-info {
    margin-top: 15px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.horse-details {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.label {
    font-weight: bold;
    margin-right: 5px;
}

/* 在QimenItem组件中添加 */
.palace-item {
  position: relative;
  margin: 3px;
  transition: all 0.3s ease;
}

/* 驿马星特殊效果 */
.palace-item.yi-ma {
  color: #ffee58 !important; 
  text-shadow: 0 0 8px rgba(255, 238, 88, 0.7) !important;
  font-weight: bold !important;
  position: relative;
  z-index: 2;
}

.palace-item.yi-ma::after {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background-color: rgba(50, 40, 0, 0.3);
  border-radius: 3px;
  z-index: -1;
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

/* Add styles for clickable elements */
.gate, .star, .divine {
  cursor: pointer;
  transition: color 0.2s ease;
}

.gate:hover, .star:hover, .divine:hover {
  color: #f6e27a;
  text-shadow: 0 0 5px rgba(246, 226, 122, 0.6);
}

.clickable-element {
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    white-space: nowrap;
    font-size: 16px;
    min-width: fit-content;
    display: inline-block;
    line-height: 1.2;
    text-align: center;
    font-weight: 600;
}

.clickable-element:hover {
    color: #f6e27a !important;
    text-shadow: 0 0 5px rgba(246, 226, 122, 0.6);
    transform: scale(1.1);
}

.clickable-element::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background-color: #f6e27a;
    transition: width 0.2s ease;
}

.clickable-element:hover::after {
    width: 100%;
}

.horse-indicator {
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 20px;
    font-weight: bold;
}

.horse-indicator:hover {
    transform: scale(1.2);
    text-shadow: 0 0 8px rgba(246, 226, 122, 0.7);
}

/* 八神显示样式优化 */
.divine-name {
    font-size: 15px !important;
    letter-spacing: 1px;
    min-width: 28px;
    text-align: center;
    word-break: keep-all;
    white-space: nowrap;
    font-weight: 600;
}

/* 九星显示样式优化 */
.star-name {
    font-size: 15px !important;
    letter-spacing: 1px;
    min-width: 28px;
    text-align: center;
    word-break: keep-all;
    white-space: nowrap;
    font-weight: 600;
}

/* 八门显示样式优化 */
.gate-name {
    font-size: 16px !important;
    letter-spacing: 0.5px;
    min-width: 20px;
    text-align: center;
    font-weight: 700;
}

/* 天干显示样式优化 */
.tiangan-name {
    font-size: 18px !important;
    font-weight: 700;
    text-align: center;
    min-width: 18px;
}

/* 地支显示样式优化 */
.dizhi-name {
    font-size: 18px !important;
    font-weight: 700;
    text-align: center;
    min-width: 18px;
}


</style>
  