import React from 'react';
import { RulesListBase } from '../common/RulesListBase';
import { FormattingRule } from '../../types/Rule';
import { useGetFormattingRules, useSaveFormattingRules } from '../../utils/queries';
import { useSnackbarContext } from '../../contexts/snackbarContext';

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
        possibleValues: [1, 2, 3],
        type: 'number' as const,
    },
    lineBreakPrintln: {
        description: 'Número de saltos de línea antes de println',
        possibleValues: [1, 2, 3],
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

    const { mutateAsync: saveRules, isLoading: isSaving } = useSaveFormattingRules({
        onSuccess: () => {
            createSnackbar('success', '¡Reglas guardadas exitosamente! Tus snippets se están actualizando con las nuevas reglas de formateo.');
        },
        onError: (error) => {
            createSnackbar('error', `Error al guardar las reglas: ${error.message}`);
        },
    });

    const handleSave = async (rules: FormattingRule[]) => {
        await saveRules({ rules });
    };

    return (
        <RulesListBase
            title="Reglas de Formateo"
            rules={formattingRules}
            isLoading={isLoading}
            error={error}
            onSave={handleSave}
            isSaving={isSaving}
            ruleConfigs={FORMATTING_RULE_CONFIGS}
            successMessage="Al guardar, todos tus snippets se formatearán automáticamente con las nuevas reglas."
            updateMessage="Los snippets se están formateando con las nuevas reglas. Este proceso puede tardar unos momentos y es tolerante a fallos..."
        />
    );
};
