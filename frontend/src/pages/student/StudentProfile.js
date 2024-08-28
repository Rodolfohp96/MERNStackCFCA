import React from 'react';
import styled from 'styled-components';
import { Card, CardContent, Typography, Grid, Box, Container, Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import QRCode from 'qrcode.react'; // Importar la librería para generar códigos QR

const StudentProfile = () => {
    const { currentUser, response, error } = useSelector((state) => state.user);

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const sclassName = currentUser.sclassName;
    const studentSchool = currentUser.school;

    return (
        <>
            <Container maxWidth="md">
                <StyledPaper elevation={3}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="center">
                                <QRCode 
                                    value={currentUser.rollNum} // El valor que será codificado en el código QR
                                    size={150} // Tamaño del código QR
                                    level="H" // Nivel de corrección de errores (H = Alto)
                                    includeMargin={true} // Incluir margen alrededor del código QR
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h5" component="h2" textAlign="center">
                                    {currentUser.name}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="subtitle1" component="p" textAlign="center">
                                    Número de Matrícula: {currentUser.rollNum}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="subtitle1" component="p" textAlign="center">
                                    Clase: {sclassName.sclassName}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="subtitle1" component="p" textAlign="center">
                                    Escuela: {studentSchool.schoolName}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </StyledPaper>
            </Container>
        </>
    );
};

export default StudentProfile;

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
`;
