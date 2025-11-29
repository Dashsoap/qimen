'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { RootState } from '@/lib/store/store';
import { setPanData } from '@/lib/store/qimenSlice';
import { showPalaceInfo } from '@/lib/store/infoSlice';
import QimenItem from '@/components/QimenItem';
import MeaningModal from '@/components/MeaningModal';
import Qimen from '@/lib/qimendunjia';
import type { QimenPanData, GongViewData, Bagua } from '@/types/qimen';
import './qimen.css';

export default function QimenPage() {
  const dispatch = useDispatch();
  const { panData } = useSelector((state: RootState) => state.qimen);

  /**
   * 起盘函数（完全参考 Vue 实现）
   * Paipan function (following Vue implementation)
   * 
   * ⚠️ 关键修复：直接使用 qimen.p，不进行任何数据转换
   * 保留核心库输出的完整数据结构（繁体字段）
   */
  const paipan = () => {
    const now = dayjs();
    try {
      const qimen = new Qimen(now.year(), now.month() + 1, now.date(), now.hour());
      const data = qimen.p as QimenPanData;
      
      // 直接保存原始数据，不做任何转换（繁体字段）
      dispatch(setPanData(data));
      return data;
    } catch (error) {
      console.error('❌ 起盘失败:', error);
      return null;
    }
  };

  /**
   * 获取宫位视图数据（参考 Vue Store 实现）
   * Get palace view data (following Vue store implementation)
   * 
   * @param bagua - 八卦名称（如：坎、坤、震...）
   * @returns 宫位显示数据
   */
  const getGongViewData = (bagua: Bagua): GongViewData | null => {
    if (!panData || !panData.門) {
      return null;
    }

    try {
      return {
        name: bagua,
        八门: panData.門[bagua] || '',
        八神: panData.神[bagua] || '',
        九星: panData.星[bagua] || '',
        八卦: bagua,
        天盘: panData.天盤[0]?.[bagua] || '',
        天盘1: panData.天盤[1]?.[bagua] || '',
        地盘: panData.地盤[bagua] || '',
        暗干: panData.暗干[bagua] || '',
        馬星: panData.馬星?.驛馬 || '',  // ⚠️ 使用繁体字段
        地支: panData.地支[bagua] || [],
        旬空: panData.旬空?.時空 || ''    // ⚠️ 使用繁体字段
      };
    } catch (error) {
      console.error(`获取宫位数据失败 [${bagua}]:`, error);
      return null;
    }
  };

  /**
   * 显示宫位信息
   * Show palace information
   */
  const showPalaceInfoHandler = (palaceName: string) => {
    const bagua = palaceName.replace('宫', '') as Bagua;
    const gongData = getGongViewData(bagua);
    
    if (!gongData) {
      console.warn(`宫位数据不存在: ${palaceName}`);
      return;
    }
    
    let info = `${palaceName}信息：\n`;
    if (gongData.八神) info += `八神：${gongData.八神}\n`;
    if (gongData.九星) info += `九星：${gongData.九星}\n`;
    if (gongData.八门) info += `八门：${gongData.八门}\n`;
    if (gongData.天盘) info += `天盘：${gongData.天盘}\n`;
    if (gongData.地盘) info += `地盘：${gongData.地盘}\n`;
    if (gongData.馬星) info += `馬星：${gongData.馬星}\n`;
    
    dispatch(showPalaceInfo({ palaceName, htmlContent: info }));
  };

  // 组件挂载时起盘
  useEffect(() => {
    paipan();
  }, []);

  return (
    <div className="qimen-container">
      {panData && (
        <div className="result-section">
          <div className="data-compact">
            <div className="data-row">
              <span className="data-pair">
                <span className="data-label">干支：</span>
                <span className="data-value">{panData.干支}</span>
              </span>
              <span className="data-pair">
                <span className="data-label">節氣：</span>
                <span className="data-value">{panData.節氣}</span>
              </span>
              <span className="data-pair">
                <span className="data-label">排局：</span>
                <span className="data-value">{panData.排局}</span>
              </span>
            </div>
            {panData.旬空 && (
              <div className="data-row">
                {Object.entries(panData.旬空).map(([key, item]) => (
                  <span key={`xunkong-${key}`} className="data-pair">
                    <span className="data-label">{key}：</span>
                    <span className="data-value">{item as string}</span>
                  </span>
                ))}
              </div>
            )}
            {panData.值符值使 && (
              <div className="data-row">
                {Object.entries(panData.值符值使).map(([key, item]) => (
                  <span key={`zhifu-${key}`} className="data-pair">
                    <span className="data-label">{key}：</span>
                    <span className="data-value">{item as string}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bagua-wrapper">
        <div className="bagua-background"></div>
        <table className="qimen-table">
          <tbody>
            <tr className="row">
              <td className="col palace" data-name="巽宫" onClick={() => showPalaceInfoHandler('巽宫')}>
                <QimenItem index="四" />
              </td>
              <td className="col palace" data-name="离宫" onClick={() => showPalaceInfoHandler('离宫')}>
                <QimenItem index="九" />
              </td>
              <td className="col palace" data-name="坤宫" onClick={() => showPalaceInfoHandler('坤宫')}>
                <QimenItem index="二" />
              </td>
            </tr>
            <tr className="row">
              <td className="col palace" data-name="震宫" onClick={() => showPalaceInfoHandler('震宫')}>
                <QimenItem index="三" />
              </td>
              <td className="col palace center" data-name="中宫" onClick={() => showPalaceInfoHandler('中宫')}>
                <QimenItem index="五" />
              </td>
              <td className="col palace" data-name="兑宫" onClick={() => showPalaceInfoHandler('兑宫')}>
                <QimenItem index="七" />
              </td>
            </tr>
            <tr className="row">
              <td className="col palace" data-name="艮宫" onClick={() => showPalaceInfoHandler('艮宫')}>
                <QimenItem index="八" />
              </td>
              <td className="col palace" data-name="坎宫" onClick={() => showPalaceInfoHandler('坎宫')}>
                <QimenItem index="一" />
              </td>
              <td className="col palace" data-name="乾宫" onClick={() => showPalaceInfoHandler('乾宫')}>
                <QimenItem index="六" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <MeaningModal />
    </div>
  );
}
