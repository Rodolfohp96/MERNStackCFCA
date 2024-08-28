import {
  TableContainer,
  Container,
  Grid,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import SeeNotice from "../../components/SeeNotice";
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import Fees from "../../assets/img4.png";
import styled from "styled-components";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSclasses } from "../../redux/sclassRelated/sclassHandle";
import { getAllStudents } from "../../redux/studentRelated/studentHandle";
import { getAllTeachers } from "../../redux/teacherRelated/teacherHandle";
import { fetchAllReceipts } from "../../redux/receiptsRelated/receiptHandle";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const AdminHomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { studentsList } = useSelector((state) => state.student);
  const { sclassesList } = useSelector((state) => state.sclass);
  const { teachersList } = useSelector((state) => state.teacher);
  const { receiptsList } = useSelector((state) => state.receipt);

  const { currentUser } = useSelector((state) => state.user);
  const adminID = currentUser.school._id;

  const logoUrl = `${process.env.PUBLIC_URL}/logosf.png`;
  const [countReceipts, setCountReceipts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [totalAmountFilteredReceipts, setTotalAmountFilteredReceipts] =
    useState(0);

  useEffect(() => {
    dispatch(getAllStudents("66a3427fe46e2e77164617ea"));
    dispatch(getAllSclasses("66a3427fe46e2e77164617ea", "Sclass"));
    dispatch(getAllTeachers("66a3427fe46e2e77164617ea"));
    dispatch(fetchAllReceipts("66a3427fe46e2e77164617ea"));
  }, [adminID, dispatch]);

  useEffect(() => {
    if (receiptsList && receiptsList.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const todayReceipts = receiptsList.filter((receipt) =>
        receipt.paymentDate.startsWith(today)
      );
      setFilteredReceipts(todayReceipts);

      const totalAmountPaid = receiptsList.reduce(
        (sum, receipt) => sum + receipt.amountPaid,
        0
      );
      setCountReceipts(totalAmountPaid);
    }
  }, [receiptsList]);

  useEffect(() => {
    if (studentsList && searchTerm) {
      const filtered = studentsList.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNum.toString().includes(searchTerm)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [searchTerm, studentsList]);

  useEffect(() => {
    let filtered = receiptsList;

    if (startDate) {
      filtered = filtered.filter(
        (receipt) => new Date(receipt.paymentDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (receipt) => new Date(receipt.paymentDate) <= new Date(endDate)
      );
    }

    if (paymentMethod) {
      filtered = filtered.filter(
        (receipt) => receipt.paymentMethod === paymentMethod
      );
    }

    if (selectedGrade) {
      filtered = filtered.filter((receipt) => receipt.grado === selectedGrade);
    }

    setFilteredReceipts(filtered);

    const totalAmount = filtered.reduce(
      (sum, receipt) => sum + receipt.amountPaid,
      0
    );
    setTotalAmountFilteredReceipts(totalAmount);
  }, [startDate, endDate, paymentMethod, selectedGrade, receiptsList]);

  const numberOfStudents = studentsList && studentsList.length;
  const numberOfClasses = sclassesList && sclassesList.length;
  const numberOfTeachers = teachersList && teachersList.length;
  const numberOfReceipts = receiptsList && receiptsList.length;

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Control de Pagos");

    // Function to convert image URL to Base64
    const urlToBase64 = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    try {
      // Convert the logo URL to Base64
      const logoBase64 = await urlToBase64(logoUrl);

      // Header Row 1: Title
      worksheet.mergeCells("A1:I1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = `CONTROL DE PAGOS ${startDate} - ${endDate}`;
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 16 };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };
      titleCell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };

      // Header Row 2: Grado and Logo
      worksheet.mergeCells("A2:G2");
      const gradeCell = worksheet.getCell("A2");
      gradeCell.value = `Grado: ${selectedGrade}`;
      gradeCell.alignment = { horizontal: "center", vertical: "middle" };
      gradeCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      gradeCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };
      gradeCell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };

      const logoCell = worksheet.getCell("H1");
      // Insertar la imagen
      const logo = workbook.addImage({
        base64: logoBase64,
        extension: "png",
      });
      worksheet.addImage(logo, {
        tl: { col: 7, row: 0 },
        ext: { width: 100, height: 100 },
      });

      // Aplicar el fondo (relleno) a las celdas específicas
      worksheet.getCell("H1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };
      worksheet.getCell("H2").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };
      worksheet.getCell("H3").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };
      worksheet.getCell("H4").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };

      // Unir celdas H2:I3 y aplicar relleno
      worksheet.mergeCells("H2:I4");
      worksheet.getCell("H2").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };

      // Header Row 3: Payment Method
      worksheet.mergeCells("A3:G3");
      const paymentMethodCell = worksheet.getCell("A3");
      paymentMethodCell.value = `Pago en ${paymentMethod}`;
      paymentMethodCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      paymentMethodCell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 12,
      };
      paymentMethodCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };
      paymentMethodCell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };

      worksheet.mergeCells("A4:G4");
      const totalMethodCell = worksheet.getCell("A4");
      totalMethodCell.value = `Total ${paymentMethod}`;
      totalMethodCell.alignment = { horizontal: "center", vertical: "middle" };
      totalMethodCell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 12,
      };
      totalMethodCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };
      totalMethodCell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };

      // Header Row 4: Column Titles
      const headerTitles = [
        "Alumno",
        "Grupo",
        "Grado",
        "Monto",
        "Fecha de pago",
        "Método",
        "Hoja",
        "Folio",
        "Mes",
      ];
      const headerRow = worksheet.addRow(headerTitles);
      headerRow.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFA10000" },
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Data Rows
      filteredReceipts.forEach((receipt) => {
        const row = worksheet.addRow([
          receipt.studentName,
          receipt.grupo,
          receipt.grado,
          `$${receipt.amountPaid.toFixed(2)}`,
          receipt.paymentDate.split("T")[0],
          receipt.paymentMethod,
          receipt.numHoja,
          receipt.folio,
          receipt.tuitionMonth,
        ]);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
      });

      // Adjust column widths
      worksheet.columns.forEach((column) => {
        column.width = 20;
      });

      // Save the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Reporte_Recibos.xlsx");
    } catch (error) {
      console.error("Error generating the Excel file:", error);
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper>
              <img src={Students} alt="Alumnos" />
              <Title>Alumnos</Title>
              <Data start={0} end={numberOfStudents} duration={2.5} />
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper>
              <img src={Classes} alt="Grados" />
              <Title>Grupos</Title>
              <Data start={0} end={numberOfClasses} duration={5} />
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper>
              <img src={Teachers} alt="Maestros" />
              <Title>Maestros</Title>
              <Data start={0} end={numberOfTeachers} duration={2.5} />
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <StyledPaper>
              <img src={Fees} alt="Pagado" />
              <Title>Pagado</Title>
              <Data start={0} end={countReceipts} duration={2.5} prefix="$" />
            </StyledPaper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <TextField
                label="Buscar Alumnos por Nombre o Matrícula"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <List sx={{ mt: 2 }}>
                {filteredStudents.length > 0
                  ? filteredStudents.map((student) => (
                      <ListItem
                        key={student._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <ListItemText
                          primary={`${student.name} (Matrícula: ${student.rollNum})`}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            navigate(
                              `/Admin/students/student/tuitions/${student._id}`
                            )
                          }
                          sx={{ mr: 2 }}
                        >
                          Colegiaturas
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() =>
                            navigate(
                              `/Admin/students/student/receipts/${student._id}`
                            )
                          }
                        >
                          Recibos
                        </Button>
                      </ListItem>
                    ))
                  : searchTerm && (
                      <ListItem>
                        <ListItemText primary="No se encontraron estudiantes" />
                      </ListItem>
                    )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" gutterBottom>
                Recibos Pagados
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Fecha de Inicio"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Fecha de Fin"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Método de Pago</InputLabel>
                    <Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      label="Método de Pago"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Efectivo">Efectivo</MenuItem>
                      <MenuItem value="Transferencia">Transferencia</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Grado</InputLabel>
                    <Select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      label="Grado"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Preescolar">Preescolar</MenuItem>
                      <MenuItem value="Primaria">Primaria</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleDownload}
              >
                Descargar
              </Button>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        sx={{
                          backgroundColor: "#2B4C8C",
                          color: "white",
                          textAlign: "center",
                          border: "2px solid #224573",
                        }}
                      >
                        CONTROL DE PAGOS {startDate} - {endDate} - {selectedGrade} - {paymentMethod}
                      </TableCell>
                    </TableRow>
                    
                  </TableHead>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#a10000",
                          border: "2px solid #224573",
                        }}
                      >
                        Alumno
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#a10000",
                          border: "2px solid #224573",
                        }}
                      >
                        Grupo
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#a10000",
                          border: "2px solid #224573",
                        }}
                      >
                        Grado
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#a10000",
                          border: "2px solid #224573",
                        }}
                      >
                        Monto
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#a10000",
                          border: "2px solid #224573",
                        }}
                      >
                        Fecha de pago
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#a10000",
                          border: "2px solid #224573",
                        }}
                      >
                        Método
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#a10000",
                          border: "2px solid #224573",
                        }}
                      >
                        Hoja
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#a10000",
                          border: "2px solid #224573",
                        }}
                      >
                        Folio
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#a10000",
                          border: "2px solid #224573",
                        }}
                      >
                        Mes
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReceipts.map((receipt) => (
                      <TableRow key={receipt._id}>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "2px solid #224573",
                          }}
                        >
                          {receipt.studentName}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "2px solid #224573",
                          }}
                        >
                          {receipt.grupo}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "2px solid #224573",
                          }}
                        >
                          {receipt.grado}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "2px solid #224573",
                          }}
                        >
                          ${receipt.amountPaid.toFixed(2)}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "2px solid #224573",
                          }}
                        >
                          {receipt.paymentDate.split("T")[0]}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "2px solid #224573",
                          }}
                        >
                          {receipt.paymentMethod}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "2px solid #224573",
                          }}
                        >
                          {receipt.numHoja}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "2px solid #224573",
                          }}
                        >
                          {receipt.folio}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            border: "2px solid #224573",
                          }}
                        >
                          {receipt.tuitionMonth}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <SeeNotice />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + 0.6vw);
  color: green;
`;

export default AdminHomePage;
