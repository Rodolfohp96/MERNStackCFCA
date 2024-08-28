import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { removeStuff, updateStudentFields } from '../../../redux/studentRelated/studentHandle'; 
import { Box, Button, Collapse, IconButton, Table, TableBody, TableHead, CircularProgress, Typography, Tab, Paper, BottomNavigation, BottomNavigationAction, Container } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { KeyboardArrowUp, KeyboardArrowDown, Delete as DeleteIcon } from '@mui/icons-material';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../../components/attendanceCalculator';
import CustomBarChart from '../../../components/CustomBarChart';
import CustomPieChart from '../../../components/CustomPieChart';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import Popup from '../../../components/Popup';
import PaymentModal from '../../../components/PaymentModal'; 

const ViewStudent = () => {
    const navigate = useNavigate(); 
    const params = useParams();
    const dispatch = useDispatch();
    const { userDetails, response, loading, error } = useSelector((state) => state.user);
    const [loader, setLoader] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedTuition, setSelectedTuition] = useState(null);

    const studentID = params.id;
    const address = "Student";

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    useEffect(() => {
        if (userDetails && userDetails.sclassName && userDetails.sclassName._id !== undefined) {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails]);

    if (response) { console.log(response); }
    else if (error) { console.log(error); }

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectMarks, setSubjectMarks] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const [openStates, setOpenStates] = useState({});

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [selectedSection, setSelectedSection] = useState('table');
    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    useEffect(() => {
        if (userDetails) {
            setName(userDetails.name || '');
            setRollNum(userDetails.rollNum || '');
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectMarks(userDetails.examResult || '');
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const deleteHandler = () => {
        setMessage("Lo siento, la función de eliminación ha sido deshabilitada por ahora.");
        setShowPopup(true);
    };

    const handlePaymentClick = (tuition) => {
        setSelectedTuition(tuition);
        setOpenModal(true);
    };

    const removeHandler = (id, deladdress) => {
        dispatch(removeStuff(id, deladdress))
            .then(() => {
                dispatch(getUserDetails(studentID, address));
            });
    };

    const removeSubAttendance = (subId) => {
        dispatch(updateStudentFields(studentID, { subId }, "RemoveStudentSubAtten"))
            .then(() => {
                dispatch(getUserDetails(studentID, address));
            });
    };

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Presente', value: overallAttendancePercentage },
        { name: 'Ausente', value: overallAbsentPercentage }
    ];

    const subjectData = Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, sessions }]) => {
        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
        return {
            subject: subName,
            attendancePercentage: subjectAttendancePercentage,
            totalClasses: sessions,
            attendedClasses: present
        };
    });

    const StudentAttendanceSection = () => {
        const renderTableSection = () => {
            return (
                <>
                    <h3>Asistencia:</h3>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Asignatura</StyledTableCell>
                                <StyledTableCell>Presente</StyledTableCell>
                                <StyledTableCell>Sesiones Totales</StyledTableCell>
                                <StyledTableCell>Porcentaje de Asistencia</StyledTableCell>
                                <StyledTableCell align="center">Acciones</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        {Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, allData, subId, sessions }], index) => {
                            const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
                            return (
                                <TableBody key={index}>
                                    <StyledTableRow>
                                        <StyledTableCell>{subName}</StyledTableCell>
                                        <StyledTableCell>{present}</StyledTableCell>
                                        <StyledTableCell>{sessions}</StyledTableCell>
                                        <StyledTableCell>{subjectAttendancePercentage}%</StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Button variant="contained"
                                                onClick={() => handleOpen(subId)}>
                                                {openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}Detalles
                                            </Button>
                                            <IconButton onClick={() => removeSubAttendance(subId)}>
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                            <Button variant="contained" sx={styles.attendanceButton}
                                                onClick={() => navigate(`/Admin/subject/student/attendance/${studentID}/${subId}`)}>
                                                Cambiar
                                            </Button>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                    <StyledTableRow>
                                        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                            <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 1 }}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Detalles de Asistencia
                                                    </Typography>
                                                    <Table size="small" aria-label="purchases">
                                                        <TableHead>
                                                            <StyledTableRow>
                                                                <StyledTableCell>Fecha</StyledTableCell>
                                                                <StyledTableCell align="right">Estado</StyledTableCell>
                                                            </StyledTableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {allData.map((data, index) => {
                                                                const date = new Date(data.date);
                                                                const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                                                                return (
                                                                    <StyledTableRow key={index}>
                                                                        <StyledTableCell component="th" scope="row">
                                                                            {dateString}
                                                                        </StyledTableCell>
                                                                        <StyledTableCell align="right">{data.status}</StyledTableCell>
                                                                    </StyledTableRow>
                                                                )
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </Collapse>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                </TableBody>
                            )
                        })}
                    </Table>
                    <div>
                        Porcentaje de Asistencia General: {overallAttendancePercentage.toFixed(2)}%
                    </div>
                    <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => removeHandler(studentID, "RemoveStudentAtten")}>Eliminar Todo</Button>
                    <Button variant="contained" sx={styles.styledButton} onClick={() => navigate("/Admin/students/student/attendance/" + studentID)}>
                        Agregar Asistencia
                    </Button>
                </>
            )
        }
        const renderChartSection = () => {
            return (
                <>
                    <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
                </>
            )
        }
        return (
            <>
                {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0
                    ?
                    <>
                        {selectedSection === 'table' && renderTableSection()}
                        {selectedSection === 'chart' && renderChartSection()}

                        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                            <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                <BottomNavigationAction
                                    label="Tabla"
                                    value="table"
                                    icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                />
                                <BottomNavigationAction
                                    label="Gráfico"
                                    value="chart"
                                    icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                />
                            </BottomNavigation>
                        </Paper>
                    </>
                    :
                    <Button variant="contained" sx={styles.styledButton} onClick={() => navigate("/Admin/students/student/attendance/" + studentID)}>
                        Agregar Asistencia
                    </Button>
                }
            </>
        )
    }

    const StudentMarksSection = () => {
        const renderTableSection = () => {
            return (
                <>
                    <h3>Calificaciones de Asignaturas:</h3>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell>Asignatura</StyledTableCell>
                                <StyledTableCell>Calificaciones</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {subjectMarks.map((result, index) => {
                                if (!result.subName || !result.marksObtained) {
                                    return null;
                                }
                                return (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                        <StyledTableCell>{result.marksObtained}</StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Button variant="contained" sx={styles.styledButton} onClick={() => navigate("/Admin/students/student/marks/" + studentID)}>
                        Agregar Calificaciones
                    </Button>
                </>
            )
        }
        const renderChartSection = () => {
            return (
                <>
                    <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                </>
            )
        }
        return (
            <>
                {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 ? (
                    <>
                        {selectedSection === 'table' && renderTableSection()}
                        {selectedSection === 'chart' && renderChartSection()}

                        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                            <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                <BottomNavigationAction
                                    label="Tabla"
                                    value="table"
                                    icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                />
                                <BottomNavigationAction
                                    label="Gráfico"
                                    value="chart"
                                    icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                />
                            </BottomNavigation>
                        </Paper>
                    </>
                ) : (
                    <Button variant="contained" sx={styles.styledButton} onClick={() => navigate("/Admin/students/student/marks/" + studentID)}>
                        Agregar Calificaciones
                    </Button>
                )}
            </>
        )
    }

    const StudentDetailsSection = () => {
        // Verificar si userDetails está definido y tiene las propiedades necesarias
        if (!userDetails || !userDetails.name) {
            return <div>No se han encontrado los detalles del estudiante.</div>;
        }
    
        return (
            <div>
                <h2>Detalles del Estudiante</h2>
                <p>Nombre: {userDetails.name}</p>
                <p>Número de Matrícula: {userDetails.rollNum}</p>
                <p>Clase: {sclassName && sclassName.sclassName ? sclassName.sclassName : 'No disponible'}</p>
                <p>Escuela: {studentSchool && studentSchool.schoolName ? studentSchool.schoolName : 'No disponible'}</p>
    
                <h3>Detalles del Responsable de Pago</h3>
                {userDetails.paymentResponsible ? (
                    <>
                        <p>Nombre: {userDetails.paymentResponsible.name}</p>
                        <p>Email: {userDetails.paymentResponsible.email}</p>
                        <p>Relación: {userDetails.paymentResponsible.relationship}</p>
                        <p>Teléfono: {userDetails.paymentResponsible.phone}</p>
                        <p>Facturación: {userDetails.paymentResponsible.billing ? 'Sí' : 'No'}</p>
                    </>
                ) : (
                    <p>No hay detalles del responsable de pago disponibles.</p>
                )}
    
                <h3>Resultados de Exámenes</h3>
                {userDetails.examResult && userDetails.examResult.length > 0 ? (
                    <ul>
                        {userDetails.examResult.map((result, index) => (
                            <li key={index}>
                                Asignatura: {result.subName?.subName ?? 'No disponible'} - Calificación: {result.marksObtained ?? 'No disponible'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay resultados de exámenes disponibles.</p>
                )}
    
                <h3>Asistencia</h3>
                {userDetails.attendance && userDetails.attendance.length > 0 ? (
                    <ul>
                        {userDetails.attendance.map((attendance, index) => (
                            <li key={index}>
                                Fecha: {new Date(attendance.date).toLocaleDateString()} - 
                                Asignatura: {attendance.subName?.subName ?? 'No disponible'} - 
                                Estado: {attendance.status}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay registros de asistencia disponibles.</p>
                )}
    
                <h3>Recibos de Colegiatura</h3>
                {userDetails.tuitions && userDetails.tuitions.length > 0 ? (
                    <ul>
                        {userDetails.tuitions.map((tuition, index) => (
                            <li key={index}>
                                Mes: {tuition.tuitionMonth} - 
                                Monto: ${tuition.amountDue.toFixed(2)} - 
                                Pagado: {tuition.isPaid ? 'Sí' : 'No'} - 
                                Fecha de Vencimiento: {new Date(tuition.dueDate).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay recibos de colegiatura disponibles.</p>
                )}
    
                {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 && (
                    <CustomPieChart data={chartData} />
                )}
    
                <Button variant="contained" sx={styles.styledButton} onClick={deleteHandler}>
                    Eliminar
                </Button>
                <br />
            </div>
        );
    };
    

    const StudentPaymentsSection = () => {
        useEffect(() => {
            // Verifica si los recibos se cargaron correctamente y si el estudiante tiene recibos.
            if (!userDetails || !userDetails.receipts) {
                // Lógica para manejar el caso en que no hay recibos.
            }
        }, [userDetails]);

        return (
            <div>
                <h3>Colegiaturas</h3>
                <PendingPaymentsButton />
                
                <h3>Recibos</h3>
                <Button 
                variant="contained" 
                sx={styles.styledButton} 
                onClick={() => navigate(`/Admin/students/student/receipts/${studentID}`)} // Navega a la página de recibos
            >Ver Recibos</Button>
            </div>
        );
    }

    const PendingPaymentsButton = () => {
        const pendingPayments = userDetails?.tuitions?.filter(tuition => !tuition.isPaid) || [];
    
        return (
            <div>
                {pendingPayments.length > 0 ? (
                    <Button variant="contained" sx={styles.styledButton} onClick={() => navigate(`/Admin/students/student/tuitions/${studentID}`)}>
                        Ver Pagos Pendientes
                    </Button>
                ) : (
                    <Button variant="contained" sx={styles.styledButton} onClick={() => navigate(`/Admin/students/student/tuitions/${studentID}`)}>
                        Agregar Pago
                    </Button>
                )}
            </div>
        );
    };

    return (
        <>
            {loading
                ?
                <div>Cargando...</div>
                :
                <Box sx={{ width: '100%', typography: 'body1', }} >
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} sx={{ position: 'fixed', width: '100%', bgcolor: 'background.paper', zIndex: 1 }}>
                                <Tab label="Detalles" value="1" />
                                <Tab label="Asistencia" value="2" />
                                <Tab label="Calificaciones" value="3" />
                                <Tab label="Pagos" value="4" />
                            </TabList>
                        </Box>
                        <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
                            <TabPanel value="1">
                                <StudentDetailsSection />
                            </TabPanel>
                            <TabPanel value="2">
                                <StudentAttendanceSection />
                            </TabPanel>
                            <TabPanel value="3">
                                <StudentMarksSection />
                            </TabPanel>
                            <TabPanel value="4">
                                <StudentPaymentsSection />
                            </TabPanel>
                        </Container>
                    </TabContext>
                </Box>
            }
            <PaymentModal open={openModal} handleClose={() => setOpenModal(false)} tuition={selectedTuition} studentID={studentID} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default ViewStudent;

const styles = {
    attendanceButton: {
        marginLeft: "20px",
        backgroundColor: "#270843",
        "&:hover": {
            backgroundColor: "#3f1068",
        }
    },
    styledButton: {
        margin: "20px",
        backgroundColor: "#02250b",
        "&:hover": {
            backgroundColor: "#106312",
        }
    }
};
