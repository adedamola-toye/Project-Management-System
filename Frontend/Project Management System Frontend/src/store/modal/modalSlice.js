import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  isOpen: false,
  modalType: "",  // This will hold the type of modal (e.g., '', 'login', etc.)
};

// Create slice
const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action) => {
      console.log("Modal opened with type:", action.payload);
      state.isOpen = true;
      state.modalType = action.payload;  // The payload will be the type of modal to open
    },
    closeModal: (state) => {
      console.log("Modal closed");
      state.isOpen = false;
      state.modalType = null;
    },
  },
});

// Export actions and reducer
export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
