import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../redux/userRelated/userHandle';
import { payTuition } from '../redux/studentRelated/studentHandle';
import Popup from './Popup';
import { CircularProgress, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const TuitionPaymentCalculator = ({ studentID }) => {
    const dispatch = useDispatch();
    const { userDetails, loading } = useSelector((state) => state.user);
    const { response, error, statestatus } = useSelector((state) => state.student);

    const [month, setMonth] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        dispatch(getUserDetails(studentID, "Student"));
    }, [dispatch, studentID]);

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);

        const selectedTuition = userDetails.tuitions.find(t => t.tuitionMonth === month);

        if (!selectedTuition) {
            setMessage("Tuition not found for selected month");
            setShowPopup(true);
            setLoader(false);
            return;
        }

        const data = {
            tuitionId: selectedTuition._id,
            paymentDate: new Date().toISOString(),
            amountPaid: parseFloat(amountPaid)
        };

        dispatch(payTuition(data));
    };

    useEffect(() => {
        if (response) {
            setLoader(false);
            setShowPopup(true);
            setMessage(response.message || "Pago exitoso");
        } else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Error al procesar el pago");
        } else if (statestatus === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Pago exitoso");
        }
    }, [response, statestatus, error]);

    return (
        <>
            {loading
                ? <div>Cargando...</div>
                : <Box
                    sx={{
                        flex: '1 1 auto',
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: 550,
                            px: 3,
                            py: '100px',
                            width: '100%'
                        }}
                    >
                        <form onSubmit={submitHandler}>
                            <FormControl fullWidth>
                                <InputLabel id="month-label">Seleccionar Mes</InputLabel>
                                <Select
                                    labelId="month-label"
                                    id="month-select"
                                    value={month}
                                    label="Seleccionar Mes"
                                    onChange={(event) => setMonth(event.target.value)}
                                    required
                                >
                                    {userDetails?.tuitions.map((tuition, index) => (
                                        <MenuItem key={index} value={tuition.tuitionMonth}>
                                            {tuition.tuitionMonth}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                label="Monto Pagado"
                                type="number"
                                value={amountPaid}
                                onChange={(event) => setAmountPaid(event.target.value)}
                                required
                                sx={{ mt: 3 }}
                            />
                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                type="submit"
                                disabled={loader}
                                sx={{ mt: 3 }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Enviar Pago"}
                            </Button>
                        </form>
                    </Box>
                </Box>
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default TuitionPaymentCalculator;
