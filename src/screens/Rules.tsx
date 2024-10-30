import {withNavbar} from "../components/navbar/withNavbar.tsx";
import {Box, Typography} from "@mui/material";
import LintingRulesList from "../components/linting-rules/LintingRulesList.tsx";
import FormattingRulesList from "../components/formatting-rules/FormattingRulesList.tsx";
import {useAuth0} from "@auth0/auth0-react";
import Login from "../components/login/Login.tsx";

const RulesScreen = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth0()
    return (
        authLoading ? <div>Cargando...</div> :
            isAuthenticated ? <Box display={"flex"} flexDirection={"column"}>
                <Typography variant={"h3"}>
                    Rules
                </Typography>
                <LintingRulesList />
                <FormattingRulesList/>
        </Box> : <Login/>
    )
}

export default withNavbar(RulesScreen);