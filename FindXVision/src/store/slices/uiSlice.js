import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  theme: 'light',
  loading: false,
  modalOpen: false,
  selectedMenuItem: 'dashboard',
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setModalOpen: (state, action) => {
      state.modalOpen = action.payload;
    },
    setSelectedMenuItem: (state, action) => {
      state.selectedMenuItem = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
  },
});

export const { 
  toggleSidebar, 
  setSidebarOpen, 
  setTheme, 
  setLoading, 
  setModalOpen, 
  setSelectedMenuItem, 
  setBreadcrumbs 
} = uiSlice.actions;

export default uiSlice.reducer;