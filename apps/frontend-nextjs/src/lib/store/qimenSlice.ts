import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { QimenPanData } from '@/types/qimen';

// 辅助函数：安全地访问 localStorage
const getStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeStorageItem = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// 异步thunk：起局
export const startQimenGame = createAsyncThunk(
  'qimen/startGame',
  async ({ date, hour, method = 'auto' }: any, { rejectWithValue }) => {
    try {
      // 在客户端动态导入 Qimen
      if (typeof window !== 'undefined') {
        const Qimen = (await import('@/lib/qimendunjia')).default;
        const qimen = new Qimen(date.year, date.month, date.day, hour);
        const result = qimen.qimen_ju_name();
        return {
          result,
          timestamp: Date.now(),
          inputParams: { date, hour, method }
        };
      }
      throw new Error('只能在客户端起局');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 异步thunk：解析奇门局
export const analyzeQimenResult = createAsyncThunk(
  'qimen/analyze',
  async (qimenData: any, { rejectWithValue }) => {
    try {
      const analysis = {
        summary: '奇门遁甲局分析结果',
        details: qimenData,
        recommendations: [],
        timestamp: Date.now()
      };
      return analysis;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Qimen Redux State
 * ⚠️ panData 使用 QimenPanData 类型（繁体字段）
 */
interface QimenState {
  panData: QimenPanData | null;  // ⚠️ 修复：使用正确的类型
  currentGame: any | null;
  history: any[];
  analysis: any | null;
  loading: boolean;
  error: string | null;
  settings: {
    method: 'auto' | 'manual';
    displayMode: '2d' | '3d';
    showDetails: boolean;
    autoSave: boolean;
  };
  ui: {
    selectedPalace: string | null;
    highlightedElements: string[];
    showAnalysisPanel: boolean;
    showHistoryPanel: boolean;
  };
}

const initialState: QimenState = {
  panData: null,
  currentGame: null,
  history: [],
  analysis: null,
  loading: false,
  error: null,
  settings: {
    method: 'auto',
    displayMode: '3d',
    showDetails: true,
    autoSave: true,
  },
  ui: {
    selectedPalace: null,
    highlightedElements: [],
    showAnalysisPanel: false,
    showHistoryPanel: false,
  }
};

const qimenSlice = createSlice({
  name: 'qimen',
  initialState,
  reducers: {
    /**
     * 设置排盘数据
     * ⚠️ 修复：接收 QimenPanData 类型（繁体字段）
     */
    setPanData: (state, action: PayloadAction<QimenPanData>) => {
      state.panData = action.payload;
    },
    clearPanData: (state) => {
      state.panData = null;
    },
    clearCurrentGame: (state) => {
      state.currentGame = null;
      state.analysis = null;
      state.error = null;
    },
    setSelectedPalace: (state, action: PayloadAction<string | null>) => {
      state.ui.selectedPalace = action.payload;
    },
    setHighlightedElements: (state, action: PayloadAction<string[]>) => {
      state.ui.highlightedElements = action.payload;
    },
    toggleAnalysisPanel: (state) => {
      state.ui.showAnalysisPanel = !state.ui.showAnalysisPanel;
    },
    toggleHistoryPanel: (state) => {
      state.ui.showHistoryPanel = !state.ui.showHistoryPanel;
    },
    updateSettings: (state, action: PayloadAction<Partial<QimenState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
      setStorageItem('qimen-settings', JSON.stringify(state.settings));
    },
    loadSettingsFromStorage: (state) => {
      const savedSettings = getStorageItem('qimen-settings');
      if (savedSettings) {
        state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
      }
    },
    addToHistory: (state, action: PayloadAction<any>) => {
      const newRecord = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString()
      };
      state.history.unshift(newRecord);
      
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
      
      if (state.settings.autoSave) {
        setStorageItem('qimen-history', JSON.stringify(state.history));
      }
    },
    loadHistoryFromStorage: (state) => {
      const savedHistory = getStorageItem('qimen-history');
      if (savedHistory) {
        state.history = JSON.parse(savedHistory);
      }
    },
    deleteHistoryRecord: (state, action: PayloadAction<number>) => {
      state.history = state.history.filter(record => record.id !== action.payload);
      setStorageItem('qimen-history', JSON.stringify(state.history));
    },
    clearHistory: (state) => {
      state.history = [];
      removeStorageItem('qimen-history');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startQimenGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startQimenGame.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGame = action.payload;
        state.error = null;
        
        if (state.settings.autoSave) {
          const historyRecord = {
            result: action.payload.result,
            inputParams: action.payload.inputParams,
            timestamp: action.payload.timestamp
          };
          qimenSlice.caseReducers.addToHistory(state, { payload: historyRecord, type: 'qimen/addToHistory' });
        }
      })
      .addCase(startQimenGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || '起局失败';
      })
      .addCase(analyzeQimenResult.pending, (state) => {
        state.loading = true;
      })
      .addCase(analyzeQimenResult.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
      })
      .addCase(analyzeQimenResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || '分析失败';
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

