'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { showPalaceMeaning } from '@/lib/store/infoSlice';
import Config from '@/lib/qimendunjia/config';
import './QimenItem.css';

interface QimenItemProps {
  index: string;
}

const QimenItem = forwardRef<any, QimenItemProps>(({ index }, ref) => {
  const dispatch = useDispatch();
  const { panData } = useSelector((state: RootState) => state.qimen);

  const bagua = Config.gongs_code[index];
  const dizhi_pan: Record<string, string[]> = {
    '坎': ['子'],
    '艮': ['丑', '寅'],
    '震': ['卯'],
    '巽': ['辰', '巳'],
    '离': ['午'],
    '坤': ['未', '申'],
    '兑': ['酉'],
    '乾': ['戌', '亥']
  };

  const getGongViewData = (bagua: string) => {
    if (!panData || !panData.gongs) return {};
    return panData.gongs.find((g: any) => g.name === bagua) || {};
  };

  const viewData: any = getGongViewData(bagua);

  const wuxingColor: Record<string, string> = {
    金: '#f28413',
    木: '#167318',
    水: '#4499ff',
    火: '#bf403a',
    土: '#87561e',
  };

  const wuxingMap: Record<string, Record<string, string>> = {
    八门: {
      "休": '水', "死": '土', "伤": '木', "杜": '木',
      "开": '金', "惊": '金', "生": '土', "景": '火',
    },
    八神: {
      "符": '土', "蛇": '火', "阴": '金', "合": '木',
      "虎": '金', "武": '水', "玄": '水', "地": '金', "天": '金',
    },
    九星: {
      "蓬": '水', "芮": '土', "冲": '木', "辅": '土',
      "禽": '土', "心": '金', "柱": '金', "任": '土', "英": '火',
    },
    天干: {
      甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
      己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
    },
    地支: {
      "子": '水', "丑": '土', "寅": '木', "卯": '木',
      "辰": '土', "巳": '火', "午": '火', "未": '土',
      "申": '金', "酉": '金', "戌": '土', "亥": '水',
    }
  };

  const traditionalToSimplified: Record<string, string> = {
    "休": "休", "死": "死", "伤": "伤", "杜": "杜",
    "开": "开", "惊": "惊", "生": "生", "景": "景",
    "蓬": "蓬", "芮": "芮", "冲": "冲", "辅": "辅",
    "禽": "禽", "心": "心", "柱": "柱", "任": "任", "英": "英",
    "马": "马", "天马": "天马", "丁马": "丁马", "驿马": "驿马",
    "空亡宫": "空亡宫", "空亡": "空亡",
  };

  const formatHorseInfo = (horseInfo: any) => {
    const ma = horseInfo['马星'];
    if (!ma || !dizhi_pan[bagua]) return '';
    return dizhi_pan[bagua].includes(ma) ? '🐎' : '';
  };

  const getKongWang = (viewData: any) => {
    const kongwang = viewData['旬空'];
    if (!kongwang || !dizhi_pan[bagua]) return '';
    const kongwang_list = kongwang.split('');
    if (dizhi_pan[bagua].some(dizhi => kongwang_list.includes(dizhi))) {
      return 'O';
    }
    return '';
  };

  const getHorseIndicatorPosition = () => {
    if (bagua === '乾') return 'qian';
    if (bagua === '坤') return 'kun';
    if (bagua === '艮') return 'geng';
    if (bagua === '巽') return 'xun';
    return '';
  };

  const simplifyText = (text: string) => {
    if (!text) return text;
    return traditionalToSimplified[text] || text;
  };

  const getFullDivineName = (shortName: string) => {
    const divineMappings: Record<string, string> = {
      '符': '值符', '蛇': '腾蛇', '阴': '太阴', '合': '六合',
      '虎': '白虎', '武': '玄武', '玄': '玄武', '地': '九地', '天': '九天',
      '太阴': '太阴', '六合': '六合', '白虎': '白虎', '玄武': '玄武',
      '九地': '九地', '九天': '九天', '值符': '值符', '腾蛇': '腾蛇'
    };
    return divineMappings[shortName] || shortName;
  };

  const getFullStarName = (shortName: string) => {
    const starMappings: Record<string, string> = {
      '蓬': '天蓬', '芮': '天芮', '冲': '天冲', '辅': '天辅',
      '禽': '天禽', '心': '天心', '柱': '天柱', '任': '天任', '英': '天英'
    };
    const simplified = simplifyText(shortName);
    return starMappings[simplified] || shortName;
  };

  const getFontColor = (type: string, value: string) => {
    const simplifiedValue = simplifyText(value);
    const wuxing = wuxingMap[type]?.[simplifiedValue];
    return wuxingColor[wuxing] || '#d4af37';
  };

  const showElementInfo = (type: string, value: string, event: React.MouseEvent) => {
    if (!value) return;
    event.stopPropagation();
    
    let elementName = value;
    let displayName = value;
    
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
        elementName = getFullDivineName(value);
        displayName = '八神·' + getFullDivineName(value);
        break;
      case '天干':
        displayName = '天干·' + value;
        elementName = value;
        break;
      case '地干':
        displayName = '地干·' + value;
        elementName = value;
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
    
    dispatch(showPalaceMeaning({ palaceName: elementName, customDisplayName: displayName }));
  };

  useImperativeHandle(ref, () => ({}));

  if (!viewData) return <div className="wrapper"></div>;

  return (
    <div className="wrapper">
      <div className="wrapper-item">
        {viewData.暗干 && (
          <span 
            className="clickable-element tiangan-name" 
            onClick={(e) => showElementInfo('天干', viewData.暗干, e)}
          >
            {viewData.暗干}
          </span>
        )}
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
        {viewData.九星 && (
          <span 
            className="clickable-element star-name" 
            style={{ color: getFontColor('九星', viewData.九星) }}
            onClick={(e) => showElementInfo('九星', viewData.九星, e)}
          >
            {getFullStarName(viewData.九星)}
          </span>
        )}
        <span className="placeholder">空</span>
      </div>
      <div className="wrapper-item">
        <span className="placeholder">空</span>
        <span className="placeholder">空</span>
        {viewData.八门 && (
          <span 
            className="clickable-element gate-name" 
            style={{ color: getFontColor('八门', viewData.八门) }}
            onClick={(e) => showElementInfo('八门', viewData.八门, e)}
          >
            {simplifyText(viewData.八门)}
          </span>
        )}
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
        {viewData.天盘 && (
          <span 
            className="clickable-element tiangan-name" 
            style={{ color: getFontColor('天干', viewData.天盘) }}
            onClick={(e) => showElementInfo('天干', viewData.天盘, e)}
          >
            {viewData.天盘}
          </span>
        )}
      </div>
      <div className="wrapper-item">
        <span className="placeholder">符</span>
        {getKongWang(viewData) && (
          <span 
            className="kong-indicator clickable-element"
            style={{ fontSize: '18px', fontWeight: '700' }}
            onClick={(e) => showElementInfo('旬空', '旬空', e)}
          >
            {getKongWang(viewData)}
          </span>
        )}
        {viewData.地盘 && (
          <span 
            className="clickable-element tiangan-name" 
            style={{ color: getFontColor('天干', viewData.地盘) }}
            onClick={(e) => showElementInfo('地干', viewData.地盘, e)}
          >
            {viewData.地盘}
          </span>
        )}
      </div>
      {formatHorseInfo(viewData) && (
        <span 
          className={`horse-indicator ${getHorseIndicatorPosition()}`}
          onClick={(e) => showElementInfo('马星', '马星', e)}
        >
          {formatHorseInfo(viewData)}
        </span>
      )}
    </div>
  );
});

QimenItem.displayName = 'QimenItem';

export default QimenItem;

