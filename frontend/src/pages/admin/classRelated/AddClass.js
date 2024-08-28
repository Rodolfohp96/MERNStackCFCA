import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField, MenuItem, Select, InputLabel, FormControl, Container, Typography, Paper } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from "../../../components/Popup";
import Classroom from "../../../assets/classroom.png";
import styled from "styled-components";

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");
    const [grado, setGrado] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error, tempDetails } = userState;

    const adminID = currentUser._id;
    const address = "Sclass";

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = {
        sclassName,
        grado,
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(addStuff(fields, address));
    };

    useEffect(() => {
        if (status === 'added' && tempDetails) {
            navigate("/Admin/classes/class/" + tempDetails._id);
            dispatch(underControl());
            setLoader(false);
        }
        else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
        else if (status === 'error') {
            setMessage("Error de red");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch, tempDetails]);

    return (
        <>
            <Container component="main" maxWidth="md">
                <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
                    <Typography component="h1" variant="h5" align="center">
                        Agregar Grupo
                    </Typography>
                    <Stack sx={{ alignItems: 'center', mb: 3 }}>
                        <img
                            src={Classroom}
                            alt="classroom"
                            style={{ width: '80%' }}
                        />
                    </Stack>
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <TextField
                                label="Grupo"
                                variant="outlined"
                                value={sclassName}
                                onChange={(event) => setSclassName(event.target.value)}
                                required
                            />
                            <FormControl variant="outlined" fullWidth required>
                                <InputLabel>Grado</InputLabel>
                                <Select
                                    value={grado}
                                    onChange={(event) => setGrado(event.target.value)}
                                    label="Grado"
                                >
                                    <MenuItem value="Preescolar">Preescolar</MenuItem>
                                    <MenuItem value="Primaria">Primaria</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Crear"}
                            </Button>
                            <Button variant="outlined" onClick={() => navigate(-1)}>
                                Regresar
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Container>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default AddClass;

const StyledContainer = styled(Box)`
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledBox = styled(Box)`
  max-width: 550px;
  padding: 50px 3rem 50px;
  margin-top: 1rem;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: 1px solid #ccc;
  border-radius: 4px;
`;
