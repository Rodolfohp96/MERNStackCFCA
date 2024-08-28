import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getClassDetails, getClassStudents, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { fetchAllReceipts } from "../../../redux/receiptsRelated/receiptHandle";
import {
    Box, Container, Tab, IconButton, Paper, Modal, Grid, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, MenuItem, Select, InputLabel, FormControl, Typography
} from '@mui/material';
import Students from "../../../assets/img1.png";
import Classes from "../../../assets/img2.png";
import Teachers from "../../../assets/img3.png";
import Fees from "../../../assets/img4.png";
import styled from 'styled-components';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { resetSubjects } from "../../../redux/sclassRelated/sclassSlice";
import { BlueButton, GreenButton, PurpleButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import CountUp from 'react-countup';
import PostAddIcon from '@mui/icons-material/PostAdd';
import * as XLSX from 'xlsx';


const ClassDetails = () => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { subjectsList, sclassStudents, sclassDetails, loading, error, response, getresponse } = useSelector((state) => state.sclass);
    const { receiptsList } = useSelector((state) => state.receipt);

    const classID = params.id;

    const [countReceipts, setCountReceipts] = useState(0);
    const [filteredReceipts, setFilteredReceipts] = useState([]);
    const [filteredReceiptsF, setFilteredReceiptsF] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [totalAmountFilteredReceipts, setTotalAmountFilteredReceipts] = useState(0);
    const [totalReceiptsG, setTotalReceiptsG] = useState(0);
    const [filteredTuitions, setFilteredTuitions] = useState([]);
    const [totalAmountDue, setTotalAmountDue] = useState(0);

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
        dispatch(getClassStudents(classID));
        dispatch(fetchAllReceipts(classID));  // Fetch all receipts for the class
    }, [dispatch, classID]);

    if (error) {
        console.log(error);
    }

   
    
    useEffect(() => {
        let filtered = filterReceiptsByStudents();
        

        if (startDate) {
            filtered = filtered.filter(receipt => new Date(receipt.paymentDate) >= new Date(startDate));
        }

        if (endDate) {
            filtered = filtered.filter(receipt => new Date(receipt.paymentDate) <= new Date(endDate));
        }

        if (paymentMethod) {
            filtered = filtered.filter(receipt => receipt.paymentMethod === paymentMethod);
        }

        setFilteredReceiptsF(filtered);

        const totalAmount = filtered.reduce((sum, receipt) => sum + receipt.amountPaid, 0);
        setTotalAmountFilteredReceipts(totalAmount);
        setTotalReceiptsG(filtered.length);    
    }, [startDate, endDate, paymentMethod, receiptsList]);


    useEffect(() => {
        const filterTuitions = () => {
            const studentIds = sclassStudents.map(student => student._id);
            const now = new Date();

            // Filtrar los tuitions que cumplen con las condiciones
            const filtered = receiptsList.filter(receipt => {
                return (
                    studentIds.includes(receipt.studentId) &&
                    new Date(receipt.begDate) >= now &&
                    !receipt.isPaid
                );
            });

            // Calcular la suma del `amountDue` de los tuitions filtrados
            const totalAmount = filtered.reduce((sum, receipt) => sum + receipt.amountDue, 0);

            setFilteredTuitions(filtered);
            setTotalAmountDue(totalAmount);
        };

        filterTuitions();
    }, [receiptsList, sclassStudents]);



    const [value, setValue] = useState('1');
    const [openModal, setOpenModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        console.log(deleteID);
        console.log(address);
        setMessage("Lo siento, la función de eliminación ha sido deshabilitada por ahora.");
        setShowPopup(true);
    };

    const handleOpenModal = (receipt) => {
        setSelectedReceipt(receipt);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const subjectColumns = [
        { id: 'name', label: 'Nombre de la Asignatura', minWidth: 170 },
        { id: 'code', label: 'Código de la Asignatura', minWidth: 100 },
    ];

    const subjectRows = subjectsList && subjectsList.length > 0 && subjectsList.map((subject) => {
        return {
            name: subject.subName,
            code: subject.subCode,
            id: subject._id,
        };
    });

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <>
                <IconButton onClick={() => deleteHandler(row.id, "Subject")}>
                    <DeleteIcon color="error" />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => {
                        navigate(`/Admin/class/subject/${classID}/${row.id}`);
                    }}
                >
                    Ver
                </BlueButton>
            </>
        );
    };

    const subjectActions = [
        {
            icon: <PostAddIcon color="primary" />, name: 'Agregar Nueva Asignatura',
            action: () => navigate("/Admin/addsubject/" + classID)
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Eliminar Todas las Asignaturas',
            action: () => deleteHandler(classID, "SubjectsClass")
        }
    ];

    const ClassSubjectsSection = () => {
        return (
            <>
                {response ?
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <GreenButton
                            variant="contained"
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                        >
                            Agregar Asignaturas
                        </GreenButton>
                    </Box>
                    :
                    <>
                        <Typography variant="h5" gutterBottom>
                            Lista de Asignaturas:
                        </Typography>

                        <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                        <SpeedDialTemplate actions={subjectActions} />
                    </>
                }
            </>
        );
    };

    const studentColumns = [
        { id: 'name', label: 'Nombre', minWidth: 170 },
        { id: 'rollNum', label: 'Número de Matrícula', minWidth: 100 },
    ];

    const studentRows = sclassStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    });

    const handleDownload = () => {
        const filteredReceipts = filterReceiptsByStudents();

        const data = filteredReceipts.map((receipt) => ({
            'Alumno': receipt.studentName,
            'Fecha': new Date(receipt.paymentDate).toLocaleDateString(),
            'Cantidad': receipt.amountPaid.toFixed(2),
            'Hoja': receipt.numHoja || '',
            'Recargo': receipt.interest || '',
            'Metodo': receipt.paymentMethod,
            'Colegiatura': receipt.tuitionMonth
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([], { skipHeader: true });

        XLSX.utils.sheet_add_aoa(worksheet, [
            [{ v: 'Colegio Felipe Carbajal Arcia', s: { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } } }],
            [{ v: 'CICLO ESCOLAR 2024-2025', s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } } }],
            [''],
            ['Alumno', 'Fecha', 'Cantidad', 'Hoja', 'Recargo', 'Metodo', 'Colegiatura']
        ], { origin: 'A1' });

        XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A5', skipHeader: true });

        const headerStyle = {
            font: { bold: true, sz: 10 },
            alignment: { horizontal: 'center' },
            fill: { fgColor: { rgb: 'FF0000' } },
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        worksheet['!cols'] = [
            { wch: 30 },
            { wch: 12 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 15 },
            { wch: 15 }
        ];

        for (let i = 0; i <= 7; i++) {
            const cellAddress = XLSX.utils.encode_cell({ c: i, r: 4 });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = headerStyle;
        }

        worksheet['!merges'] = [
            { s: { c: 0, r: 0 }, e: { c: 7, r: 0 } },
            { s: { c: 0, r: 2 }, e: { c: 7, r: 2 } }
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Recibos');
        XLSX.writeFile(workbook, 'Reporte_Recibos_Clase.xlsx');
    };
    const StudentsButtonHaver = ({ row }) => {
        return (
            <>
                <IconButton onClick={() => deleteHandler(row.id, "Student")}>
                    <PersonRemoveIcon color="error" />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                >
                    Ver
                </BlueButton>
                <PurpleButton
                    variant="contained"
                    onClick={() =>
                        navigate("/Admin/students/student/attendance/" + row.id)
                    }
                >
                    Asistencia
                </PurpleButton>
            </>
        );
    };

    const studentActions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Agregar Nuevo Estudiante',
            action: () => navigate("/Admin/class/addstudents/" + classID)
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Eliminar Todos los Estudiantes',
            action: () => deleteHandler(classID, "StudentsClass")
        },
    ];

    const ClassStudentsSection = () => {
        return (
            <>
                {getresponse ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton
                                variant="contained"
                                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                            >
                                Agregar Estudiantes
                            </GreenButton>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Lista de Estudiantes:
                        </Typography>

                        <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                        <SpeedDialTemplate actions={studentActions} />
                    </>
                )}
            </>
        );
    };

    const ClassTeachersSection = () => {
        return (
            <>
                Profesores
            </>
        );
    };

    const filterReceiptsByStudents = () => {
        const studentIds = sclassStudents.map(student => student._id);
        return receiptsList.filter(receipt => studentIds.includes(receipt.studentId));
    };

    const ClassReceiptsSection = () => {
        const filteredReceipts = filterReceiptsByStudents();
    
        return (
            <>
                <Typography variant="h5" gutterBottom>
                    Recibos de los Estudiantes:
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mb: 2 }}
                    onClick={handleDownload}
                >
                    Descargar Recibos
                </Button>
    
                <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
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
                            </Grid>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                                onClick={handleDownload}
                            >
                                Descargar
                            </Button>
                            <Table sx={{ mt: 2 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Alumno</TableCell>
                                        <TableCell>Grupo</TableCell>
                                        <TableCell>Grado</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Cantidad</TableCell>
                                        <TableCell>Método</TableCell>
                                        <TableCell>Hoja</TableCell>
                                        <TableCell>Recargo</TableCell>
                                        <TableCell>Colegiatura</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredReceiptsF.map((receipt) => (
                                        <TableRow key={receipt._id}>
                                            <TableCell>{receipt.studentName}</TableCell>
                                            <TableCell>{receipt.grupo}</TableCell>
                                            <TableCell>{receipt.grado}</TableCell>
                                            <TableCell>{receipt.paymentDate.split('T')[0]}</TableCell>
                                            <TableCell>${receipt.amountPaid.toFixed(2)}</TableCell>
                                            <TableCell>{receipt.paymentMethod}</TableCell>
                                            <TableCell>{receipt.numHoja}</TableCell>
                                            <TableCell>{receipt.interest}</TableCell>
                                            <TableCell>{receipt.tuitionMonth}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
    
                {/* Modal para mostrar el recibo */}
                <Modal
                    open={openModal}
                    onClose={handleCloseModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={modalStyle}>
                        {selectedReceipt && (
                            <>
                                <Typography variant="h6" component="h2">
                                    Detalles del Recibo
                                </Typography>
                                <Typography sx={{ mt: 2 }}>
                                    Alumno: {selectedReceipt.studentName}
                                </Typography>
                                <Typography sx={{ mt: 2 }}>
                                    Método de Pago: {selectedReceipt.paymentMethod}
                                </Typography>
                                {selectedReceipt.paymentMethod === 'Transferencia' && (
                                    <Typography sx={{ mt: 2 }}>
                                        Número de Hoja: {selectedReceipt.numHoja}
                                    </Typography>
                                )}
                                <Typography sx={{ mt: 2 }}>
                                    Fecha de Pago: {new Date(selectedReceipt.paymentDate).toLocaleDateString()}
                                </Typography>
                                <Typography sx={{ mt: 2 }}>
                                    Monto Pagado: ${selectedReceipt.amountPaid.toFixed(2)}
                                </Typography>
                                <Typography sx={{ mt: 2 }}>
                                    Mes de Colegiatura: {selectedReceipt.tuitionMonth}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Modal>
            </>
        );
    };
    

    const ClassDetailsSection = () => {
        const numberOfSubjects = subjectsList.length;
        const numberOfStudents = sclassStudents.length;

        return (
            <>
                <Typography variant="h4" align="center" gutterBottom>
                    Detalles
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Grupo {sclassDetails && sclassDetails.sclassName}
                </Typography>
                
            
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
                            <Title>Materias</Title>
                            <Data start={0} end={numberOfSubjects} duration={5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Teachers} alt="Maestros" />
                            <Title>Colegituras pagadas</Title>
                            <Data start={0} end={totalReceiptsG} duration={2.5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Fees} alt="Pagado" />
                            <Title>Pagado</Title>
                            <Data start={0} end={totalAmountFilteredReceipts} duration={2.5} prefix="$" />
                        </StyledPaper>
                    </Grid>
                </Grid>
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
                            <Title>Materias</Title>
                            <Data start={0} end={numberOfSubjects} duration={5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Teachers} alt="Maestros" />
                            <Title>Colegiaturas Pendientes</Title>
                            <Data start={0} end={filteredTuitions.length} duration={2.5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Fees} alt="Pagado" />
                            <Title>Deuda</Title>
                            <Data start={0} end={totalAmountDue} duration={2.5} prefix="$" />
                        </StyledPaper>
                    </Grid>
                    </Grid>
                
                
                {getresponse &&
                    <GreenButton
                        variant="contained"
                        onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                    >
                        Agregar Estudiantes
                    </GreenButton>
                }
                {response &&
                    <GreenButton
                        variant="contained"
                        onClick={() => navigate("/Admin/addsubject/" + classID)}
                    >
                        Agregar Asignaturas
                    </GreenButton>
                }
            </>
        );
    };

    return (
        <>
            {loading ? (
                <div>Cargando...</div>
            ) : (
                <>
                    <Box sx={{ width: '100%', typography: 'body1', }} >
                        <TabContext value={value}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleChange} sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}>
                                    <Tab label="Detalles" value="1" />
                                    <Tab label="Recibos" value="5" />  {/* Nueva pestaña para Recibos */}
                                    <Tab label="Asignaturas" value="2" />
                                    <Tab label="Estudiantes" value="3" />
                                    <Tab label="Profesores" value="4" />
                                   
                                </TabList>
                            </Box>
                            <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
                                <TabPanel value="1">
                                    <ClassDetailsSection />
                                </TabPanel>
                                <TabPanel value="2">
                                    <ClassSubjectsSection />
                                </TabPanel>
                                <TabPanel value="3">
                                    <ClassStudentsSection />
                                </TabPanel>
                                <TabPanel value="4">
                                    <ClassTeachersSection />
                                </TabPanel>
                                <TabPanel value="5">
                                    <ClassReceiptsSection /> {/* Nueva sección para mostrar recibos */}
                                </TabPanel>
                            </Container>
                        </TabContext>
                    </Box>
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ClassDetails;

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
  font-size: calc(1.3rem + .6vw);
  color: green;
`;