import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Instalacion from "../assets/instalacion-img.jpg";
import { HomPageButton } from '../components/buttonStyles';
import bgpic from "../assets/background_login.png";


const Homepage = () => {
    const logoUrl = `${process.env.PUBLIC_URL}/logonvocfca.jpg`; // Logo URL


    return (
        <StyledBody>
            <StyledContainer>
                <StyledBackground>
                    <StyledContent>
                        
                        <StyledLogo src={logoUrl} alt="Logo" /> 
                        <StyledTitle>Ciclo escolar </StyledTitle>
                        <StyledTitle>2024-2025</StyledTitle>
                        <StyledForm action="#" method="post">
                            <StyledButtonWrapper>
                                <StyledLink to="/StudentLogin">
                                    <HomPageButton variant="contained" fullWidth>
                                        Iniciar Sesión
                                    </HomPageButton>
                                </StyledLink>
                            </StyledButtonWrapper>
                        </StyledForm>
                    </StyledContent>
                </StyledBackground>
            </StyledContainer>
        </StyledBody>
    );
};

export default Homepage;

const StyledBackground = styled.div`

  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledContent = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  width: 100%;
  max-width: 400px;
`;

const StyledTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 20px;
  color: rgba(1,10,135,1);
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;


const StyledInput = styled.input`
  width: 100%;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const StyledButtonWrapper = styled.div`
  margin-top: 20px;
`;


const StyledBody = styled.div`
  font-family: 'Source Sans Pro', sans-serif;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(${Instalacion});
    background-size: cover;
    background-position: center;
    opacity: 0.4;
    z-index: -1; /* Ensure this stays behind the content */
  }
`;

const StyledContainer = styled.div`
  background-color: rgb(255, 255, 255);
  opacity: 1;
  border-radius: 9px;
  width: 400px;
  padding: 40px;
  box-shadow: 1px 1px 108.8px 19.2px rgb(25, 31, 53);
  position: relative;
  z-index: 2; /* Ensure this stays above the background */
`;



const StyledLink = styled(Link)`
  color: #5c7fda;
  text-decoration: none;
  margin-top: 9px;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledLogo = styled.img`
  width: 250px;
  margin-bottom: 20px;
`;
