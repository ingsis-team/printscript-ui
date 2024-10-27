import {Box, Button} from "@mui/material";
import {useAuth0} from "@auth0/auth0-react";

const Login = () => {
    const { loginWithRedirect } = useAuth0();

    const handleLogin = () => {
        loginWithRedirect(
            {
                appState: {
                    returnTo: window.location.pathname
                }
            }
        )
    }

    const handleSignUp = () => {
        loginWithRedirect(
            {
                appState: {
                    returnTo: window.location.pathname
                },
                authorizationParams: {
                    screen_hint: "signup"
                }
            }
        )
    }

    return(
        <Box sx={boxStyle}>
            <h1>Inicia sesión para continuar</h1>
            <div>
                <Button sx={buttonStyle} onClick={handleLogin}>iniciar sesión</Button>
                <Button sx={buttonStyle} onClick={handleSignUp}>Registrarse</Button>
            </div>
        </Box>
    )
}



const buttonStyle = () => {
    return {
        padding: '5px 10px',
        color: 'white',
        backgroundColor: 'primary.dark',
        margin: '8px',
        "&:hover": {
            backgroundColor: 'secondary.dark'
        }
    }
}

const boxStyle = () => {
    return {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        flexDirection: 'column'
    }
}

export default Login