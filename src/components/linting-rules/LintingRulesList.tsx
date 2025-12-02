import React, { useState } from 'react';
import { RulesListBase } from '../common/RulesListBase';
import { LintingRule } from '../../types/Rule';
import { useGetLintingRules, useSaveLintingRules, useLintAllSnippets, LintAllResponse } from '../../utils/queries';
import { useSnackbarContext } from '../../contexts/snackbarContext';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Typography, Box, LinearProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const LINTING_RULE_CONFIGS = {
    identifier_format: {
        description: 'Formato de nomenclatura de variables',
        possibleValues: ['camelcase', 'snakecase'],
        type: 'string' as const,
    },
    enablePrintOnly: {
        description: 'Habilitar solo uso de print en el código',
        possibleValues: [true, false],
        type: 'boolean' as const,
    },
    enableInputOnly: {
        description: 'Habilitar solo uso de input en el código',
        possibleValues: [true, false],
        type: 'boolean' as const,
    },
};

export const LintingRulesList: React.FC = () => {
    const { data: lintingRules, isLoading, error } = useGetLintingRules();
    const { createSnackbar } = useSnackbarContext();
    const [isLinting, setIsLinting] = useState(false);
    const [lintResult, setLintResult] = useState<LintAllResponse | null>(null);
    const [showResultDialog, setShowResultDialog] = useState(false);

    const { mutateAsync: saveRules, isLoading: isSaving } = useSaveLintingRules({
        onError: (error) => {
            createSnackbar('error', `Error al guardar las reglas: ${error.message}`);
            setIsLinting(false);
        },
    });

    const { mutateAsync: lintAllSnippets } = useLintAllSnippets({
        onSuccess: (response) => {
            setLintResult(response);
            setShowResultDialog(true);
            setIsLinting(false);

            if (response.snippets_with_issues === 0) {
                createSnackbar('success', `¡Todos los ${response.total_snippets} snippets cumplen con las reglas!`);
            } else {
                createSnackbar('warning', `${response.snippets_with_issues} snippets tienen problemas de linting.`);
            }
        },
        onError: (error) => {
            createSnackbar('error', `Error al analizar snippets: ${error.message}`);
            setIsLinting(false);
        },
    });

    const handleSave = async (rules: LintingRule[]) => {
        try {
            // Primero guardar las reglas
            await saveRules({ rules });

            // Luego lintear todos los snippets
            setIsLinting(true);
            await lintAllSnippets();
        } catch (error) {
            setIsLinting(false);
        }
    };

    const handleCloseDialog = () => {
        setShowResultDialog(false);
        setLintResult(null);
    };

    return (
        <>
            <RulesListBase
                title="Reglas de Linting"
                rules={lintingRules}
                isLoading={isLoading}
                error={error}
                onSave={handleSave}
                isSaving={isSaving || isLinting}
                ruleConfigs={LINTING_RULE_CONFIGS}
                successMessage="Al guardar, todos tus snippets se analizarán automáticamente para verificar el cumplimiento de las reglas."
                updateMessage={isLinting ? "Analizando todos los snippets con las nuevas reglas..." : "Guardando reglas de linting..."}
            />

            {/* Dialog de progreso */}
            <Dialog open={isLinting && !showResultDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Analizando Snippets</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={3}>
                        <CircularProgress size={60} />
                        <Typography variant="body1" align="center">
                            Aplicando las nuevas reglas de linting a todos tus snippets...
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center">
                            Este proceso puede tardar unos momentos
                        </Typography>
                        <LinearProgress sx={{ width: '100%', mt: 2 }} />
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Dialog de resultados */}
            <Dialog open={showResultDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Resultado del Análisis</DialogTitle>
                <DialogContent>
                    {lintResult && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Resumen
                            </Typography>
                            <Typography variant="body1">
                                Total de snippets: <strong>{lintResult.total_snippets}</strong>
                            </Typography>
                            <Typography variant="body1" color="success.main">
                                Sin problemas: <strong>{lintResult.snippets_without_issues}</strong>
                            </Typography>
                            {lintResult.snippets_with_issues > 0 && (
                                <Typography variant="body1" color="warning.main">
                                    Con problemas: <strong>{lintResult.snippets_with_issues}</strong>
                                </Typography>
                            )}

                            {lintResult.snippets_with_issues > 0 && (
                                <Box mt={3}>
                                    <Typography variant="h6" gutterBottom>
                                        Snippets con problemas:
                                    </Typography>
                                    {lintResult.results
                                        .filter(r => r.issues_count > 0)
                                        .map((result) => (
                                            <Accordion key={result.snippet_id}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                    <Box display="flex" justifyContent="space-between" width="100%">
                                                        <Typography>
                                                            <strong>{result.snippet_name}</strong>
                                                        </Typography>
                                                        <Typography color="warning.main" mr={2}>
                                                            {result.issues_count} problema{result.issues_count > 1 ? 's' : ''}
                                                        </Typography>
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Box>
                                                        {result.issues.map((issue, idx) => (
                                                            <Box key={idx} mb={1} p={1} bgcolor="grey.100" borderRadius={1}>
                                                                <Typography variant="body2">
                                                                    <strong>Línea {issue.line}, Columna {issue.column}</strong>
                                                                </Typography>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    Regla: {issue.rule}
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {issue.message}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary" variant="contained">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
