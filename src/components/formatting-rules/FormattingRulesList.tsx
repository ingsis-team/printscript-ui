import React, { useState } from 'react';
import { RulesListBase } from '../common/RulesListBase';
import { FormattingRule } from '../../types/Rule';
import { useGetFormattingRules, useSaveFormattingRules, useFormatAllSnippets, FormatAllResponse } from '../../utils/queries';
import { useSnackbarContext } from '../../contexts/snackbarContext';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Typography, Box, LinearProgress } from '@mui/material';

const FORMATTING_RULE_CONFIGS = {
    spaceBeforeColon: {
        description: 'Espacio antes de : en declaraciones de tipo',
        possibleValues: [true, false],
        type: 'boolean' as const,
    },
    spaceAfterColon: {
        description: 'Espacio después de : en declaraciones de tipo',
        possibleValues: [true, false],
        type: 'boolean' as const,
    },
    spaceAroundEquals: {
        description: 'Espacio alrededor del operador = en asignaciones',
        possibleValues: [true, false],
        type: 'boolean' as const,
    },
    lineBreak: {
        description: 'Número de saltos de línea entre declaraciones',
        possibleValues: [1, 2, 3, 4],
        type: 'number' as const,
    },
    lineBreakPrintln: {
        description: 'Número de saltos de línea antes de println',
        possibleValues: [1, 2],
        type: 'number' as const,
    },
    conditionalIndentation: {
        description: 'Espacios de indentación dentro de bloques condicionales',
        possibleValues: [1, 2, 3, 4],
        type: 'number' as const,
    },
};

export const FormattingRulesList: React.FC = () => {
    const { data: formattingRules, isLoading, error } = useGetFormattingRules();
    const { createSnackbar } = useSnackbarContext();
    const [isFormatting, setIsFormatting] = useState(false);
    const [formatResult, setFormatResult] = useState<FormatAllResponse | null>(null);
    const [showResultDialog, setShowResultDialog] = useState(false);

    const { mutateAsync: saveRules, isLoading: isSaving } = useSaveFormattingRules({
        onError: (error) => {
            createSnackbar('error', `Error al guardar las reglas: ${error.message}`);
            setIsFormatting(false);
        },
    });

    const { mutateAsync: formatAllSnippets } = useFormatAllSnippets({
        onSuccess: (response) => {
            setFormatResult(response);
            setShowResultDialog(true);
            setIsFormatting(false);

            if (response.failed === 0) {
                createSnackbar('success', `¡${response.successfully_formatted} snippets formateados exitosamente!`);
            } else {
                createSnackbar('warning', `${response.successfully_formatted} snippets formateados, ${response.failed} fallaron.`);
            }
        },
        onError: (error) => {
            createSnackbar('error', `Error al formatear snippets: ${error.message}`);
            setIsFormatting(false);
        },
    });

    const handleSave = async (rules: FormattingRule[]) => {
        try {
            // Primero guardar las reglas
            await saveRules({ rules });

            // Luego formatear todos los snippets
            setIsFormatting(true);
            await formatAllSnippets();
        } catch (error) {
            setIsFormatting(false);
        }
    };

    const handleCloseDialog = () => {
        setShowResultDialog(false);
        setFormatResult(null);
    };

    return (
        <>
            <RulesListBase
                title="Reglas de Formateo"
                rules={formattingRules}
                isLoading={isLoading}
                error={error}
                onSave={handleSave}
                isSaving={isSaving || isFormatting}
                ruleConfigs={FORMATTING_RULE_CONFIGS}
                successMessage="Al guardar, todos tus snippets se formatearán automáticamente con las nuevas reglas."
                updateMessage={isFormatting ? "Formateando todos los snippets con las nuevas reglas..." : "Guardando reglas de formateo..."}
            />

            {/* Dialog de progreso */}
            <Dialog open={isFormatting && !showResultDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Formateando Snippets</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={3}>
                        <CircularProgress size={60} />
                        <Typography variant="body1" align="center">
                            Aplicando las nuevas reglas de formateo a todos tus snippets...
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
                <DialogTitle>Resultado del Formateo</DialogTitle>
                <DialogContent>
                    {formatResult && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Resumen
                            </Typography>
                            <Typography variant="body1">
                                Total de snippets: <strong>{formatResult.total_snippets}</strong>
                            </Typography>
                            <Typography variant="body1" color="success.main">
                                Formateados exitosamente: <strong>{formatResult.successfully_formatted}</strong>
                            </Typography>
                            {formatResult.failed > 0 && (
                                <Typography variant="body1" color="error.main">
                                    Fallidos: <strong>{formatResult.failed}</strong>
                                </Typography>
                            )}

                            {formatResult.failed > 0 && (
                                <Box mt={3}>
                                    <Typography variant="h6" gutterBottom>
                                        Snippets con errores:
                                    </Typography>
                                    {formatResult.results
                                        .filter(r => !r.success)
                                        .map((result) => (
                                            <Box key={result.snippet_id} mt={1} p={1} bgcolor="error.light" borderRadius={1}>
                                                <Typography variant="body2">
                                                    <strong>{result.snippet_name}</strong>: {result.errorMessage}
                                                </Typography>
                                            </Box>
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
