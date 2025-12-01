import React from 'react';
import { RulesListBase } from '../common/RulesListBase';
import { LintingRule } from '../../types/Rule';
import { useGetLintingRules, useSaveLintingRules } from '../../utils/queries';
import { useSnackbarContext } from '../../contexts/snackbarContext';

const LINTING_RULE_CONFIGS = {
    identifierFormat: {
        description: 'Formato de nomenclatura de variables',
        possibleValues: ['camelCase', 'snake_case'],
        type: 'string' as const,
    },
    printlnUsage: {
        description: 'Verificar uso correcto de println',
        possibleValues: [true, false],
        type: 'boolean' as const,
    },
    readInputUsage: {
        description: 'Verificar uso correcto de readInput',
        possibleValues: [true, false],
        type: 'boolean' as const,
    },
};

export const LintingRulesList: React.FC = () => {
    const { data: lintingRules, isLoading, error } = useGetLintingRules();
    const { createSnackbar } = useSnackbarContext();

    const { mutateAsync: saveRules, isLoading: isSaving } = useSaveLintingRules({
        onSuccess: () => {
            createSnackbar('success', '¡Reglas guardadas exitosamente! Tus snippets se están analizando con las nuevas reglas de linting.');
        },
        onError: (error) => {
            createSnackbar('error', `Error al guardar las reglas: ${error.message}`);
        },
    });

    const handleSave = async (rules: LintingRule[]) => {
        await saveRules({ rules });
    };

    return (
        <RulesListBase
            title="Reglas de Linting"
            rules={lintingRules}
            isLoading={isLoading}
            error={error}
            onSave={handleSave}
            isSaving={isSaving}
            ruleConfigs={LINTING_RULE_CONFIGS}
            successMessage="Al guardar, todos tus snippets se analizarán automáticamente para verificar el cumplimiento de las reglas."
            updateMessage="Los snippets se están analizando con las nuevas reglas. Este proceso puede tardar unos momentos y es tolerante a fallos..."
        />
    );
};

