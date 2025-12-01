import { Box, Container, Paper, Typography } from '@mui/material';
import { FormattingRulesList } from '../components/formatting-rules/FormattingRulesList';
import { LintingRulesList } from '../components/linting-rules/LintingRulesList';
import { withNavbar } from '../components/navbar/withNavbar';
import {useAuth0} from "@auth0/auth0-react";
import Login from "../components/login/Login.tsx";

const RulesScreen = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth0()
    return (
        authLoading ? <div>Cargando...</div> :
            isAuthenticated ? <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                    Configuración de Reglas
                </Typography>

                <Box mb={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <FormattingRulesList />
                    </Paper>
                </Box>

                <Box mb={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <LintingRulesList />
                    </Paper>
                </Box>
            </Container> : <Login/>
    )
}

export default withNavbar(RulesScreen);