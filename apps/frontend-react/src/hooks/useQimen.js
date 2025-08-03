import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  startQimenGame,
  analyzeQimenResult,
  clearCurrentGame,
  setSelectedPalace,
  setHighlightedElements,
  toggleAnalysisPanel,
  toggleHistoryPanel,
  updateSettings,
  addToHistory,
  deleteHistoryRecord,
  clearHistory,
  clearError
} from '../stores/qimenSlice';

/**
 * 奇门遁甲相关的自定义Hook
 */
export const useQimen = () => {
  const dispatch = useDispatch();
  const qimen = useSelector((state) => state.qimen);

  // 起局
  const startGame = useCallback(async (params) => {
    try {
      const result = await dispatch(startQimenGame(params)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // 分析结果
  const analyzeResult = useCallback(async (qimenData) => {
    try {
      const result = await dispatch(analyzeQimenResult(qimenData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // 清除当前局
  const clearGame = useCallback(() => {
    dispatch(clearCurrentGame());
  }, [dispatch]);

  // 选择宫位
  const selectPalace = useCallback((palace) => {
    dispatch(setSelectedPalace(palace));
  }, [dispatch]);

  // 设置高亮元素
  const highlightElements = useCallback((elements) => {
    dispatch(setHighlightedElements(elements));
  }, [dispatch]);

  // 切换分析面板
  const toggleAnalysis = useCallback(() => {
    dispatch(toggleAnalysisPanel());
  }, [dispatch]);

  // 切换历史面板
  const toggleHistory = useCallback(() => {
    dispatch(toggleHistoryPanel());
  }, [dispatch]);

  // 更新设置
  const updateGameSettings = useCallback((settings) => {
    dispatch(updateSettings(settings));
  }, [dispatch]);

  // 添加历史记录
  const addHistoryRecord = useCallback((record) => {
    dispatch(addToHistory(record));
  }, [dispatch]);

  // 删除历史记录
  const deleteHistory = useCallback((id) => {
    dispatch(deleteHistoryRecord(id));
  }, [dispatch]);

  // 清空历史记录
  const clearAllHistory = useCallback(() => {
    dispatch(clearHistory());
  }, [dispatch]);

  // 清除错误
  const clearGameError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // 状态
    currentGame: qimen.currentGame,
    history: qimen.history,
    analysis: qimen.analysis,
    loading: qimen.loading,
    error: qimen.error,
    settings: qimen.settings,
    ui: qimen.ui,
    
    // 方法
    startGame,
    analyzeResult,
    clearGame,
    selectPalace,
    highlightElements,
    toggleAnalysis,
    toggleHistory,
    updateGameSettings,
    addHistoryRecord,
    deleteHistory,
    clearAllHistory,
    clearGameError,
  };
};