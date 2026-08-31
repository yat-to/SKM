// src/store/features/appSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// const URL = 'http://localhost:5025/';
const URL = 'https://konsel-setara.konaweselatankab.go.id/';

export const API_ROUTES = {
  LOGIN: URL + 'auth/login',

  URL_DM_REGISTER: URL + 'api/v1/dm_registrasi/',
  URL_DM_MENU: URL + 'api/v1/dm_menuList/',
  URL_DM_KLP_USERS: URL + 'api/v1/dm_kelompokUsers/',

  URL_SKM: URL + 'api/v1/skm/',
  
};


// 🔐 LOGIN
export const loginUser = createAsyncThunk(
  'app/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ROUTES.LOGIN, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message || 'Login gagal');
      }

      // simpan ke localStorage
      localStorage.setItem('token', result.token); // Simpan token
      localStorage.setItem('profile', JSON.stringify(result.user)); // Simpan seluruh objek user dari backend
      

      return result;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 📂 FETCH MENU
export const fetchSidebarMenu = createAsyncThunk(
  'app/fetchSidebarMenu',
  async (payloadAset, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(API_ROUTES.URL_DM_MENU + 'view', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + token,
        },
        body: JSON.stringify(payloadAset),
      });

      if (response.status === 401) {
        dispatch(logout());
        return rejectWithValue('Token tidak valid. Silakan login kembali.');
      }

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue('Gagal mengambil menu');
      }

      return result;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forceLogout = (dispatch) => {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    window.location.href = '/login'; // Redirect paksa
};


// ==============================
// 🧠 SLICE
// ==============================
const appSlice = createSlice({
  name: 'app',
  initialState: {
    user: null,
    token: null,
    loading: false,
    errorMessage: '',
    list_menu: [],
  },

  reducers: {
    // 🔐 restore login saat reload
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const profileStr = localStorage.getItem('profile');

        if (token && profileStr) {
          state.token = token;
          state.user = JSON.parse(profileStr); // profileStr sekarang berisi seluruh objek user
        }
      }
    },

    // 🚪 logout
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('profile');

      state.user = null;
      state.token = null;
      state.list_menu = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // 🔐 LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.profile;
        state.token = action.payload.token;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload || 'Login gagal';
      })


      // 📂 MENU
      .addCase(fetchSidebarMenu.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchSidebarMenu.fulfilled, (state, action) => {
        state.loading = false;
        // console.log('fetchSidebarMenu response:', action.payload);

        // Transform data dari backend untuk compatibility dengan component
        const transformMenu = (menu) => {
          return menu.map(item => ({
            ...item,
            url: item.route,  // Ubah route menjadi url
            children: item.subItem && item.subItem.length > 0 ? transformMenu(item.subItem) : []  // Transform subItem menjadi children
          }));
        };

        // Handle berbagai format response dari backend
        let menuData = [];
        if (Array.isArray(action.payload)) {
          menuData = action.payload;
        } else if (action.payload?.data && Array.isArray(action.payload.data)) {
          menuData = action.payload.data;
        } else if (action.payload?.result && Array.isArray(action.payload.result)) {
          menuData = action.payload.result;
        }

        state.list_menu = transformMenu(menuData);
      })

      .addCase(fetchSidebarMenu.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload || 'Gagal ambil menu';
      });
  },
});


// EXPORT
export const { initializeAuth, logout } = appSlice.actions;
export default appSlice.reducer;