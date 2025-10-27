import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface ThemeState {
  isDarkMode: boolean;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  animations: boolean;
  soundEffects: boolean;
}

const initialState: ThemeState = {
  isDarkMode: true, // 默认深色主题
  primaryColor: 'blue', // 主色调
  fontSize: 'medium', // 字体大小
  language: 'zh-CN', // 语言设置
  animations: true, // 动画开关
  soundEffects: true, // 音效开关
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      setStorageItem('theme-darkMode', JSON.stringify(state.isDarkMode));
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
      setStorageItem('theme-primaryColor', action.payload);
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
      setStorageItem('theme-fontSize', action.payload);
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      setStorageItem('theme-language', action.payload);
    },
    toggleAnimations: (state) => {
      state.animations = !state.animations;
      setStorageItem('theme-animations', JSON.stringify(state.animations));
    },
    toggleSoundEffects: (state) => {
      state.soundEffects = !state.soundEffects;
      setStorageItem('theme-soundEffects', JSON.stringify(state.soundEffects));
    },
    loadThemeFromStorage: (state) => {
      // 从localStorage加载主题设置
      const darkMode = getStorageItem('theme-darkMode');
      const primaryColor = getStorageItem('theme-primaryColor');
      const fontSize = getStorageItem('theme-fontSize');
      const language = getStorageItem('theme-language');
      const animations = getStorageItem('theme-animations');
      const soundEffects = getStorageItem('theme-soundEffects');

      if (darkMode !== null) {
        state.isDarkMode = JSON.parse(darkMode);
      }
      if (primaryColor) {
        state.primaryColor = primaryColor;
      }
      if (fontSize) {
        state.fontSize = fontSize as 'small' | 'medium' | 'large';
      }
      if (language) {
        state.language = language;
      }
      if (animations !== null) {
        state.animations = JSON.parse(animations);
      }
      if (soundEffects !== null) {
        state.soundEffects = JSON.parse(soundEffects);
      }
    },
    resetTheme: (state) => {
      // 重置为默认主题
      state.isDarkMode = true;
      state.primaryColor = 'blue';
      state.fontSize = 'medium';
      state.language = 'zh-CN';
      state.animations = true;
      state.soundEffects = true;
      
      // 清除localStorage
      removeStorageItem('theme-darkMode');
      removeStorageItem('theme-primaryColor');
      removeStorageItem('theme-fontSize');
      removeStorageItem('theme-language');
      removeStorageItem('theme-animations');
      removeStorageItem('theme-soundEffects');
    },
  },
});

export const {
  toggleDarkMode,
  setPrimaryColor,
  setFontSize,
  setLanguage,
  toggleAnimations,
  toggleSoundEffects,
  loadThemeFromStorage,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;

