import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Alert,
    TextField,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { Rule } from '../../types/Rule';

interface RuleConfig {
    description: string;
    possibleValues: (boolean | number | string)[];
    type: 'boolean' | 'number' | 'string';
}

interface RulesListBaseProps<T extends Rule> {
    title: string;
    rules: T[] | undefined;
    isLoading: boolean;
    error: Error | null;
    onSave: (rules: T[]) => Promise<void>;
    isSaving: boolean;
    ruleConfigs: Record<string, RuleConfig>;
    successMessage: string;
    updateMessage: string;
}

export function RulesListBase<T extends Rule>({
    title,
    rules,
    isLoading,
    error,
    onSave,
    isSaving,
    ruleConfigs,
    successMessage,
    updateMessage,
}: RulesListBaseProps<T>) {
    const [localRules, setLocalRules] = useState<T[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (rules) {
            setLocalRules(rules);
        }
    }, [rules]);

    const handleValueChange = (ruleName: string, newValue: boolean | number | string) => {
        setLocalRules((prevRules) =>
            prevRules.map((rule) =>
                rule.name === ruleName ? { ...rule, value: newValue } as T : rule
            )
        );
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            await onSave(localRules);
            setHasChanges(false);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                    No se pudieron cargar las reglas
                </Typography>
                <Typography variant="body2">
                    El servicio de análisis de código no está disponible. Por favor, verifica que el backend esté corriendo en <code>http://localhost:8080</code>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Error: {error.message}
                </Typography>
            </Alert>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                    {title}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={isSaving || isUpdating ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving || isUpdating}
                    sx={{ boxShadow: 0 }}
                >
                    {isUpdating ? 'Actualizando...' : 'Guardar'}
                </Button>
            </Box>

            {isUpdating && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {updateMessage}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Regla</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Valor</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {localRules.map((rule, index) => {
                            const config = ruleConfigs[rule.name];

                            // Preferir descripción que venga del backend; si no, usar la del config; por defecto 'Sin descripción'
                            const derivedDescription = (rule.description && String(rule.description)) ?? config?.description ?? 'Sin descripción';

                            // Inferir tipo y posibles valores
                            let derivedType: 'boolean' | 'number' | 'string' = 'string';
                            let derivedPossibleValues: (boolean | number | string)[] | undefined = undefined;

                            // Si existe una configuración para esta regla, úsala
                            if (config) {
                                derivedType = config.type;
                                derivedPossibleValues = config.possibleValues;
                            } else {
                                // Solo si NO existe configuración, inferir desde rule.value
                                if (typeof rule.value === 'boolean') {
                                    derivedType = 'boolean';
                                    derivedPossibleValues = [true, false];
                                } else if (typeof rule.value === 'number') {
                                    derivedType = 'number';
                                    derivedPossibleValues = [rule.value as number];
                                } else if (typeof rule.value === 'string' && rule.value !== null) {
                                    derivedType = 'string';
                                    derivedPossibleValues = [String(rule.value)];
                                } else {
                                    // Fallback razonable: permitir booleanos para reglas tipo enable/flag
                                    derivedType = 'boolean';
                                    derivedPossibleValues = [true, false];
                                }
                            }

                            // Asegurar que siempre tengamos un array para mapear
                            const possibleValuesToRender = derivedPossibleValues ?? [String(rule.value ?? '')];

                            return (
                                <TableRow key={rule.name + '-' + index}>
                                    <TableCell>
                                        <Typography variant="body1" fontWeight="bold">
                                            {rule.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="textSecondary">
                                            {derivedDescription}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {derivedType === 'number' && possibleValuesToRender.length > 1 ? (
                                            // Numérico con múltiples opciones -> Select (ej. 1,2,3)
                                            <FormControl size="small">
                                                <Select
                                                    value={String(rule.value ?? possibleValuesToRender[0])}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const parsedValue = Number(val);
                                                        handleValueChange(rule.name, Number.isNaN(parsedValue) ? 0 : parsedValue);
                                                    }}
                                                >
                                                    {possibleValuesToRender.map((val) => (
                                                        <MenuItem key={String(val)} value={String(val)}>
                                                            {String(val)}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        ) : derivedType === 'number' ? (
                                            // Numérico sin opciones -> TextField editable
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={String(rule.value ?? possibleValuesToRender[0])}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const parsedValue = Number(val);
                                                    handleValueChange(rule.name, Number.isNaN(parsedValue) ? 0 : parsedValue);
                                                }}
                                            />
                                        ) : (
                                            <FormControl size="small">
                                                <Select
                                                    value={String(rule.value ?? possibleValuesToRender[0])}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        let parsedValue: boolean | number | string = val;

                                                        if (derivedType === 'boolean') {
                                                            parsedValue = val === 'true';
                                                        }
                                                        // else it's a string, keep as is

                                                        handleValueChange(rule.name, parsedValue);
                                                    }}
                                                >
                                                    {possibleValuesToRender.map((val) => (
                                                        <MenuItem key={String(val)} value={String(val)}>
                                                            {String(val)}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
