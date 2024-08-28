import React, { useState } from 'react';
import { Box, Modal, Typography, Button, TextField, Select, MenuItem } from '@mui/material';

const PaymentModal = ({ open, handleClose, tuition, studentID }) => {
    const [paymentMethod, setPaymentMethod] = useState("Efectivo");
    const [numHoja, setNumHoja] = useState("");
    const [amountPaid, setAmountPaid] = useState(tuition.amountDue);

    const handlePayment = async () => {
        const paymentDetails = {
            studentId: studentID,
            tuitionId: tuition._id,
            paymentDate: new Date().toISOString(),
            amountPaid,
            paymentMethod,
            numHoja: paymentMethod === "Transferencia" ? numHoja : null, // Solo incluye numHoja si es Transferencia
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentDetails),
            });

            const result = await response.json();
            if (response.ok) {
                handleClose();
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error("Error al procesar el pago:", error);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{ ...modalStyle }}>
                <Typography variant="h6" gutterBottom>
                    Pagar Colegiatura
                </Typography>
                <TextField
                    label="Monto a Pagar"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="Efectivo">Efectivo</MenuItem>
                    <MenuItem value="Transferencia">Transferencia</MenuItem>
                </Select>
                {paymentMethod === "Transferencia" && (
                    <TextField
                        label="Número de Hoja"
                        value={numHoja}
                        onChange={(e) => setNumHoja(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                )}
                <Button variant="contained" color="primary" onClick={handlePayment}>
                    Confirmar Pago
                </Button>
            </Box>
        </Modal>
    );
};

export default PaymentModal;

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
