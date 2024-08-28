import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underStudentControl } from '../../../redux/studentRelated/studentSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress, TextField, MenuItem, FormControl, InputLabel, Select, Button, Typography, Grid, Container, Checkbox, FormControlLabel, Paper } from '@mui/material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // Asegurarse de importar ToastContainer
import 'react-toastify/dist/ReactToastify.css';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const userState = useSelector(state => state.user);
    const { status, currentUser, response } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [className, setClassName] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [grado, setGrado] = useState('');
    const [scholarship, setScholarship] = useState(0);
    const [responsibleName, setResponsibleName] = useState('');
    const [billing, setBilling] = useState(false);
    const [email, setEmail] = useState('');
    const [relationship, setRelationship] = useState('');
    const [phone, setPhone] = useState('');
    const [cicloEscolar, setCicloEscolar] = useState('');

    const adminID = currentUser._id;
    const role = "Student";
    const attendance = [];

    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    const [loader, setLoader] = useState(false);

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const changeHandler = (event) => {
        if (event.target.value === 'Seleccionar Grupo') {
            setClassName('Seleccionar Grupo');
            setSclassName('');
            setGrado('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
            setGrado(selectedClass.grado);
        }
    };

    const cicloEscolarHandler = (event) => {
        setCicloEscolar(event.target.value);
    };

    const createTuitionsForStudent = async (studentId, tuitionAmount, startYear) => {
        const tuitionMonths = [
            { month: 'Septiembre', begDate: new Date(`${startYear}-08-26`), dueDate: new Date(`${startYear}-09-04`) },
            { month: 'Octubre', begDate: new Date(`${startYear}-10-01`), dueDate: new Date(`${startYear}-10-10`) },
            { month: 'Noviembre', begDate: new Date(`${startYear}-11-01`), dueDate: new Date(`${startYear}-11-10`) },
            { month: 'Diciembre y Agosto', begDate: new Date(`${startYear}-12-01`), dueDate: new Date(`${startYear}-12-10`) },
            { month: 'Enero', begDate: new Date(`${startYear + 1}-01-01`), dueDate: new Date(`${startYear + 1}-01-10`) },
            { month: 'Febrero', begDate: new Date(`${startYear + 1}-02-01`), dueDate: new Date(`${startYear + 1}-02-10`) },
            { month: 'Marzo', begDate: new Date(`${startYear + 1}-03-01`), dueDate: new Date(`${startYear + 1}-03-10`) },
            { month: 'Abril', begDate: new Date(`${startYear + 1}-04-01`), dueDate: new Date(`${startYear + 1}-04-10`) },
            { month: 'Mayo y Julio', begDate: new Date(`${startYear + 1}-05-01`), dueDate: new Date(`${startYear + 1}-05-10`) },
            { month: 'Junio', begDate: new Date(`${startYear + 1}-06-01`), dueDate: new Date(`${startYear + 1}-06-10`) }
        ];

        await Promise.all(
            tuitionMonths.map(({ month, begDate, dueDate }) =>
                axios.post(`${process.env.REACT_APP_BASE_URL}/AddTuitions`, {
                    studentId,
                    tuitionMonth: month,
                    amountDue: tuitionAmount,
                    begDate,
                    dueDate
                })
            )
        );
    };

    const submitHandler = async (event) => {
        event.preventDefault();
    
        if (sclassName === "") {
            toast.error("Por favor seleccione un grupo");
            return;
        }
    
        setLoader(true);
    
        const fields = {
            name, rollNum, password, sclassName, adminID, role, attendance,
            scholarship,
            paymentResponsible: {
                name: responsibleName,
                billing,
                email,
                relationship,
                phone
            },
            grado,
            cicloEscolar
        };
    
        try {
            const response = await dispatch(registerUser({ fields, role })).unwrap(); // Use unwrap here
    
            if (response?.message) {
                toast.error(response.message);
            } else if (response?._id) {
                const studentId = response._id;
                const sclass = sclassesList.find((classItem) => classItem._id === sclassName);
                const tuitionAmount = sclass.grado === 'Preescolar' ? 2950 : 3000;
                const startYear = parseInt(cicloEscolar.split('-')[0]);
    
                await createTuitionsForStudent(studentId, tuitionAmount, startYear);
    
                toast.success("Estudiante agregado con éxito");
                dispatch(underStudentControl());
                navigate(-1);
            } else {
                toast.error("Error al agregar el estudiante");
            }
        } catch (error) {
            toast.error("Error al agregar el estudiante: " + error.message);
        } finally {
            setLoader(false);
        }
    };
    
    
    
    useEffect(() => {
        if (status === 'failed' || status === 'error') {
            toast.error(response?.message || "Error desconocido");
            setLoader(false);
        }
    }, [status, response]);

    return (
        <Container component="main" maxWidth="md">
            <ToastContainer /> {/* Agregar ToastContainer para manejar las notificaciones */}
            <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
                <Typography component="h1" variant="h5" align="center">
                    Agregar Estudiante
                </Typography>
                <form onSubmit={submitHandler}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Nombre"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Número de Matrícula"
                                type="number"
                                value={rollNum}
                                onChange={(event) => setRollNum(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Contraseña"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl variant="outlined" fullWidth required>
                                <InputLabel>Grupo</InputLabel>
                                <Select
                                    value={className}
                                    onChange={changeHandler}
                                    label="Grupo"
                                >
                                    <MenuItem value="Seleccionar Grupo">Seleccionar Grupo</MenuItem>
                                    {sclassesList.map((classItem, index) => (
                                        <MenuItem key={index} value={classItem.sclassName}>
                                            {classItem.sclassName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Beca o Descuento ($ o %)"
                                type="number"
                                value={scholarship}
                                onChange={(event) => setScholarship(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl variant="outlined" fullWidth required>
                                <InputLabel>Ciclo Escolar</InputLabel>
                                <Select
                                    value={cicloEscolar}
                                    onChange={cicloEscolarHandler}
                                    label="Ciclo Escolar"
                                >
                                    <MenuItem value="2024-2025">2024-2025</MenuItem>
                                    <MenuItem value="2025-2026">2025-2026</MenuItem>
                                    <MenuItem value="2026-2027">2026-2027</MenuItem>
                                    <MenuItem value="2027-2028">2027-2028</MenuItem>
                                    <MenuItem value="2028-2029">2028-2029</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                Detalles del Responsable de Pago
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Nombre del Responsable"
                                value={responsibleName}
                                onChange={(event) => setResponsibleName(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={billing}
                                        onChange={(event) => setBilling(event.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Facturación"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Relación"
                                value={relationship}
                                onChange={(event) => setRelationship(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Teléfono"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : 'Agregar'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default AddStudent;
