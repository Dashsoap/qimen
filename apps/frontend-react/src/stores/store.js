import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import qimenReducer from './qimenSlice';
import infoReducer from './infoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    qimen: qimenReducer,
    info: infoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;

// 注释掉TypeScript类型，因为这是JavaScript文件
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;