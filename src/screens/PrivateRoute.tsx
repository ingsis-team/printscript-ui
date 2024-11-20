import { useAuth0 } from "@auth0/auth0-react";
import {Button} from "@mui/material";
import {useEffect} from "react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, user } = useAuth0();

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const accessToken = await getAccessTokenSilently();
                localStorage.setItem('token', accessToken);
                localStorage.setItem('userId', user?.email as string);
            } catch (error) {
                console.error('Error getting access token:', error);
            }
        }

        if (isAuthenticated) {
            fetchToken();
        }
    }, [isAuthenticated, getAccessTokenSilently]);


    return isAuthenticated ? children : (
        <div style={{height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <h1>Please login to access resources</h1>
            <Button id={'login-button'} variant="contained" onClick={() => loginWithRedirect()}>Login</Button>
        </div>
    );
};

export default PrivateRoute;