import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Qimen from '../qimendunjia/index.js';

// 异步thunk：起局
export const startQimenGame = createAsyncThunk(
  'qimen/startGame',
  async ({ date, hour, method = 'auto' }, { rejectWithValue }) => {
    try {
      const qimen = new Qimen(date.year, date.month, date.day, hour);
      const result = qimen.qimen_ju_name(); // 调用相应的方法
      return {
        result,
        timestamp: Date.now(),
        inputParams: { date, hour, method }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步thunk：解析奇门局
export const analyzeQimenResult = createAsyncThunk(
  'qimen/analyze',
  async (qimenData, { rejectWithValue }) => {
    try {
      // 这里可以添加更复杂的分析逻辑
      const analysis = {
        summary: '奇门遁甲局分析结果',
        details: qimenData,
        recommendations: [],
        timestamp: Date.now()
      };
      return analysis;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // 排盘数据 (新增)
  panData: null,
  
  // 当前奇门局数据
  currentGame: null,
  
  // 历史记录
  history: [],
  
  // 分析结果
  analysis: null,
  
  // 加载状态
  loading: false,
  
  // 错误信息
  error: null,
  
  // 设置选项
  settings: {
    method: 'auto', // 起局方法：auto, manual
    displayMode: '3d', // 显示模式：2d, 3d
    showDetails: true, // 显示详细信息
    autoSave: true, // 自动保存
  },
  
  // UI状态
  ui: {
    selectedPalace: null, // 选中的宫位
    highlightedElements: [], // 高亮的元素
    showAnalysisPanel: false, // 显示分析面板
    showHistoryPanel: false, // 显示历史面板
  }
};

const qimenSlice = createSlice({
  name: 'qimen',
  initialState,
  reducers: {
    // 设置排盘数据 (新增)
    setPanData: (state, action) => {
      state.panData = action.payload;
    },
    
    // 清除排盘数据 (新增)
    clearPanData: (state) => {
      state.panData = null;
    },
    
    // 清除当前局
    clearCurrentGame: (state) => {
      state.currentGame = null;
      state.analysis = null;
      state.error = null;
    },
    
    // 设置选中的宫位
    setSelectedPalace: (state, action) => {
      state.ui.selectedPalace = action.payload;
    },
    
    // 设置高亮元素
    setHighlightedElements: (state, action) => {
      state.ui.highlightedElements = action.payload;
    },
    
    // 切换分析面板
    toggleAnalysisPanel: (state) => {
      state.ui.showAnalysisPanel = !state.ui.showAnalysisPanel;
    },
    
    // 切换历史面板
    toggleHistoryPanel: (state) => {
      state.ui.showHistoryPanel = !state.ui.showHistoryPanel;
    },
    
    // 更新设置
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
      // 保存到localStorage
      localStorage.setItem('qimen-settings', JSON.stringify(state.settings));
    },
    
    // 从localStorage加载设置
    loadSettingsFromStorage: (state) => {
      const savedSettings = localStorage.getItem('qimen-settings');
      if (savedSettings) {
        state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
      }
    },
    
    // 添加到历史记录
    addToHistory: (state, action) => {
      const newRecord = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString()
      };
      state.history.unshift(newRecord);
      
      // 限制历史记录数量
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
      
      // 自动保存到localStorage
      if (state.settings.autoSave) {
        localStorage.setItem('qimen-history', JSON.stringify(state.history));
      }
    },
    
    // 从localStorage加载历史记录
    loadHistoryFromStorage: (state) => {
      const savedHistory = localStorage.getItem('qimen-history');
      if (savedHistory) {
        state.history = JSON.parse(savedHistory);
      }
    },
    
    // 删除历史记录
    deleteHistoryRecord: (state, action) => {
      state.history = state.history.filter(record => record.id !== action.payload);
      localStorage.setItem('qimen-history', JSON.stringify(state.history));
    },
    
    // 清空历史记录
    clearHistory: (state) => {
      state.history = [];
      localStorage.removeItem('qimen-history');
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // 起局相关
      .addCase(startQimenGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startQimenGame.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGame = action.payload;
        state.error = null;
        
        // 自动添加到历史记录
        if (state.settings.autoSave) {
          const historyRecord = {
            result: action.payload.result,
            inputParams: action.payload.inputParams,
            timestamp: action.payload.timestamp
          };
          qimenSlice.caseReducers.addToHistory(state, { payload: historyRecord });
        }
      })
      .addCase(startQimenGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '起局失败';
      })
      
      // 分析相关
      .addCase(analyzeQimenResult.pending, (state) => {
        state.loading = true;
      })
      .addCase(analyzeQimenResult.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
      })
      .addCase(analyzeQimenResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '分析失败';
      });
  }
});

export const {
  setPanData,
  clearPanData,
  clearCurrentGame,
  setSelectedPalace,
  setHighlightedElements,
  toggleAnalysisPanel,
  toggleHistoryPanel,
  updateSettings,
  loadSettingsFromStorage,
  addToHistory,
  loadHistoryFromStorage,
  deleteHistoryRecord,
  clearHistory,
  clearError
} = qimenSlice.actions;

export default qimenSlice.reducer;