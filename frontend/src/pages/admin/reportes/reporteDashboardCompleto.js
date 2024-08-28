import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Button, Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { fetchAllReceipts } from '../../../redux/receiptsRelated/receiptHandle';

const ReporteDashboard = () => {
    const dispatch = useDispatch();
    const { receiptsList } = useSelector(state => state.receipt);
    const logoUrl = `${process.env.PUBLIC_URL}/logosf.png`;

    const [filterDateRange, setFilterDateRange] = useState('Diario');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [filteredReceipts, setFilteredReceipts] = useState([]);

    useEffect(() => {
        dispatch(fetchAllReceipts());
    }, [dispatch]);

    useEffect(() => {
        const filterData = () => {
            let filtered = receiptsList;
            const now = new Date();
            let startDate;

            if (filterDateRange === 'Diario') {
                startDate = new Date(now.setDate(now.getDate() - 1));
            } else if (filterDateRange === 'Quincenal') {
                startDate = new Date(now.setDate(now.getDate() - 15));
            } else if (filterDateRange === 'Mensual') {
                startDate = new Date(now.setDate(now.getDate() - 30));
            }

            if (startDate) {
                filtered = filtered.filter(receipt => new Date(receipt.paymentDate) >= startDate);
            }

            if (selectedGrade && selectedGrade !== "Todos") {
                filtered = filtered.filter(receipt => receipt.grado === selectedGrade);
            }

            setFilteredReceipts(filtered);
        };

        filterData();
    }, [filterDateRange, selectedGrade, receiptsList]);

    const handleDownloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Control de Pagos');

        const urlToBase64 = async (url) => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };

        try {
            const logoBase64 = await urlToBase64(logoUrl);

            worksheet.mergeCells('A1:I1');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = `CONTROL DE PAGOS ${filterDateRange}`;
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            titleCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 16 };
            titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B4C8C' } };
            titleCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

            worksheet.mergeCells('A2:G2');
            const gradeCell = worksheet.getCell('A2');
            gradeCell.value = `Grado: ${selectedGrade || 'Todos'}`;
            gradeCell.alignment = { horizontal: 'center', vertical: 'middle' };
            gradeCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            gradeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B4C8C' } };
            gradeCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

            const logo = workbook.addImage({
                base64: logoBase64,
                extension: 'png',
            });
            worksheet.addImage(logo, {
                tl: { col: 7, row: 0 },
                ext: { width: 100, height: 100 }
            });

            ['H1', 'H2', 'H3', 'H4'].forEach(cell => {
                worksheet.getCell(cell).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF2B4C8C' }
                };
            });

            worksheet.mergeCells('H2:I4');
            worksheet.getCell('H2').fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF2B4C8C' }
            };

            worksheet.mergeCells('A3:G3');
            const paymentMethodCell = worksheet.getCell('A3');
            paymentMethodCell.value = `Pago en ${filterDateRange}`;
            paymentMethodCell.alignment = { horizontal: 'center', vertical: 'middle' };
            paymentMethodCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            paymentMethodCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B4C8C' } };
            paymentMethodCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

            worksheet.mergeCells('A4:G4');
            const totalMethodCell = worksheet.getCell('A4');
            totalMethodCell.value = `Total ${filterDateRange}`;
            totalMethodCell.alignment = { horizontal: 'center', vertical: 'middle' };
            totalMethodCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            totalMethodCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B4C8C' } };
            totalMethodCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

            const headerTitles = ['Alumno', 'Grupo', 'Grado', 'Monto', 'Fecha de pago', 'Método', 'Hoja', 'Folio', 'Mes'];
            const headerRow = worksheet.addRow(headerTitles);
            headerRow.eachCell((cell) => {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA10000' } };
                cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            });

            filteredReceipts.forEach((receipt) => {
                const row = worksheet.addRow([
                    receipt.studentName,
                    receipt.grupo,
                    receipt.grado,
                    `$${receipt.amountPaid.toFixed(2)}`,
                    receipt.paymentDate.split('T')[0],
                    receipt.paymentMethod,
                    receipt.numHoja,
                    receipt.folio,
                    receipt.tuitionMonth,
                ]);
                row.eachCell((cell) => {
                    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
            });

            worksheet.columns.forEach((column) => {
                column.width = 20;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), 'Reporte_Recibos.xlsx');
        } catch (error) {
            console.error("Error generating the Excel file:", error);
        }
    };

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Rango de Fecha</InputLabel>
                            <Select
                                value={filterDateRange}
                                onChange={(e) => setFilterDateRange(e.target.value)}
                                label="Rango de Fecha"
                            >
                                <MenuItem value="Diario">Diario</MenuItem>
                                <MenuItem value="Quincenal">Quincenal</MenuItem>
                                <MenuItem value="Mensual">Mensual</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Grado</InputLabel>
                            <Select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                label="Grado"
                            >
                                <MenuItem value="Todos">Todos</MenuItem>
                                <MenuItem value="Preescolar">Preescolar</MenuItem>
                                <MenuItem value="Primaria">Primaria</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button variant="contained" color="primary" onClick={handleDownloadExcel}>
                            Descargar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Table sx={{ mt: 2 }}>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={9} sx={{ backgroundColor: '#2B4C8C', color: 'white', textAlign: 'center', border: '2px solid #224573' }}>
                            CONTROL DE PAGOS
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7} sx={{ backgroundColor: '#2B4C8C', color: 'white', textAlign: 'center', border: '2px solid #224573' }}>
                            Grado: {selectedGrade || 'Todos'}
                        </TableCell>
                        <TableCell colSpan={2} rowSpan={2}>
                            <img src={logoUrl} alt="Logo" style={{ width: '150px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7} sx={{ backgroundColor: '#2B4C8C', color: 'white', textAlign: 'center', border: '2px solid #224573' }}>
                            Pago en {filterDateRange}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell sx={{ textAlign: 'center', color: 'white', backgroundColor: '#a10000', border: '2px solid #224573' }}>Alumno</TableCell>
                        <TableCell sx={{ textAlign: 'center', color: 'white', backgroundColor: '#a10000', border: '2px solid #224573' }}>Grupo</TableCell>
                        <TableCell sx={{ textAlign: 'center', color: 'white', backgroundColor: '#a10000', border: '2px solid #224573' }}>Grado</TableCell>
                        <TableCell sx={{ textAlign: 'center', color: 'white', backgroundColor: '#a10000', border: '2px solid #224573' }}>Monto</TableCell>
                        <TableCell sx={{ textAlign: 'center', color: 'white', backgroundColor: '#a10000', border: '2px solid #224573' }}>Fecha de pago</TableCell>
                        <TableCell sx={{ textAlign: 'center', color: 'white', backgroundColor: '#a10000', border: '2px solid #224573' }}>Método</TableCell>
                        <TableCell sx={{ textAlign: 'center', color: 'white', backgroundColor: '#a10000', border: '2px solid #224573' }}>Hoja</TableCell>
                        <TableCell sx={{ textAlign: 'center', color: 'white', backgroundColor: '#a10000', border: '2px solid #224573' }}>Folio</TableCell>
                        <TableCell sx={{ textAlign: 'center', color: 'white', backgroundColor: '#a10000', border: '2px solid #224573' }}>Mes</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredReceipts.map((receipt) => (
                        <TableRow key={receipt._id}>
                            <TableCell sx={{ textAlign: 'center', border: '2px solid #224573' }}>{receipt.studentName}</TableCell>
                            <TableCell sx={{ textAlign: 'center', border: '2px solid #224573' }}>{receipt.grupo}</TableCell>
                            <TableCell sx={{ textAlign: 'center', border: '2px solid #224573' }}>{receipt.grado}</TableCell>
                            <TableCell sx={{ textAlign: 'center', border: '2px solid #224573' }}>${receipt.amountPaid.toFixed(2)}</TableCell>
                            <TableCell sx={{ textAlign: 'center', border: '2px solid #224573' }}>{receipt.paymentDate.split('T')[0]}</TableCell>
                            <TableCell sx={{ textAlign: 'center', border: '2px solid #224573' }}>{receipt.paymentMethod}</TableCell>
                            <TableCell sx={{ textAlign: 'center', border: '2px solid #224573' }}>{receipt.numHoja}</TableCell>
                            <TableCell sx={{ textAlign: 'center', border: '2px solid #224573' }}>{receipt.folio}</TableCell>
                            <TableCell sx={{ textAlign: 'center', border: '2px solid #224573' }}>{receipt.tuitionMonth}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
};

export default ReporteDashboard;
