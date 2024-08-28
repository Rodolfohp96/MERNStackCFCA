import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button, Grid, Box, Typography, Paper, Checkbox, FormControlLabel, TextField,
    CssBaseline, IconButton, InputAdornment, CircularProgress, Backdrop, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import bgpic from "../assets/background_login.png";
import styled from 'styled-components';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const defaultTheme = createTheme();

const LoginPage = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);

    const [role, setRole] = useState('Student'); // Default role is 'Student'
    const [toggle, setToggle] = useState(false);
    const [guestLoader, setGuestLoader] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [rollNumberError, setRollNumberError] = useState(false);
    const [studentNameError, setStudentNameError] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (role === "Student") {
            const rollNum = event.target.rollNumber.value;
            const studentName = event.target.studentName.value;
            const password = event.target.password.value;

            if (!rollNum || !studentName || !password) {
                if (!rollNum) setRollNumberError(true);
                if (!studentName) setStudentNameError(true);
                if (!password) setPasswordError(true);
                return;
            }
            const fields = { rollNum, studentName, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
        } else {
            const email = event.target.email.value;
            const password = event.target.password.value;

            if (!email || !password) {
                if (!email) setEmailError(true);
                if (!password) setPasswordError(true);
                return;
            }

            const fields = { email, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
        }
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'rollNumber') setRollNumberError(false);
        if (name === 'studentName') setStudentNameError(false);
    };

    const navigateHandler = (user) => {
        const guestLoginFields = {
            Admin: { email: "yogendra@12", password: "zxc" },
            Student: { rollNum: "1", studentName: "Dipesh Awasthi", password: "zxc" },
            Teacher: { email: "tony@12", password: "zxc" },
            Direccion: { email: "direccion@12", password: "zxc" }
        };

        if (guestLoginFields[user]) {
            setLoader(true);
            dispatch(loginUser(guestLoginFields[user], user));
        } else {
            navigate(`/${user}login`);
        }
    };

    useEffect(() => {
        if (status === 'success' && currentUser) {
            const roleToPath = {
                Admin: '/Admin/dashboard',
                Student: '/Student/dashboard',
                Teacher: '/Teacher/dashboard',
                Direccion: '/Direccion/dashboard'
            };

            if (roleToPath[currentRole]) {
                navigate(roleToPath[currentRole]);
            }
        } else if (status === 'failed' || error) {
            setLoader(false);
            setMessage("Error de red");
            setShowPopup(true);
        }
    }, [status, currentRole, navigate, currentUser, error]);

    return (
        <ThemeProvider theme={defaultTheme}>
            <StyledBody>
                <CssBaseline />
                <StyledContainer>
                    <StyledFormWrapper>
                        <FormControl fullWidth>
                            <InputLabel id="role-select-label">Seleccionar Rol</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                value={role}
                                label="Seleccionar Rol"
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <MenuItem value="Student">Estudiante</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Teacher">Profesor</MenuItem>
                                <MenuItem value="Direccion">Dirección</MenuItem>
                            </Select>
                        </FormControl>

                        <StyledTypography variant="h4">
                            {role} Dashboard
                        </StyledTypography>
                        <StyledSubtitle>
                            Inicia sesión.
                        </StyledSubtitle>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            {role === "Student" ? (
                                <>
                                    <StyledTextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="rollNumber"
                                        label="Matricula"
                                        name="rollNumber"
                                        autoComplete="off"
                                        type="number"
                                        autoFocus
                                        error={rollNumberError}
                                        helperText={rollNumberError && 'Matricula es requerido'}
                                        onChange={handleInputChange}
                                    />
                                    <StyledTextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="studentName"
                                        label="Nombre"
                                        name="studentName"
                                        autoComplete="name"
                                        autoFocus
                                        error={studentNameError}
                                        helperText={studentNameError && 'Nombre es requerido'}
                                        onChange={handleInputChange}
                                    />
                                </>
                            ) : (
                                <StyledTextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Correo"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    error={emailError}
                                    helperText={emailError && 'Correo es requerido'}
                                    onChange={handleInputChange}
                                />
                            )}
                            <StyledTextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Contraseña"
                                type={toggle ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                error={passwordError}
                                helperText={passwordError && 'Contraseña es requerido'}
                                onChange={handleInputChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setToggle(!toggle)}>
                                                {toggle ? (
                                                    <Visibility />
                                                ) : (
                                                    <VisibilityOff />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <StyledButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3 }}
                            >
                                {loader ?
                                    <CircularProgress size={24} color="inherit" />
                                    : "Iniciar Sesión"}
                            </StyledButton>
                        </Box>
                    </StyledFormWrapper>
                </StyledContainer>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={guestLoader}
                >
                    <CircularProgress color="primary" />
                    Please Wait
                </Backdrop>
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </StyledBody>
        </ThemeProvider>
    );
};

export default LoginPage;

// Styled components using CSS styles from the provided code
const StyledBody = styled.div`
  font-family: 'Source Sans Pro', sans-serif;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${bgpic});
  background-size: cover;
  background-position: center;
`;

const StyledContainer = styled.div`
  background-color: rgb(255, 255, 255);
  border-radius: 9px;
  border-top: 10px solid #051096;
  border-bottom: 10px solid #051096;
  width: 400px;
  padding: 40px;
  box-shadow: 1px 1px 108.8px 19.2px rgb(25, 31, 53);
`;

const StyledFormWrapper = styled(Box)`
  text-align: center;
`;

const StyledTypography = styled(Typography)`
  color: rgba(1,10,135,1);
  margin-bottom: 10px;
`;

const StyledSubtitle = styled(Typography)`
  color: #a1a4ad;
  font-size: 13px;
  margin-bottom: 30px;
`;

const StyledTextField = styled(TextField)`
  & .MuiInputBase-root {
    background: #ffff;
    border-radius: 5px;
    color: #d6d6d6;
  }
  & .MuiInputLabel-root {
    color: #051096;
  }
  & .MuiInputBase-root.Mui-focused {
    border: 1px solid #79A6FE;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 100px;
  background: #7f5feb;
  color: #dfdeee;
  &:hover {
    background: #5d33e6;
  }
`;

const StyledLink = styled(Link)`
  color: #5c7fda;
  text-decoration: none;
  margin-top: 9px;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  color: #5c7fda;
`;
