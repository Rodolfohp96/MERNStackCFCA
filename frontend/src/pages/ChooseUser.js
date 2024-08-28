import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { AccountCircle, School, Group } from '@mui/icons-material';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";

  const { status, currentUser, currentRole } = useSelector(state => state.user);

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    const guestLoginFields = {
      Admin: { email: "yogendra@12", password },
      Student: { rollNum: "1", studentName: "Dipesh Awasthi", password },
      Teacher: { email: "tony@12", password }
    };

    if (visitor === "guest" && guestLoginFields[user]) {
      setLoader(true);
      dispatch(loginUser(guestLoginFields[user], user));
    } else {
      navigate(`/${user}login`);
    }
  };

  useEffect(() => {
    if (status === 'success' && currentUser && currentRole) {
      const roleToPath = {
        Admin: '/Admin/dashboard',
        Student: '/Student/dashboard',
        Teacher: '/Teacher/dashboard',
        Direccion: '/Direccion/dashboard'
      };

      if (roleToPath[currentRole]) {
        navigate(roleToPath[currentRole]);
      }
    } else if (status === 'error') {
      setLoader(false);
      setMessage("Error de red");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledContainer>
      <Container>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3} onClick={() => navigateHandler("Admin")}>
              <Box mb={2}>
                <AccountCircle fontSize="large" />
              </Box>
              <StyledTypography>Administrador</StyledTypography>
              Inicia sesión como administrador para acceder al panel de control y gestionar los datos de la aplicación.
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3} onClick={() => navigateHandler("Direccion")}>
              <Box mb={2}>
                <School fontSize="large" />
              </Box>
              <StyledTypography>Direccion</StyledTypography>
              Inicia sesión como directivo para realizar cobros.
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3} onClick={() => navigateHandler("Student")}>
              <Box mb={2}>
                <School fontSize="large" />
              </Box>
              <StyledTypography>Estudiante</StyledTypography>
              Inicia sesión como estudiante para explorar materiales de cursos y tareas.
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3} onClick={() => navigateHandler("Teacher")}>
              <Box mb={2}>
                <Group fontSize="large" />
              </Box>
              <StyledTypography>Profesor</StyledTypography>
              Inicia sesión como profesor para crear cursos, tareas y hacer un seguimiento del progreso de los estudiantes.
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader}>
        <CircularProgress color="inherit" />
        Por favor espera
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledContainer>
  );
};

export default ChooseUser;

const StyledContainer = styled.div`
  background: linear-gradient(to bottom, #411d70, #19118b);
  height: 100vh;
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

const StyledPaper = styled(Paper)`
  padding: 20px;
  text-align: center;
  background-color: #1f1f38;
  color:rgba(255, 255, 255, 0.6);
  cursor:pointer;

  &:hover {
    background-color: #2c2c6c;
    color:white;
  }
`;

const StyledTypography = styled.h2`
  margin-bottom: 10px;
`;
