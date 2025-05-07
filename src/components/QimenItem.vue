<template>
    <div class="wrapper">
        <div class="wrapper-item">
            <span>{{ viewData.暗干 }}</span>
            <span>{{ viewData.八神 }}</span>
            <span class="placeholder">空</span>
        </div>
        <div class="wrapper-item">
            <span class="placeholder">空 </span>
            <span :style="{ color: getFontColor('九星', viewData.九星) }">{{ simplifyText(viewData.九星) }}</span>
            <span class="placeholder">空</span>
        </div>
        <div class="wrapper-item">
            <span class="placeholder">空</span>
            <span class="placeholder">空</span>
            <span v-if="viewData.八门" :style="{ color: getFontColor('八门', viewData.八门) }">{{ simplifyText(viewData.八门) }}</span>
            <span class="placeholder" v-if="!viewData.天盘1">空</span>
            <span v-if="viewData.天盘1" :style="{ color: getFontColor('天干', viewData.天盘1) }">{{ viewData.天盘1 }}</span>
            <span :style="{ color: getFontColor('天干', viewData.天盘) }">{{ viewData.天盘 }}</span>

        </div>
        <div class="wrapper-item">
            <span class="placeholder">符</span>
            <span v-if="getKongWang(viewData)" class="kong-indicator">{{ getKongWang(viewData) }}</span>
            <span :style="{ color: getFontColor('天干', viewData.地盘) }">{{ viewData.地盘 }}</span>
        </div>
        <!-- 马星指示器 -->
         <span v-if="formatHorseInfo(viewData)" :class="['horse-indicator', getHorseIndicatorPosition()]">{{ formatHorseInfo(viewData) }}</span>
    </div>
    <!-- 添加马星信息展示部分 -->
    <div class="qimen-item">
        <!-- 示例结构 -->
        <span class="qimen-char gong-name" v-if="gongName">{{ gongName }}</span>
        <span class="qimen-char tian-gan" v-if="tianGan">{{ tianGan }}</span>
        <span class="qimen-char di-zhi" v-if="diZhi">{{ diZhi }}</span>
        <span class="qimen-char shen-sha" v-if="shenSha">{{ shenSha }}</span>
        <span class="qimen-char star" v-if="star">{{ star }}</span>
        <span class="qimen-char men" v-if="men">{{ men }}</span>
    </div>
</template>

<script setup>
import { computed, defineProps, reactive } from "vue";
import { useQimenStore } from "../stores/index";
import Config from "../qimendunjia/config";
const props = defineProps(
    { index: String }
);

// 奇门盘数据
const store = useQimenStore()
const index = props.index;

// 获取当前八卦方位
const bagua = Config.gongs_code[index];
const viewData =  store.getGongViewData(bagua);
const dizhi_pan = {
      '坎': ['子'],
      '艮': ['丑', '寅'],
      '震': ['卯'],
      '巽': ['辰', '巳'],
      '離': ['午'],
      '坤': ['未', '申'],
      '兌': ['酉'],
      '乾': ['戌', '亥']
    }
// 格式化马星信息
function formatHorseInfo(horseInfo) {
    // console.log(horseInfo)
    const ma = horseInfo['馬星']
    if(!ma || !dizhi_pan[bagua]) return ''
    return dizhi_pan[bagua].includes(ma) ? '🐎' :''
}

function getKongWang(viewData){
    const kongwang = viewData['旬空']
    if(!kongwang || !dizhi_pan[bagua]) return ''
    const kongwang_list = kongwang.split('')
    // 如果dizhi包含kongwanglist中的一个则返回空
    if (dizhi_pan[bagua].some(dizhi => kongwang_list.includes(dizhi))) {
        return 'O'
    }
    return ''
}
function getHorseIndicatorPosition(){
    if(bagua) {
        if(bagua=='乾') return 'qian'
        if(bagua=='坤') return 'kun'
        if(bagua=='艮') return 'geng'
        if(bagua=='巽') return 'xun'
    }
    return ''
}

// 五行颜色对照表
const wuxingColor = {
    金: '#f28413',
    木: '#167318',
    水: '#08059c',
    火: '#bf403a',
    土: '#87561e',
};
console.log(index,viewData)
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
    "空亡宫": "空亡宫",
    "空亡": "空亡",
    // 其他可能需要转换的字符
};

// 繁体字转简体字函数
function simplifyText(text) {
    if (!text) return text;
    return traditionalToSimplified[text] || text;
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
    八神: {},
    九星: {
        "蓬": '水',
        "芮": '土',
        "冲": '木',
        "辅": '木',
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
    }
}

/**
 * 根据类型和符号获取五行对应的颜色
 * @param {*} type 类型：八门、九星、天干 
 * @param {*} value 值
 */
function getFontColor(type, value) {
    // 如果是繁体字，先转为简体字再查找
    const simplifiedValue = simplifyText(value);
    const wuxing = wuxingMap[type][simplifiedValue];
    return wuxingColor[wuxing];
}
</script>
  
<style>
.wrapper {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.wrapper-item {
    display: flex;
    justify-content: space-between;
}

/** 占位 */
.placeholder {
    visibility: hidden;
    margin: 0;
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
</style>
  