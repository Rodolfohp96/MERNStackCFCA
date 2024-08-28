import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    studentsList: [],
    receipts: [], // Añadido para manejar los recibos
    loading: false,
    error: null,
    response: null,
    statestatus: "idle",
};

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        stuffDone: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
            state.statestatus = "added";
        },
        getSuccess: (state, action) => {
            state.studentsList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.response = action.payload.message; // Almacenando solo el mensaje de error
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload.message; // Almacenando solo el mensaje de error
        },
        underStudentControl: (state) => {
            state.loading = false;
            state.response = null;
            state.error = null;
            state.statestatus = "idle";
        },
        paymentSuccess: (state, action) => {
            state.loading = false;
            state.response = action.payload;
            state.error = null;
            state.statestatus = "added";
        },
        fetchReceiptsSuccess: (state, action) => {  // Añadido para manejar los recibos
            state.receipts = action.payload;
            state.response = action.payload;
            state.loading = false;
            state.error = null;
            state.statestatus = "added";
        },
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    underStudentControl,
    stuffDone,
    paymentSuccess,
    fetchReceiptsSuccess,  // Exportando la nueva acción
} = studentSlice.actions;

export const studentReducer = studentSlice.reducer;
