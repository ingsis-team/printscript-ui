// useAuthToken.ts
import { useAuth0 } from '@auth0/auth0-react';
import React from "react";

export const useAuthToken = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [token, setToken] = React.useState<string | null>(null);

    const fetchToken = async () => {
        try {
            const fetchedToken = await getAccessTokenSilently();
            setToken(fetchedToken);
        } catch (error) {
            console.error('Error al obtener el token:', error);
            setToken(null);
        }
    };

    React.useEffect(() => {
        fetchToken();
    }, [getAccessTokenSilently]);

    return token;
};

/*
const FetchSnippets = async () => {
    const { getAccessTokenSilently } = useAuth0();
    const token = await getAccessTokenSilently();
    const response = await fetch("http://localhost:8080/api/snippets", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    console.log(data);
};
*/