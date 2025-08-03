import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
      // 保存到localStorage
      localStorage.setItem('theme-darkMode', JSON.stringify(state.isDarkMode));
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
      localStorage.setItem('theme-primaryColor', action.payload);
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      localStorage.setItem('theme-fontSize', action.payload);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('theme-language', action.payload);
    },
    toggleAnimations: (state) => {
      state.animations = !state.animations;
      localStorage.setItem('theme-animations', JSON.stringify(state.animations));
    },
    toggleSoundEffects: (state) => {
      state.soundEffects = !state.soundEffects;
      localStorage.setItem('theme-soundEffects', JSON.stringify(state.soundEffects));
    },
    loadThemeFromStorage: (state) => {
      // 从localStorage加载主题设置
      const darkMode = localStorage.getItem('theme-darkMode');
      const primaryColor = localStorage.getItem('theme-primaryColor');
      const fontSize = localStorage.getItem('theme-fontSize');
      const language = localStorage.getItem('theme-language');
      const animations = localStorage.getItem('theme-animations');
      const soundEffects = localStorage.getItem('theme-soundEffects');

      if (darkMode !== null) {
        state.isDarkMode = JSON.parse(darkMode);
      }
      if (primaryColor) {
        state.primaryColor = primaryColor;
      }
      if (fontSize) {
        state.fontSize = fontSize;
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
      localStorage.removeItem('theme-darkMode');
      localStorage.removeItem('theme-primaryColor');
      localStorage.removeItem('theme-fontSize');
      localStorage.removeItem('theme-language');
      localStorage.removeItem('theme-animations');
      localStorage.removeItem('theme-soundEffects');
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