import React from 'react';
import { RulesListBase } from '../common/RulesListBase';
import { LintingRule } from '../../types/Rule';
import { useGetLintingRules, useSaveLintingRules } from '../../utils/queries';
import { useSnackbarContext } from '../../contexts/snackbarContext';

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
