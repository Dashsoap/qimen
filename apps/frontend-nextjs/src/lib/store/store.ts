import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import themeReducer from './themeSlice';
import qimenReducer from './qimenSlice';
import infoReducer from './infoSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
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
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = () => useDispatch<AppDispatch>();
