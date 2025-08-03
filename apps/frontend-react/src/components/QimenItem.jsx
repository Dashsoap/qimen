import React, { forwardRef, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { showPalaceMeaning } from '../stores/infoSlice';
import Config from '../qimendunjia/config';
import './QimenItem.css';

const QimenItem = forwardRef(({ index }, ref) => {
  const dispatch = useDispatch();
  const { panData } = useSelector(state => state.qimen);

  const bagua = Config.gongs_code[index];
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

  // 获取当前宫位的数据
  const getGongViewData = (bagua) => {
    if (!panData || !panData.gongs) return {};
    
    // 在panData.gongs中查找对应八卦的数据
    for (const gong of panData.gongs) {
      if (gong.name === bagua) {
        return gong;
      }
    }
    return {};
  };

  const viewData = getGongViewData(bagua);

  // 五行颜色对照表
  const wuxingColor = {
    金: '#f28413',
    木: '#167318',
    水: '#4499ff',
    火: '#bf403a',
    土: '#87561e',
  };

  // 五行映射 - 1:1复刻Vue版本
  const wuxingMap = {
    八门: {
      "休": '水',
      "死": '土',
      "傷": '木',
      "杜": '木',
      "開": '金',
      "驚": '金',
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
      "玄": '水',  // 处理数据源是"玄"的情况
      "地": '金',
      "天": '金',
    },
    九星: {
      "蓬": '水',
      "芮": '土',
      "沖": '木',
      "輔": '土',
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

  // 繁体字转简体字映射 - 1:1复刻Vue版本
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

  // 格式化马星信息 - 1:1复刻Vue版本
  const formatHorseInfo = (horseInfo) => {
    const ma = horseInfo['馬星'];
    if (!ma || !dizhi_pan[bagua]) return '';
    return dizhi_pan[bagua].includes(ma) ? '🐎' : '';
  };

  // 获取旬空信息 - 1:1复刻Vue版本  
  const getKongWang = (viewData) => {
    const kongwang = viewData['旬空'];
    if (!kongwang || !dizhi_pan[bagua]) return '';
    const kongwang_list = kongwang.split('');
    // 如果dizhi包含kongwanglist中的一个则返回空
    if (dizhi_pan[bagua].some(dizhi => kongwang_list.includes(dizhi))) {
      return 'O';
    }
    return '';
  };

  // 获取马星位置样式 - 1:1复刻Vue版本
  const getHorseIndicatorPosition = () => {
    if (bagua) {
      if (bagua === '乾') return 'qian';
      if (bagua === '坤') return 'kun';
      if (bagua === '艮') return 'geng';
      if (bagua === '巽') return 'xun';
    }
    return '';
  };

  // 简化文本（繁体转简体） - 1:1复刻Vue版本
  const simplifyText = (text) => {
    if (!text) return text;
    return traditionalToSimplified[text] || text;
  };

  // 八神简称到全称的显示映射 - 1:1复刻Vue版本
  const getFullDivineName = (shortName) => {
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
  };

  // 九星简称到全称的显示映射 - 1:1复刻Vue版本
  const getFullStarName = (shortName) => {
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
  };

  // 获取字体颜色 - 1:1复刻Vue版本
  const getFontColor = (type, value) => {
    // 如果是繁体字，先转为简体字再查找
    const simplifiedValue = simplifyText(value);
    const wuxing = wuxingMap[type]?.[simplifiedValue];
    return wuxingColor[wuxing] || '#d4af37'; // 默认金色
  };

  // 显示元素解释函数 - 1:1复刻Vue版本
  const showElementInfo = (type, value, event) => {
    if (!value) return;
    
    // 阻止事件冒泡
    if (event) {
      event.stopPropagation();
    }
    
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
    
    // 显示解释
    dispatch(showPalaceMeaning({ palaceName: elementName, customDisplayName: displayName }));
  };

  useImperativeHandle(ref, () => ({
    // 暴露给父组件的方法
  }));

  if (!viewData) return <div className="wrapper"></div>;

  return (
    <div className="wrapper">
      <div className="wrapper-item">
        {viewData.暗干 ? (
          <span 
            className="clickable-element tiangan-name" 
            onClick={(e) => showElementInfo('天干', viewData.暗干, e)}
          >
            {viewData.暗干}
          </span>
        ) : null}
        {viewData.八神 ? (
          <span 
            className="clickable-element divine-name" 
            onClick={(e) => showElementInfo('八神', viewData.八神, e)}
          >
            {getFullDivineName(viewData.八神)}
          </span>
        ) : (
          <span className="placeholder">空</span>
        )}
      </div>
      <div className="wrapper-item">
        <span className="placeholder">空 </span>
        {viewData.九星 ? (
          <span 
            className="clickable-element star-name" 
            style={{ color: getFontColor('九星', viewData.九星) }}
            onClick={(e) => showElementInfo('九星', viewData.九星, e)}
          >
            {getFullStarName(viewData.九星)}
          </span>
        ) : null}
        <span className="placeholder">空</span>
      </div>
      <div className="wrapper-item">
        <span className="placeholder">空</span>
        <span className="placeholder">空</span>
        {viewData.八门 ? (
          <span 
            className="clickable-element gate-name" 
            style={{ color: getFontColor('八门', viewData.八门) }}
            onClick={(e) => showElementInfo('八门', viewData.八门, e)}
          >
            {simplifyText(viewData.八门)}
          </span>
        ) : null}
        {!viewData.天盘1 ? (
          <span className="placeholder">空</span>
        ) : (
          <span 
            className="clickable-element tiangan-name" 
            style={{ color: getFontColor('天干', viewData.天盘1) }}
            onClick={(e) => showElementInfo('天干', viewData.天盘1, e)}
          >
            {viewData.天盘1}
          </span>
        )}
        {viewData.天盘 ? (
          <span 
            className="clickable-element tiangan-name" 
            style={{ color: getFontColor('天干', viewData.天盘) }}
            onClick={(e) => showElementInfo('天干', viewData.天盘, e)}
          >
            {viewData.天盘}
          </span>
        ) : null}
      </div>
      <div className="wrapper-item">
        <span className="placeholder">符</span>
        {getKongWang(viewData) ? (
          <span 
            className="kong-indicator clickable-element"
            style={{ fontSize: '18px', fontWeight: '700' }}
            onClick={(e) => showElementInfo('旬空', '旬空', e)}
          >
            {getKongWang(viewData)}
          </span>
        ) : null}
        {viewData.地盘 ? (
          <span 
            className="clickable-element dizhi-name" 
            style={{ color: getFontColor('地支', viewData.地盘) }}
            onClick={(e) => showElementInfo('地支', viewData.地盘, e)}
          >
            {viewData.地盘}
          </span>
        ) : null}
      </div>
      {/* 马星指示器 - 1:1复刻Vue版本 */}
      {formatHorseInfo(viewData) ? (
        <span 
          className={`horse-indicator ${getHorseIndicatorPosition()}`}
          onClick={(e) => showElementInfo('马星', '马星', e)}
        >
          {formatHorseInfo(viewData)}
        </span>
      ) : null}
    </div>
  );
});

QimenItem.displayName = 'QimenItem';

export default QimenItem; 