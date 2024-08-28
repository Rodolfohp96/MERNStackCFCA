import React, { useState, useEffect } from "react";
import {
  TableContainer,
  Container,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { fetchAllReceipts } from "../../../redux/receiptsRelated/receiptHandle";

const ReporteDashboard = () => {
  const dispatch = useDispatch();
  const { receiptsList } = useSelector((state) => state.receipt);
  const logoUrl = `${process.env.PUBLIC_URL}/logosf.png`;
  const [paymentMethod, setPaymentMethod] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("Diario");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [fullReceipts, setFullReceipts] = useState([]);
  const [totalAmountFilteredReceipts, setTotalAmountFilteredReceipts] =
    useState(0);
  // const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Fetch all receipts on component mount
    dispatch(fetchAllReceipts());
  }, [dispatch]);

  useEffect(() => {
    // Store all receipts fetched from the server in fullReceipts
    setFullReceipts(receiptsList);
    // Initially, filteredReceipts should also display all receipts
    setFilteredReceipts(receiptsList);
  }, [receiptsList]);

  useEffect(() => {
    const filterData = () => {
      let filtered = fullReceipts;
      const now = new Date();
      let startDate;

      // Filtro por rango de fechas
      if (filterDateRange === "Diario") {
        startDate = new Date(now.setDate(now.getDate() - 1));
      } else if (filterDateRange === "Quincenal") {
        startDate = new Date(now.setDate(now.getDate() - 15));
      } else if (filterDateRange === "Mensual") {
        startDate = new Date(now.setDate(now.getDate() - 30));
      }

      if (startDate) {
        filtered = filtered.filter(
          (receipt) => new Date(receipt.paymentDate) >= startDate
        );
      }

      // Filtro por grado
      if (selectedGrade && selectedGrade !== "Todos") {
        filtered = filtered.filter(
          (receipt) => receipt.grado === selectedGrade
        );
      }

      // Filtro por método de pago
      if (paymentMethod && paymentMethod !== "") {
        filtered = filtered.filter(
          (receipt) => receipt.paymentMethod === paymentMethod
        );
      }

      setFilteredReceipts(filtered);
      const totalAmount = filtered.reduce(
        (sum, receipt) => sum + receipt.amountPaid,
        0
      );
      setTotalAmountFilteredReceipts(totalAmount);
    };

    filterData();
  }, [filterDateRange, selectedGrade, paymentMethod, receiptsList]);

  const handleDownloadAnnualReport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Control de Pagos Anual");

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
      const logoBase64 = await urlToBase64(logoUrl);

      const colWidth = 7; // Number of columns for each month block
      const headerTitles = [
        "Alumno",
        "Grupo",
        "Grado",
        "Monto",
        "Fecha de pago",
        "Método",
        "Hoja",
        "Folio",
      ];

      // Sort receipts by grade, then by group
      const sortedReceipts = [...fullReceipts].sort((a, b) => {
        if (a.grado === b.grado) {
          return a.grupo.localeCompare(b.grupo);
        }
        return a.grado.localeCompare(b.grado);
      });

      // Group receipts by grade and month
      const groupedByGrade = sortedReceipts.reduce((grades, receipt) => {
        if (!grades[receipt.grado]) {
          grades[receipt.grado] = {};
        }
        if (!grades[receipt.grado][receipt.tuitionMonth]) {
          grades[receipt.grado][receipt.tuitionMonth] = [];
        }
        grades[receipt.grado][receipt.tuitionMonth].push(receipt);
        return grades;
      }, {});

      let currentRow = 1; // Start after the header rows

      for (const grade in groupedByGrade) {
        // Reset start column for each grade
        let startCol = 1;

        worksheet.mergeCells(
          `A${currentRow}:${String.fromCharCode(
            65 + (colWidth - 1)
          )}${currentRow}`
        );
        const titleCell = worksheet.getCell(`A${currentRow}`);
        titleCell.value = `Grado: ${grade}`;
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

        currentRow += 1; // Move to the next row after title

        for (const month in groupedByGrade[grade]) {
          const startCell = worksheet.getColumn(startCol).letter;
          const endCell = worksheet.getColumn(startCol + colWidth).letter;

          // Merge cells for the month title
          worksheet.mergeCells(
            `${startCell}${currentRow}:${endCell}${currentRow}`
          );
          const monthCell = worksheet.getCell(`${startCell}${currentRow}`);
          monthCell.value = `Mes: ${month}`;
          monthCell.alignment = { horizontal: "center", vertical: "middle" };
          monthCell.font = {
            bold: true,
            color: { argb: "FFFFFFFF" },
            size: 12,
          };
          monthCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFA10000" },
          };
          monthCell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };

          currentRow += 1;

          const headerRow = worksheet.getRow(currentRow);
          headerTitles.forEach((title, index) => {
            const cell = headerRow.getCell(startCol + index);
            cell.value = title;
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

          currentRow += 1;

          groupedByGrade[grade][month].forEach((receipt, rowIndex) => {
            const row = worksheet.getRow(currentRow + rowIndex);
            row.getCell(startCol).value = receipt.studentName;
            row.getCell(startCol + 1).value = receipt.grupo;
            row.getCell(startCol + 2).value = receipt.grado;
            row.getCell(startCol + 3).value = `$${receipt.amountPaid.toFixed(
              2
            )}`;
            row.getCell(startCol + 4).value = receipt.paymentDate.split("T")[0];
            row.getCell(startCol + 5).value = receipt.paymentMethod;
            row.getCell(startCol + 6).value = receipt.numHoja;
            row.getCell(startCol + 7).value = receipt.folio;

            // Apply borders and alignment to each cell
            for (let i = startCol; i <= startCol + colWidth - 1; i++) {
              const cell = row.getCell(i);
              cell.alignment = { horizontal: "center", vertical: "middle" };
              cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
              };
            }
          });

          currentRow += groupedByGrade[grade][month].length - 3; // Move to the next row group for the following month
          startCol += colWidth + 1; // Move to the next block of columns for the next month
        }

        currentRow += 4; // Add space after each grade section
      }

      worksheet.columns.forEach((column) => {
        column.width = 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Reporte_Anual_Recibos.xlsx");
    } catch (error) {
      console.error("Error generating the Excel file:", error);
    }
  };

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Control de Pagos");

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
      const logoBase64 = await urlToBase64(logoUrl);

      worksheet.mergeCells("A1:I1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = `CONTROL DE PAGOS ${filterDateRange}`;
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

      worksheet.mergeCells("A2:G2");
      const gradeCell = worksheet.getCell("A2");
      gradeCell.value = `Grado: ${selectedGrade || "Todos"}`;
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

      const logo = workbook.addImage({
        base64: logoBase64,
        extension: "png",
      });
      worksheet.addImage(logo, {
        tl: { col: 7, row: 0 },
        ext: { width: 100, height: 100 },
      });

      ["H1", "H2", "H3", "H4"].forEach((cell) => {
        worksheet.getCell(cell).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF2B4C8C" },
        };
      });

      worksheet.mergeCells("H2:I4");
      worksheet.getCell("H2").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2B4C8C" },
      };

      worksheet.mergeCells("A3:G3");
      const paymentMethodCell = worksheet.getCell("A3");
      paymentMethodCell.value = `Pago en ${filterDateRange}`;
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
      totalMethodCell.value = `Total $ ${totalAmountFilteredReceipts}`;
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
      headerRow.eachCell((cell) => {
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

      worksheet.columns.forEach((column) => {
        column.width = 20;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Reporte_Recibos.xlsx");
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
          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadExcel}
            >
              Descargar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDownloadAnnualReport}
              sx={{ ml: 2 }}
            >
              Reporte Anual
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
                CONTROL DE PAGOS {filterDateRange}
              </TableCell>
            </TableRow>

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
                  sx={{ textAlign: "center", border: "2px solid #224573" }}
                >
                  {receipt.studentName}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", border: "2px solid #224573" }}
                >
                  {receipt.grupo}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", border: "2px solid #224573" }}
                >
                  {receipt.grado}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", border: "2px solid #224573" }}
                >
                  ${receipt.amountPaid.toFixed(2)}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", border: "2px solid #224573" }}
                >
                  {receipt.paymentDate.split("T")[0]}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", border: "2px solid #224573" }}
                >
                  {receipt.paymentMethod}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", border: "2px solid #224573" }}
                >
                  {receipt.numHoja}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", border: "2px solid #224573" }}
                >
                  {receipt.folio}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", border: "2px solid #224573" }}
                >
                  {receipt.tuitionMonth}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReporteDashboard;
