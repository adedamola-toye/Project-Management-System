
interface ModalState{
  isOpen:boolean;
  modalType:string|null;
}

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ModalState = {
  isOpen: false,
  modalType: null,  // This will hold the type of modal (e.g., 'signup', 'login', etc.)
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<string>) => {
      state.isOpen = true;
      state.modalType = action.payload;  // The payload will be the type of modal to open
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.modalType = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
