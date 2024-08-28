import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableHead, TableRow, TableCell, CircularProgress } from '@mui/material';
import Popup from '../../../components/Popup';
import { PurpleButton } from '../../../components/buttonStyles';
import PaymentModal from '../../../components/PaymentModal'; 
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentTuitions = () => {
    const dispatch = useDispatch();
    const { userDetails, loading } = useSelector((state) => state.user);
    const params = useParams();
    const studentID = params.id; // Asegúrate de que studentID esté definido correctamente

    const [tuitions, setTuitions] = useState([]);
    const [studentName, setStudentName] = useState(""); 
    const [studentGroup, setStudentGroup] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [openModal, setOpenModal] = useState(false); 
    const [selectedTuition, setSelectedTuition] = useState(null); 

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Student/${studentID}`);
                setStudentName(response.data.name); 
                setStudentGroup(response.data.sclassName.sclassName);
                
            } catch (error) {
                setMessage('Error al obtener los detalles del estudiante');
                setShowPopup(true);
            }
        };

        fetchStudentDetails();
    }, [studentID]);

    useEffect(() => {
        const fetchTuitions = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/StudentTuitions/${studentID}`);
                setTuitions(response.data);
            } catch (error) {
                setMessage('Error al obtener las colegiaturas');
                setShowPopup(true);
            }
        };

        fetchTuitions();
    }, [studentID]);

    const handlePaymentClick = (tuition) => {
        setSelectedTuition(tuition); 
        setOpenModal(true); 
    };

    const handleAnnualPayment = async () => {
        setLoader(true);
        try {
            // Marcar todas las colegiaturas como pagadas
            const updatedTuitions = tuitions.map(tuition => ({
                ...tuition,
                isPaid: true
            }));
    
            // Calcular el monto del Pago Anual
            const totalAmount = tuitions.some(tuition => tuition.amountDue === 2950) ? 33950 : 34500;
            
            // Obtener la fecha actual
            const begDate = new Date();
    
            // Sumar 10 días a la fecha actual para `dueDate`
            const dueDate = new Date();
            dueDate.setDate(begDate.getDate() + 10);
    
            const annualTuition = {
                tuitionMonth: "Pago Anual",
                amountDue: totalAmount,
                begDate: begDate,
                dueDate: dueDate, // Fecha de vencimiento 10 días después
                isPaid: false,
                student: studentID
            };
    
            // Realizar las solicitudes para actualizar y añadir colegiaturas
            await Promise.all([
                axios.put(`${process.env.REACT_APP_BASE_URL}/UpdateTuitions/${studentID}`, { tuitions: updatedTuitions }),
                axios.post(`${process.env.REACT_APP_BASE_URL}/AddTuition`, annualTuition)
            ]);
    
            toast.success('Pago Anual aplicado con éxito');
        } catch (error) {
            toast.error('Error al aplicar el Pago Anual');
            console.error(error);
        } finally {
            setLoader(false);
        }
    };
    

    return (
        <>
            <ToastContainer />
            {loading ? (
                <div>Cargando...</div>
            ) : (
                <>
                    <Box
                        sx={{
                            flex: '1 1 auto',
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth: 800,
                                px: 3,
                                py: '100px',
                                width: '100%'
                            }}
                        >
                            <Typography variant="h3" sx={{ mb: 3 }}>
                                Colegiaturas de {studentName}
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 3 }}>
                                Grupo: {studentGroup}
                            </Typography>
                            <PurpleButton
                                variant="contained"
                                onClick={handleAnnualPayment}
                                disabled={loader}
                                sx={{ mb: 3 }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Pago Anual"}
                            </PurpleButton>

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mes</TableCell>
                                        <TableCell>Monto a Pagar</TableCell>
                                        <TableCell>Fecha de Inicio</TableCell>
                                        <TableCell>Fecha de Vencimiento</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tuitions.map((tuition, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{tuition.tuitionMonth}</TableCell>
                                            <TableCell>{tuition.amountDue}</TableCell>
                                            <TableCell>{tuition.begDate.split('T')[0]}</TableCell>
                                            <TableCell>{tuition.dueDate.split('T')[0]}</TableCell>
                                            <TableCell>
                                                <span style={{ color: tuition.isPaid ? 'green' : 'red' }}>
                                                    {tuition.isPaid ? "Pagado" : "Pendiente"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {!tuition.isPaid && (
                                                    <PurpleButton
                                                        variant="contained"
                                                        onClick={() => handlePaymentClick(tuition)} 
                                                        disabled={loader}
                                                    >
                                                        {loader ? <CircularProgress size={24} color="inherit" /> : "Pagar"}
                                                    </PurpleButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                    <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
                    {selectedTuition && (
                        <PaymentModal
                            open={openModal}
                            handleClose={() => setOpenModal(false)} 
                            tuition={selectedTuition}
                            studentID={studentID}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default StudentTuitions;
