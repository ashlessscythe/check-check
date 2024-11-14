import { configureStore } from "@reduxjs/toolkit";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Auth Slice
interface AuthState {
  user: {
    id: string;
    email: string;
    roleId: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthState["user"]; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

// Offline Slice
interface OfflineState {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingSync: {
    checkInOuts: Array<{
      userId: string;
      type: "CHECK_IN" | "CHECK_OUT";
      timestamp: string;
    }>;
  };
}

const initialOfflineState: OfflineState = {
  isOnline: true,
  lastSyncTime: null,
  pendingSync: {
    checkInOuts: [],
  },
};

const offlineSlice = createSlice({
  name: "offline",
  initialState: initialOfflineState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    updateLastSyncTime: (state) => {
      state.lastSyncTime = new Date().toISOString();
    },
    addPendingCheckInOut: (
      state,
      action: PayloadAction<OfflineState["pendingSync"]["checkInOuts"][0]>
    ) => {
      state.pendingSync.checkInOuts.push(action.payload);
    },
    clearPendingCheckInOuts: (state) => {
      state.pendingSync.checkInOuts = [];
    },
  },
});

// Export actions
export const { setCredentials, logout } = authSlice.actions;
export const {
  setOnlineStatus,
  updateLastSyncTime,
  addPendingCheckInOut,
  clearPendingCheckInOuts,
} = offlineSlice.actions;

// Configure store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    offline: offlineSlice.reducer,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
