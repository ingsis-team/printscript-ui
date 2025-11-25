import {useMutation, UseMutationResult, useQuery, useQueryClient} from 'react-query';
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from './snippet.ts';
import {SnippetOperations} from "./snippetOperations.ts";
import {PaginatedUsers} from "./users.ts";
import {RealSnippetOperations} from "./mock/RealSnippetOperations.ts";
import {TestCase} from "../types/TestCase.ts";
import {FileType} from "../types/FileType.ts";
import {Rule} from "../types/Rule.ts";

const snippetOperations: SnippetOperations = new RealSnippetOperations();

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string, tokenReady?: boolean) => {
    const getToken = () => localStorage.getItem('token') || '';
    return useQuery<PaginatedSnippets, Error>(
        ['listSnippets', page, pageSize, snippetName, tokenReady],
        () => snippetOperations.listSnippetDescriptors(page, pageSize, snippetName),
        {
            enabled: !!getToken() && tokenReady !== false, // Solo ejecutar cuando hay token disponible y tokenReady es true
            retry: 1,
            staleTime: 1000 * 60 * 5, // 5 minutos
        }
    );
};

export const useGetSnippetById = (id: string) => {
    return useQuery<Snippet | undefined, Error>(['snippet', id], () => snippetOperations.getSnippetById(id), {
        enabled: !!id, // This query will not execute until the id is provided
    });
};

export const useCreateSnippet = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<Snippet, Error, CreateSnippet> => {
    const queryClient = useQueryClient();
    return useMutation<Snippet, Error, CreateSnippet>(
        createSnippet => snippetOperations.createSnippet(createSnippet),
        {
            onSuccess: () => {
                // Invalidate snippets list to refresh the UI
                queryClient.invalidateQueries(['listSnippets']);
                onSuccess();
            }
        }
    );
};

export const useUpdateSnippetById = ({onSuccess, onError}: {onSuccess: () => void, onError?: (error: Error) => void}): UseMutationResult<Snippet, Error, {
    id: string;
    updateSnippet: UpdateSnippet
}> => {
    const queryClient = useQueryClient();
    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({id, updateSnippet}) => snippetOperations.updateSnippetById(id, updateSnippet),
        {
            onSuccess: (_data, variables) => {
                // Invalidate both the specific snippet and the snippets list
                queryClient.invalidateQueries(['snippet', variables.id]);
                queryClient.invalidateQueries(['listSnippets']);
                onSuccess();
            },
            onError,
        }
    );
};

export const useGetUsers = (page: number = 0, pageSize: number = 10, name?: string) => {
    return useQuery<PaginatedUsers, Error>(['users', name, page, pageSize], () => snippetOperations.getUserFriends(page, pageSize, name));
};

export const useShareSnippet = ({onSuccess, onError}: {onSuccess?: () => void, onError?: (error: Error) => void} = {}) => {
    const queryClient = useQueryClient();
    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        ({snippetId, userId}) => snippetOperations.shareSnippet(snippetId, userId),
        {
            onSuccess: (_data, variables) => {
                // Invalidate the specific snippet to refresh shared status
                queryClient.invalidateQueries(['snippet', variables.snippetId]);
                queryClient.invalidateQueries(['listSnippets']);
                onSuccess?.();
            },
            onError,
        }
    );
};

export const useGetTestCases = (snippetId: string) => {
    return useQuery<TestCase[] | undefined, Error>(['testCases', snippetId], () => snippetOperations.getTestCases(snippetId), {});
};

export const usePostTestCase = (snippetId: string) => {
    const queryClient = useQueryClient();
    return useMutation<TestCase, Error, Partial<TestCase>>(
        (tc) => snippetOperations.postTestCase({...tc, snippetId} as Partial<TestCase>),
        {
            onSuccess: () => {
                // Invalidate test cases for this snippet to refresh the UI
                queryClient.invalidateQueries(['testCases', snippetId]);
            }
        }
    );
};

export const useRemoveTestCase = ({onSuccess}: {onSuccess: () => void}) => {
    const queryClient = useQueryClient();
    return useMutation<string, Error, string>(
        (id) => snippetOperations.removeTestCase(id),
        {
            onSuccess: (_data, id) => {
                // Extract snippet ID from the test case ID to invalidate the correct cache
                const snippetId = id.substring(0, 36);
                queryClient.invalidateQueries(['testCases', snippetId]);
                onSuccess();
            },
        }
    );
};

export type TestCaseResult = "success" | "fail"

export const useTestSnippet = () => {
    const queryClient = useQueryClient();
    return useMutation<TestCaseResult, Error, { id: string; envVars: string }>(
        ({id, envVars}) => snippetOperations.testSnippet(id, envVars),
        {
            onSuccess: (_data, variables) => {
                // Extract snippet ID to invalidate test cases cache (in case test results affect the display)
                const snippetId = variables.id.substring(0, 36);
                queryClient.invalidateQueries(['testCases', snippetId]);
            }
        }
    )
}

export const useGetFormatRules = () => {
    return useQuery<Rule[], Error>('formatRules', () => snippetOperations.getFormatRules());
}

export const useModifyFormatRules = ({onSuccess}: {onSuccess: () => void}) => {
    const queryClient = useQueryClient();
    return useMutation<Rule[], Error, Rule[]>(
        rule => snippetOperations.modifyFormatRule(rule),
        {
            onSuccess: () => {
                // Invalidate format rules to refresh the UI
                queryClient.invalidateQueries('formatRules');
                onSuccess();
            }
        }
    );
}

export const useGetLintingRules = () => {
    return useQuery<Rule[], Error>('lintingRules', () => snippetOperations.getLintingRules());
}

export const useModifyLintingRules = ({onSuccess}: {onSuccess: () => void}) => {
    const queryClient = useQueryClient();
    return useMutation<Rule[], Error, Rule[]>(
        rule => snippetOperations.modifyLintingRule(rule),
        {
            onSuccess: () => {
                // Invalidate linting rules to refresh the UI
                queryClient.invalidateQueries('lintingRules');
                onSuccess();
            }
        }
    );
}

export const useFormatSnippet = (snippetId: string, language: string) => {
    const queryClient = useQueryClient();
    return useMutation<string, Error, void>(
        () => snippetOperations.formatSnippet(snippetId, language),
        {
            onSuccess: () => {
                // Invalidate the specific snippet to refresh its content
                queryClient.invalidateQueries(['snippet', snippetId]);
            }
        }
    );
}

export const useDeleteSnippet = ({onSuccess}: {onSuccess: () => void}) => {
    const queryClient = useQueryClient();
    return useMutation<string, Error, string>(
        id => snippetOperations.deleteSnippet(id),
        {
            onSuccess: (_data, id) => {
                // Invalidate both the specific snippet and the snippets list
                queryClient.invalidateQueries(['snippet', id]);
                queryClient.invalidateQueries(['listSnippets']);
                queryClient.invalidateQueries(['testCases', id]); // Also remove test cases for this snippet
                onSuccess();
            },
        }
    );
}


export const useGetFileTypes = () => {
    return useQuery<FileType[], Error>('fileTypes', () => snippetOperations.getFileTypes());
}