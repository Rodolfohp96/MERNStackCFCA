import axios from 'axios';
import { getRequest, getError, fetchReceiptsSuccess } from './receiptsSlice';

export const fetchAllReceipts = () => async (dispatch) => {
    dispatch(getRequest()); // Inicia la solicitud y establece el estado de carga

    try {
        // Realiza la solicitud para obtener todos los recibos sin enviar adminID
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Admin/students/receipts`);
        
        // Despacha la acción con los recibos obtenidos si la solicitud fue exitosa
        dispatch(fetchReceiptsSuccess(result.data));
    } catch (error) {
        // Si ocurre un error, despacha la acción para manejar el error
        dispatch(getError({ message: error.response?.data?.message || error.message }));
    }
};

export const fetchAllReceiptsDash = ({ classID, studentID, startDate, endDate, isPaid } = {}) => async (dispatch) => {
    dispatch(getRequest()); // Inicia la solicitud y establece el estado de carga

    try {
        // Construir los parámetros de la solicitud en función de los filtros disponibles
        const params = {};

        if (classID) {
            params.classID = classID;
        }

        if (studentID) {
            params.studentID = studentID;
        }

        if (startDate) {
            params.startDate = startDate;
        }

        if (endDate) {
            params.endDate = endDate;
        }

        if (typeof isPaid !== 'undefined') {
            params.isPaid = isPaid;
        }

        // Realiza la solicitud para obtener los recibos con los filtros aplicados
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Admin/students/receipts`, { params });

        // Despacha la acción con los recibos obtenidos si la solicitud fue exitosa
        dispatch(fetchReceiptsSuccess(result.data));
    } catch (error) {
        // Si ocurre un error, despacha la acción para manejar el error
        dispatch(getError({ message: error.response?.data?.message || error.message }));
    }
};
