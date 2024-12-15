import { configureStore} from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './auth/authSlice';
import userReducer from './user/userSlice';
import taskReducer from './task/taskSlice';
import projectReducer from './project/projectSlice';
import modalReducer from './modal/modalSlice';
import projectRoleReducer from './projectRole/projectRoleSlice';

const persistConfig = {
  key: 'auth',
  storage,
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedReducer,
    user: userReducer,
    task: taskReducer,
    project: projectReducer,
    modal: modalReducer,
    projectRole: projectRoleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth._persist'],
      },
    }),
});


export const persistor = persistStore(store);
export default store;
