import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import Popup from './Popup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, toZonedTime, formatInTimeZone } from 'date-fns-tz';

const PaymentModal = ({ open, handleClose, tuition, studentID }) => {
    const navigate = useNavigate();
    const [amountPaid, setAmountPaid] = useState('');
    const [interest, setInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [daysLate, setDaysLate] = useState(0);
    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("red");
    const [showPopup, setShowPopup] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Efectivo');
    const [numHoja, setNumHoja] = useState('');
    const [studentGroup, setStudentGroup] = useState("");
    const [studentGroupArray, setStudentGroupArray] = useState([]);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().substring(0, 10)); // Valor inicial

    useEffect(() => {
        if (tuition) {
            const dueDate = new Date(tuition.dueDate);
            const currentDate = new Date();
            let daysLate = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
            
            daysLate = daysLate < 0 ? 0 : daysLate;

            let calculatedInterest = 0;

            if (daysLate > 0) {
                if (daysLate <= 10) {
                    calculatedInterest = 100;
                } else if (daysLate <= 20) {
                    calculatedInterest = 150;
                } else if (daysLate <= 30) {
                    calculatedInterest = 250;
                } else if (daysLate <= 60) {
                    calculatedInterest = 350;
                } else if (daysLate <= 90) {
                    calculatedInterest = 450;
                } else if (daysLate <= 120) {
                    calculatedInterest = 550;
                } else if (daysLate <= 150) {
                    calculatedInterest = 650;
                } else {
                    calculatedInterest = 650 + Math.ceil((daysLate - 150) / 30) * 100;
                }
            }

            setInterest(calculatedInterest);
            setTotalAmount(parseFloat(tuition.amountDue) + calculatedInterest);
            setDaysLate(daysLate);
            setAmountPaid(parseFloat(tuition.amountDue) + calculatedInterest);
        }
    }, [tuition]);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Student/${studentID}`);
                
                setStudentGroup(response.data.sclassName.sclassName);
                setStudentGroupArray(response.data.sclassName.sclassName.split(' '));
                
            } catch (error) {
                setMessage('Error al obtener los detalles del estudiante');
                setShowPopup(true);
            }
        };

        fetchStudentDetails();
    }, [studentID]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoader(true);
    
        // Convertir la fecha de pago a la zona horaria de Ciudad de México y luego a UTC
        const timeZone = 'America/Mexico_City';
        const zonedDate = toZonedTime(new Date(`${paymentDate}T00:00:00`), timeZone);
        const formattedDate = formatInTimeZone(zonedDate, 'UTC', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        const data = {
            tuitionId: tuition?._id,
            tuitionMonth: tuition?.tuitionMonth,
            paymentDate: formattedDate,  // Fecha en UTC
            amountPaid: amountPaid,
            studentId: studentID, 
            grado: studentGroupArray[1], 
            grupo: studentGroupArray[0],
            paymentMethod: selectedPaymentMethod,
            numHoja: selectedPaymentMethod === 'Transferencia' ? numHoja : undefined,
        };
    
        console.log("Fecha de pago en UTC:", formattedDate);
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/ProcessPayment`, data);
            setLoader(false);
            setMessageColor("green");
            setMessage(response.data.message || "Pago exitoso");
            handleClose(); 
            navigate(`/Admin/students/student/receipts/${studentID}`);
        } catch (error) {
            setLoader(false);
            setMessageColor("red");
            setMessage("Error al procesar el pago");
            setShowPopup(true);
            console.error(error);
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{ ...modalStyle, width: 400 }}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Pago de Colegiatura - {tuition?.tuitionMonth}
                </Typography>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Grupo - {studentGroup}
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Monto Debido: ${tuition?.amountDue}
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Días de Atraso: {daysLate} días
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Estado del Pago:
                    <span style={{ color: tuition?.isPaid ? 'green' : 'red' }}>
                        {tuition?.isPaid ? 'Pagado' : 'No Pagado'}
                    </span>
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Monto Pagado"
                        type="number"
                        value={amountPaid}
                        onChange={(event) => setAmountPaid(event.target.value)}
                        required
                        sx={{ mt: 3 }}
                    />
                    <TextField
                        fullWidth
                        label="Fecha de Pago"
                        type="date"
                        value={paymentDate}
                        onChange={(event) => setPaymentDate(event.target.value)}
                        required
                        sx={{ mt: 3 }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <FormControl fullWidth sx={{ mt: 3 }}>
                        <InputLabel>Método de Pago</InputLabel>
                        <Select
                            value={selectedPaymentMethod}
                            onChange={(event) => setSelectedPaymentMethod(event.target.value)}
                        >
                            <MenuItem value="Efectivo">Efectivo</MenuItem>
                            <MenuItem value="Transferencia">Transferencia</MenuItem>
                        </Select>
                    </FormControl>
                    {selectedPaymentMethod === 'Transferencia' && (
                        <TextField
                            fullWidth
                            label="Número de Hoja"
                            type="text"
                            value={numHoja}
                            onChange={(event) => setNumHoja(event.target.value)}
                            required={selectedPaymentMethod === 'Transferencia'}
                            sx={{ mt: 3 }}
                        />
                    )}
                    <TextField
                        fullWidth
                        label="Intereses"
                        type="number"
                        value={interest}
                        required
                        sx={{ mt: 3 }}
                        disabled
                    />
                    <TextField
                        fullWidth
                        label="Monto Total a Pagar"
                        type="number"
                        value={totalAmount}
                        required
                        sx={{ mt: 3 }}
                        disabled
                    />
                    <Button
                        fullWidth
                        size="large"
                        variant="contained"
                        type="submit"
                        disabled={loader || tuition?.isPaid}
                        sx={{ mt: 3 }}
                    >
                        {loader ? <CircularProgress size={24} color="inherit" /> : "Pagar"}
                    </Button>
                </form>
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} messageColor={messageColor} />
            </Box>
        </Modal>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default PaymentModal;
