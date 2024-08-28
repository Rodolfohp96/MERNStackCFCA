import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    receiptsList: [],
    loading: false,
    error: null,
};

const receiptSlice = createSlice({
    name: 'receipt',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        fetchReceiptsSuccess: (state, action) => {
            console.log("Receipts fetched in Slice:", action.payload); // Verifica los datos aquí
            state.receiptsList = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        },
    },
});


export const {
    getRequest,
    fetchReceiptsSuccess,
    getError,
} = receiptSlice.actions;

export const receiptReducer = receiptSlice.reducer;
