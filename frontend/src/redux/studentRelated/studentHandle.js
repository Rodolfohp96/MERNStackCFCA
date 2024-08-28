import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone,
    paymentSuccess,
    fetchReceiptsSuccess 
} from './studentSlice';

export const getAllStudents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Students/${id}`);
        if (result.data.message) {
            dispatch(getFailed({ message: result.data.message }));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError({ message: error.message }));
    }
}

export const updateStudentFields = (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed({ message: result.data.message }));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        dispatch(getError({ message: error.message }));
    }
}

export const removeStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed({ message: result.data.message }));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        dispatch(getError({ message: error.message }));
    }
}

export const payTuition = (data) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/PayTuition`, data, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.message) {
            dispatch(getFailed({ message: result.data.message }));
        } else {
            dispatch(paymentSuccess(result.data));
        }
    } catch (error) {
        console.error("Error al procesar el pago:", error.response ? error.response.data : error.message);
        dispatch(getError({
            message: "Error al procesar el pago",
            error: error.response ? error.response.data : error.message,
        }));
    }
}

export const fetchReceiptsByStudent = (studentId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Receipts/${studentId}`);
        dispatch(fetchReceiptsSuccess(result.data));
    } catch (error) {
        dispatch(getError({ message: error.message }));
    }
};
