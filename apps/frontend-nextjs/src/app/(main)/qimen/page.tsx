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
import Config from '@/lib/qimendunjia/config';
import './qimen.css';

export default function QimenPage() {
  const dispatch = useDispatch();
  const { panData } = useSelector((state: RootState) => state.qimen);

  // 起盘函数
  const paipan = () => {
    const now = dayjs();
    try {
      const qimen = new Qimen(now.year(), now.month() + 1, now.date(), now.hour());
      const data = qimen.p;
      
      const formattedData: any = {
        ...data,
        干支: `${data.干支1?.年}年 ${data.干支1?.月}月 ${data.干支1?.日}日 ${data.干支1?.時}时`,
        節氣: data.節氣,
        排局: data.排局,
        旬空: data.旬空,
        值符值使: data.值符值使,
        gongs: []
      };

      const gongsCode = Config.gongs_code || {
        '一': '坎', '二': '坤', '三': '震', '四': '巽', '五': '中',
        '六': '乾', '七': '兑', '八': '艮', '九': '离'
      };

      for (const [index, gongName] of Object.entries(gongsCode)) {
        const gongData = {
          name: gongName,
          index: index,
          暗干: data.暗干?.[gongName] || '',
          八神: data.神?.[gongName] || '',
          九星: data.星?.[gongName] || '',
          八门: data.門?.[gongName] || '',
          天盘: data.天盤?.[0]?.[gongName] || '',
          天盘1: data.天盤?.[1]?.[gongName] || '',
          地盘: data.地盤?.[gongName] || '',
          旬空: data.旬空?.時空 || '',
          马星: data.马星?.驿马 || ''
        };
        formattedData.gongs.push(gongData);
      }
      
      console.log('完整起盘数据:', formattedData);
      dispatch(setPanData(formattedData));
      return formattedData;
    } catch (error) {
      console.error('起盘失败:', error);
      return null;
    }
  };

  // 显示宫位信息
  const showPalaceInfoHandler = (palaceName: string) => {
    const bagua = palaceName.replace('宫', '');
    
    let gongData: any = {};
    if (panData && panData.gongs) {
      const gong = panData.gongs.find((g: any) => g.name === bagua);
      if (gong) {
        gongData = gong;
      }
    }
    
    let info = `${palaceName}信息：\n`;
    if (gongData.八神) info += `八神：${gongData.八神}\n`;
    if (gongData.九星) info += `九星：${gongData.九星}\n`;
    if (gongData.八门) info += `八门：${gongData.八门}\n`;
    
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
              <td className="col palace" data-name="坎宫" onClick={() => showPalaceInfoHandler('坎宫')}>
                <QimenItem index="四" />
              </td>
              <td className="col palace" data-name="艮宫" onClick={() => showPalaceInfoHandler('艮宫')}>
                <QimenItem index="九" />
              </td>
              <td className="col palace" data-name="震宫" onClick={() => showPalaceInfoHandler('震宫')}>
                <QimenItem index="二" />
              </td>
            </tr>
            <tr className="row">
              <td className="col palace" data-name="坤宫" onClick={() => showPalaceInfoHandler('坤宫')}>
                <QimenItem index="三" />
              </td>
              <td className="col palace center" data-name="中宫" onClick={() => showPalaceInfoHandler('中宫')}>
                <QimenItem index="五" />
              </td>
              <td className="col palace" data-name="巽宫" onClick={() => showPalaceInfoHandler('巽宫')}>
                <QimenItem index="七" />
              </td>
            </tr>
            <tr className="row">
              <td className="col palace" data-name="兑宫" onClick={() => showPalaceInfoHandler('兑宫')}>
                <QimenItem index="八" />
              </td>
              <td className="col palace" data-name="乾宫" onClick={() => showPalaceInfoHandler('乾宫')}>
                <QimenItem index="一" />
              </td>
              <td className="col palace" data-name="离宫" onClick={() => showPalaceInfoHandler('离宫')}>
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
