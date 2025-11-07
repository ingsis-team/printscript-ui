import {Button} from "@mui/material";
import {useAuth0} from "@auth0/auth0-react";

const Logout = () => {
    const { logout } = useAuth0();

    const handleLogout = () => {
        localStorage.removeItem('token');
        logout({ logoutParams: { returnTo: window.location.origin } });
    }

    return(
        <Button sx={buttonStyle} onClick={handleLogout}>Cerrar sesión</Button>
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

export default Logout