import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Code, Rule } from "@mui/icons-material";
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

type PageType = {
    title: string;
    path: string;
    icon: ReactNode;
};

const pages: PageType[] = [
    {
        title: "Snippets",
        path: "/",
        icon: <Code />,
    },
    {
        title: "Rules",
        path: "/rules",
        icon: <Rule />,
    },
];

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth0();

    return (
        <AppBar position="static" elevation={0}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ display: "flex", gap: "24px" }}>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        sx={{
                            display: { xs: "none", md: "flex" },
                            fontWeight: 700,
                            color: "inherit",
                            textDecoration: "none",
                        }}
                    >
                        Printscript
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: "4px" }}>
                        {pages.map((page) => (
                            <Button
                                key={page.title}
                                onClick={() => navigate(`${page.path}`)}
                                sx={{
                                    my: 2,
                                    color: "white",
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "4px",
                                    backgroundColor: location.pathname === page.path ? "primary.light" : "transparent",
                                    "&:hover": {
                                        backgroundColor: "primary.dark",
                                    },
                                }}
                            >
                                {page.icon}
                                <Typography>{page.title}</Typography>
                            </Button>
                        ))}
                    </Box>
                    {isAuthenticated && ( // Renderizar el botón de cerrar sesión solo si el usuario está autenticado
                        <Button
                            onClick={() =>
                                logout({
                                    returnTo: window.location.origin, // Redirige al usuario a la página principal después de cerrar sesión
                                })
                            }
                            sx={{
                                color: "white",
                                backgroundColor: "error.main",
                                "&:hover": {
                                    backgroundColor: "error.dark",
                                },
                            }}
                        >
                            Cerrar Sesión
                        </Button>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};
