import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableHead, TableRow, TableCell, Button } from '@mui/material';
import Popup from '../../../components/Popup';
import axios from 'axios';
import Modal from '@mui/material/Modal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getUserDetails } from '../../../redux/userRelated/userHandle'; // Importar la acción para obtener detalles del usuario

const StudentReceipts = () => {
    const dispatch = useDispatch();
    const { userDetails, loading } = useSelector((state) => state.user);
    const params = useParams();
    const studentID = params.id;

    const [receipts, setReceipts] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Receipts/${studentID}`);
                setReceipts(response.data);
            } catch (error) {
                setMessage('Error al obtener los recibos');
                setShowPopup(true);
            }
        };

        fetchReceipts();
    }, [studentID]);

    useEffect(() => {
        // Obtener los detalles del estudiante
        dispatch(getUserDetails(studentID, "Student"));
    }, [dispatch, studentID]);

    const handleOpenModal = (receipt) => {
        setSelectedReceipt(receipt);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const sendEmail = async (receipt) => {
        try {
            if (!userDetails || !userDetails.name || !userDetails.paymentResponsible || !userDetails.paymentResponsible.email) {
                throw new Error('Los detalles del usuario o del responsable de pago no están definidos.');
            }

            const htmlContent = `
                <div>
                    <h2>Recibo de Pago</h2>
                    <p>Estimado (a) ${userDetails.paymentResponsible.name}, usted ha realizado el pago de la ${receipt.tuitionMonth} del alumno ${userDetails.name} con matrícula ${userDetails.rollNum} el día ${new Date(receipt.paymentDate).toLocaleDateString()}.</p>
                    <p>Adjuntamos su recibo de pago por este medio.</p>
                    <p>Saludos Cordiales,<br>Colegio Felipe Carbajal Arcia</p>
                </div>
            `;

            const content = document.getElementById('receipt-content');
            if (!content) {
                throw new Error('No se pudo encontrar el contenido del recibo');
            }

            const pdfBlob = await generatePDF(content, true);  // Genera el PDF como un blob para enviar por correo
            const pdfBase64 = await convertBlobToBase64(pdfBlob);  // Convierte el blob a base64

            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/send-email`, {
                to: userDetails.paymentResponsible.email, 
                subject: `Recibo de Pago: ${userDetails.name}`,
                htmlContent: htmlContent,
                attachment: {
                    filename: `Recibo_${userDetails.name}_${receipt.tuitionMonth}.pdf`,
                    content: pdfBase64,
                    encoding: 'base64',
                },
            });

            setMessage(response.data.message);
            setShowPopup(true);
        } catch (error) {
            setMessage('Error al enviar el correo');
            setShowPopup(true);
            console.error('Error en sendEmail:', error.message || error);
        }
    };

    const generatePDF = async (content, forEmail = false) => {
        const doc = new jsPDF();

        const canvas = await html2canvas(content, {
            scale: 2,
        });

        const imgData = canvas.toDataURL('image/png');

        doc.addImage(imgData, 'PNG', 10, 10, 190, 0); // Ajusta la posición y tamaño según sea necesario

        if (forEmail) {
            return doc.output('blob');
        } else {
            doc.save(`Recibo_${userDetails.name}_${selectedReceipt.tuitionMonth}.pdf`);
        }
    };

    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]); // Obtener el base64 sin el prefijo de tipo de archivo
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const renderReceiptModalContent = () => {
        if (!selectedReceipt || !userDetails) return null;

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
                        <p><strong>Nombre:</strong> {userDetails.name}</p>
                        <p><strong>Matrícula:</strong> {userDetails.rollNum}</p>
                        {/* Verificar que sclassName esté definido */}
                        <p><strong>Grupo:</strong> {userDetails.sclassName ? userDetails.sclassName.sclassName : 'N/A'}</p>
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
                                    <th style={{ border: '1px solid #333', padding: '10px' }}>Método de Pago</th>
                                    <td style={{ border: '1px solid #333', padding: '10px' }}>{selectedReceipt.paymentMethod}</td>
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
                        <Button
                            variant="contained"
                            onClick={() => sendEmail(selectedReceipt)}
                            sx={{ ml: 3 }}
                        >
                            Enviar
                        </Button>
                    </div>
                </div>
            </Box>
        );
    };

    return (
        <>
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
                            <Typography variant="h4" sx={{ mb: 3 }}>
                                Recibos para {userDetails.name}
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mes</TableCell>
                                        <TableCell>Monto Pagado</TableCell>
                                        <TableCell>Interés</TableCell>
                                        <TableCell>Fecha de Pago</TableCell>
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {receipts.map((receipt, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{receipt.tuitionMonth}</TableCell>
                                            <TableCell>{receipt.amountPaid}</TableCell>
                                            <TableCell>{receipt.interest}</TableCell>
                                            <TableCell>{new Date(receipt.paymentDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleOpenModal(receipt)}
                                                >
                                                    Ver Recibo
                                                </Button>
                                                
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
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
                </>
            )}
        </>
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
