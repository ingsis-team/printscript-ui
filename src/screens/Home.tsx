import {withNavbar} from "../components/navbar/withNavbar.tsx";
import {SnippetTable} from "../components/snippet-table/SnippetTable.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {SnippetDetail} from "./SnippetDetail.tsx";
import {Drawer} from "@mui/material";
import {useGetSnippets} from "../utils/queries.tsx";
import {usePaginationContext} from "../contexts/paginationContext.tsx";
import useDebounce from "../hooks/useDebounce.ts";
import {useAuth0} from "@auth0/auth0-react";

const HomeScreen = () => {
    const { isAuthenticated } = useAuth0();
    const {id: paramsId} = useParams<{ id: string }>();
    const [searchTerm, setSearchTerm] = useState('');
    const [snippetName, setSnippetName] = useState('');
    const [snippetId, setSnippetId] = useState<string | null>(null)
    const {page, page_size, count, handleChangeCount} = usePaginationContext()
    const {data, isLoading} = useGetSnippets(page, page_size, snippetName)
    const handleCloseModal = () => setSnippetId(null)
    const username = localStorage.getItem("username")

    useEffect(() => {
        if (data?.count && data.count != count) {
            handleChangeCount(data.count)
        }
    }, [count, data?.count, handleChangeCount]);


    useEffect(() => {
        if (paramsId) {
            setSnippetId(paramsId);
        }
    }, [paramsId]);

    // Verificar y registrar el usuario al iniciar sesión
    useEffect(() => {
        if (isAuthenticated && username !== "") {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const url = `${backendUrl}/users/check-or-create?nickname=${username}`;
            const token = localStorage.getItem("token");

            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al verificar o crear el usuario");
                    }
                })
                .catch((err) => console.error("Error en el registro/verificación del usuario:", err));
        }
    }, [isAuthenticated, username]);


    // DeBounce Function
    useDebounce(() => {
            setSnippetName(
                searchTerm
            );
        }, [searchTerm], 800
    );

    const handleSearchSnippet = (snippetName: string) => {
        setSearchTerm(snippetName);
    };

    return (
        <>
            {isAuthenticated ?
                <>
                    <h1>Hola, {username}!</h1>
                    <SnippetTable loading={isLoading} handleClickSnippet={setSnippetId} snippets={data?.content}
                                  handleSearchSnippet={handleSearchSnippet}/>
                    <Drawer open={!!snippetId} anchor={"right"} onClose={handleCloseModal}>
                        {snippetId && <SnippetDetail handleCloseModal={handleCloseModal} id={snippetId}/>}
                    </Drawer>
                </>
                : <Navigate to={'/login'}/>
            }
        </>
    )
}

export default withNavbar(HomeScreen);