import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Paper, Grid, Button, Modal, Box } from '@mui/material';
import { fetchReceiptsByStudent } from '../../redux/studentRelated/studentHandle';
import Popup from '../../components/Popup';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StudentReceipts = () => {
    const dispatch = useDispatch();
    const { receipts, loading, error } = useSelector((state) => state.student);
    const { currentUser } = useSelector((state) => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchReceiptsByStudent(currentUser._id));
        }
    }, [dispatch, currentUser]);

    const handleOpenModal = (receipt) => {
        setSelectedReceipt(receipt);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const generatePDF = async (content, forEmail = false) => {
        const doc = new jsPDF();

        const canvas = await html2canvas(content);
        const imgData = canvas.toDataURL('image/png');

        doc.addImage(imgData, 'PNG', 10, 10, 190, 0);

        if (forEmail) {
            const pdfBlob = doc.output('blob');
            return pdfBlob;
        } else {
            doc.save(`Recibo_${currentUser.name}_${selectedReceipt.tuitionMonth}.pdf`);
        }
    };

    const renderReceiptModalContent = () => {
        if (!selectedReceipt) return null;

        const logoUrl = `${process.env.PUBLIC_URL}/logosf.png`;

        return (
            <Box id="receipt-content" sx={{ p: 4 }}>
                <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: 'auto' }}>
                <div style={{ textAlign: 'center' }}>
                        <img src={logoUrl} alt="Logo" style={{ width: '150px' }} />
                        <h1 style={{ color: '#333' }}>Recibo #{selectedReceipt.folio}</h1>
                    </div>
                    <div style={{ marginTop: '30px' }}>
                        <h2>Información del Alumno</h2>
                        <p><strong>Nombre:</strong> {currentUser.name}</p>
                        <p><strong>Matrícula:</strong> {currentUser.rollNum}</p>
                        <p><strong>Grupo:</strong> {currentUser.sclassName.sclassName}</p>
                    </div>
                    <div style={{ marginTop: '30px' }}>
                        <h2>Detalles del Pago</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <th style={{ border: '1px solid #333', padding: '10px' }}>Concepto</th>
                                    <td style={{ border: '1px solid #333', padding: '10px' }}>{selectedReceipt.tuitionMonth}</td>
                                </tr>
                                <tr>
                                    <th style={{ border: '1px solid #333', padding: '10px' }}>Fecha de Pago</th>
                                    <td style={{ border: '1px solid #333', padding: '10px' }}>{new Date(selectedReceipt.paymentDate).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <th style={{ border: '1px solid #333', padding: '10px' }}>Monto Pagado</th>
                                    <td style={{ border: '1px solid #333', padding: '10px' }}>${selectedReceipt.amountPaid}</td>
                                </tr>
                                <tr>
                                    <th style={{ border: '1px solid #333', padding: '10px' }}>Interés</th>
                                    <td style={{ border: '1px solid #333', padding: '10px' }}>${selectedReceipt.interest}</td>
                                </tr>
                                <tr>
                                    <th style={{ border: '1px solid #333', padding: '10px' }}>Estatus</th>
                                    <td style={{ border: '1px solid #333', padding: '10px', color: 'green' }}>Pagado</td>
                                </tr>
                            </tbody>
                        </table>
                        <Button
                            variant="contained"
                            sx={{ mt: 3 }}
                            onClick={() => generatePDF(document.getElementById('receipt-content'))}
                        >
                            Descargar PDF
                        </Button>
                    </div>
                </div>
            </Box>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Mis Recibos
            </Typography>
            {loading ? (
                <Typography>Cargando...</Typography>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <Grid container spacing={3}>
                    {receipts.length > 0 ? (
                        receipts.map((receipt) => (
                            <Grid item xs={12} sm={6} md={4} key={receipt._id}>
                                <Paper sx={{ padding: 2 }}>
                                    <Typography variant="h6">Recibo: {receipt.tuitionMonth}</Typography>
                                    <Typography variant="subtitle1">Monto: {receipt.amountPaid}</Typography>
                                    <Typography variant="subtitle1">Fecha: {new Date(receipt.paymentDate).toLocaleDateString()}</Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleOpenModal(receipt)}
                                        sx={{ mt: 2 }}
                                    >
                                        Ver Recibo
                                    </Button>
                                </Paper>
                            </Grid>
                        ))
                    ) : (
                        <Typography>No hay recibos disponibles.</Typography>
                    )}
                </Grid>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{ ...modalStyle, width: 700 }}>
                    {renderReceiptModalContent()}
                </Box>
            </Modal>
        </Container>
    );
};

export default StudentReceipts;

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};
