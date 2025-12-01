import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import { BACKEND_URL, PRINTSCRIPT_SERVICE_URL } from './constants';
import { FormattingRule, LintingRule, FormattingResponse, LintingResponse } from '../types/Rule';
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from './snippet';
import { PaginatedUsers } from './users';
import { TestCase } from '../types/TestCase';
import { FileType } from '../types/FileType';

const getToken = () => localStorage.getItem('token') || '';
const getUserId = () => localStorage.getItem('userId') || '';

// Helper: generar correlation id (usa crypto.randomUUID cuando está disponible)
const generateCorrelationId = () => {
    try {
        if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
            return (crypto as any).randomUUID();
        }
    } catch (e) {
        // ignore
    }
    // Fallback simple
    return `corr-${Math.random().toString(36).slice(2, 10)}`;
};

// getAuthHeaders ahora permite controlar inclusion de Content-Type y Correlation-id
const getAuthHeaders = (opts: { contentType?: boolean; includeCorrelation?: boolean } = {}) => {
    const { contentType = true, includeCorrelation = true } = opts;
    const headers: any = {
        'Authorization': `Bearer ${getToken()}`,
        'ngrok-skip-browser-warning': '69420'
    };
    if (contentType) headers['Content-Type'] = 'application/json';
    if (includeCorrelation) headers['Correlation-id'] = generateCorrelationId();
    return headers;
};

const CODE_ANALYSIS_URL = `${PRINTSCRIPT_SERVICE_URL}`;
const SNIPPET_SERVICE_URL = `${BACKEND_URL}/api/snippets`;

// Helpers para mapear entre frontend y backend
const toBackendFormattingRule = (r: FormattingRule) => ({
    name: r.name,
    value: r.value,
});

const toBackendLintingRule = (r: LintingRule) => ({
    name: r.name,
    value: r.value,
});

const fromBackendFormattingRule = (r: any): FormattingRule => ({
    name: String(r.name),
    value: r.value ?? null,
    description: r.description ?? undefined,
});

const fromBackendLintingRule = (r: any): LintingRule => ({
    id: r.id ? String(r.id) : undefined,
    name: String(r.name),
    value: r.value ?? null,
    description: r.description ?? undefined,
});

// ============= SNIPPET QUERIES =============

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string, tokenReady?: boolean) => {
    return useQuery<PaginatedSnippets, Error>(
        ['listSnippets', page, pageSize, snippetName, tokenReady],
        async () => {
            const response = await axios.get(SNIPPET_SERVICE_URL, {
                headers: getAuthHeaders(),
            });

            const allSnippets = Array.isArray(response.data) ? response.data : [];
            const snippets = allSnippets.map((s: any) => ({
                id: s.id,
                name: s.name,
                content: s.content,
                language: s.language.toLowerCase(),
                extension: s.language === 'PRINTSCRIPT' ? 'prs' : 'ps',
                description: s.description || '',
                author: s.user_id || 'unknown',
                compliance: s.compliance || 'pending',
                created_at: s.created_at,
                updated_at: s.updated_at,
                user_id: s.user_id,
                version: s.version,
            }));

            let filteredSnippets = snippets;
            if (snippetName && snippetName.trim()) {
                filteredSnippets = snippets.filter((snippet: Snippet) =>
                    snippet.name.toLowerCase().includes(snippetName.toLowerCase())
                );
            }

            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedSnippets = filteredSnippets.slice(startIndex, endIndex);

            return {
                content: paginatedSnippets,
                page,
                page_size: pageSize,
                count: filteredSnippets.length,
            };
        },
        {
            enabled: !!getToken() && tokenReady !== false,
            retry: 1,
            staleTime: 1000 * 60 * 5,
        }
    );
};

export const useGetSnippetById = (id: string) => {
    return useQuery<Snippet | undefined, Error>(
        ['snippet', id],
        async () => {
            const response = await axios.get(`${SNIPPET_SERVICE_URL}/${id}`, {
                headers: getAuthHeaders(),
            });

            const s = response.data;
            return {
                id: s.id,
                name: s.name,
                content: s.content,
                language: s.language.toLowerCase(),
                extension: s.language === 'PRINTSCRIPT' ? 'prs' : 'ps',
                description: s.description || '',
                author: s.user_id || 'unknown',
                compliance: s.compliance || 'pending',
                created_at: s.created_at,
                updated_at: s.updated_at,
                user_id: s.user_id,
                version: s.version,
            };
        },
        {
            enabled: !!id,
        }
    );
};

export const useCreateSnippet = ({ onSuccess }: { onSuccess: () => void }) => {
    const queryClient = useQueryClient();
    return useMutation<Snippet, Error, CreateSnippet>(
        async (createSnippet) => {
            const requestBody = {
                name: createSnippet.name,
                description: createSnippet.description || '',
                language: createSnippet.language.toUpperCase(),
                content: createSnippet.content,
                version: '1.1',
            };

            const response = await axios.post(SNIPPET_SERVICE_URL, requestBody, {
                headers: getAuthHeaders(),
            });

            const s = response.data;
            return {
                id: s.id,
                name: s.name,
                content: s.content,
                language: s.language.toLowerCase(),
                extension: s.language === 'PRINTSCRIPT' ? 'prs' : 'ps',
                description: s.description || '',
                author: s.user_id || 'unknown',
                compliance: s.compliance || 'pending',
            };
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['listSnippets']);
                onSuccess();
            }
        }
    );
};

export const useUpdateSnippetById = ({ onSuccess, onError }: { onSuccess: () => void, onError?: (error: Error) => void }) => {
    const queryClient = useQueryClient();
    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        async ({ id, updateSnippet }) => {
            const requestBody: any = {};
            if (updateSnippet.content !== undefined) requestBody.content = updateSnippet.content;
            if (updateSnippet.name !== undefined) requestBody.name = updateSnippet.name;
            if (updateSnippet.description !== undefined) requestBody.description = updateSnippet.description;

            const response = await axios.put(`${SNIPPET_SERVICE_URL}/${id}`, requestBody, {
                headers: getAuthHeaders(),
            });

            const s = response.data;
            return {
                id: s.id,
                name: s.name,
                content: s.content,
                language: s.language.toLowerCase(),
                extension: s.language === 'PRINTSCRIPT' ? 'prs' : 'ps',
                description: s.description || '',
                author: s.user_id || 'unknown',
                compliance: s.compliance || 'pending',
            };
        },
        {
            onSuccess: (_data, variables) => {
                queryClient.invalidateQueries(['snippet', variables.id]);
                queryClient.invalidateQueries(['listSnippets']);
                onSuccess();
            },
            onError,
        }
    );
};

export const useDeleteSnippet = ({ onSuccess, onError }: { onSuccess?: () => void, onError?: (error: Error) => void } = {}) => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>(
        async (snippetId) => {
            await axios.delete(`${SNIPPET_SERVICE_URL}/${snippetId}`, {
                headers: getAuthHeaders(),
            });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['listSnippets']);
                onSuccess?.();
            },
            onError,
        }
    );
};

export const useGetUsers = (page: number = 0, pageSize: number = 10, name?: string) => {
    return useQuery<PaginatedUsers, Error>(
        ['users', name, page, pageSize],
        async () => {
            const response = await axios.get(`${SNIPPET_SERVICE_URL}/users`, {
                headers: getAuthHeaders(),
                params: { page, pageSize, name },
            });
            return response.data;
        }
    );
};

export const useShareSnippet = ({ onSuccess, onError }: { onSuccess?: () => void, onError?: (error: Error) => void } = {}) => {
    const queryClient = useQueryClient();
    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        async ({ snippetId, userId }) => {
            const response = await axios.post(
                `${SNIPPET_SERVICE_URL}/${snippetId}/share`,
                { userId },
                { headers: getAuthHeaders() }
            );
            return response.data;
        },
        {
            onSuccess: (_data, variables) => {
                queryClient.invalidateQueries(['snippet', variables.snippetId]);
                queryClient.invalidateQueries(['listSnippets']);
                onSuccess?.();
            },
            onError,
        }
    );
};

export const useGetTestCases = (snippetId: string) => {
    return useQuery<TestCase[] | undefined, Error>(
        ['testCases', snippetId],
        async () => {
            const response = await axios.get(`${SNIPPET_SERVICE_URL}/${snippetId}/tests`, {
                headers: getAuthHeaders(),
            });
            return response.data;
        }
    );
};

export const usePostTestCase = (snippetId: string) => {
    const queryClient = useQueryClient();
    return useMutation<TestCase, Error, Partial<TestCase>>(
        async (tc) => {
            const response = await axios.post(
                `${SNIPPET_SERVICE_URL}/${snippetId}/tests`,
                { ...tc, snippetId },
                { headers: getAuthHeaders() }
            );
            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['testCases', snippetId]);
            }
        }
    );
};

export const useRemoveTestCase = ({ onSuccess }: { onSuccess: () => void }) => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { snippetId: string; testCaseId: string }>(
        async ({ snippetId, testCaseId }) => {
            await axios.delete(`${SNIPPET_SERVICE_URL}/${snippetId}/tests/${testCaseId}`, {
                headers: getAuthHeaders(),
            });
        },
        {
            onSuccess: (_data, variables) => {
                queryClient.invalidateQueries(['testCases', variables.snippetId]);
                onSuccess();
            }
        }
    );
};

export const useGetFileTypes = () => {
    return useQuery<FileType[], Error>(
        ['fileTypes'],
        async () => {
            const response = await axios.get(`${BACKEND_URL}/api/languages`, {
                headers: getAuthHeaders(),
            });
            const data = Array.isArray(response.data) ? response.data : [];
            // Map backend Language objects to the FileType used by the UI
            return data.map((item: any) => {
                // Backend example: { id: 'printscript', name: 'PrintScript', extension: 'ps', description: '...' }
                const id = item.id ?? item.language ?? item.name ?? '';
                const ext = item.extension ?? item.ext ?? 'ps';
                return {
                    language: String(id).toLowerCase(),
                    extension: String(ext).toLowerCase().replace(/^[.]/, ''),
                    name: item.name,
                    description: item.description,
                    id: item.id,
                } as FileType;
            });
        },
        {
            staleTime: Infinity,
        }
    );
};

export type TestCaseResult = {
    id: string;
    success: boolean;
    output: string;
};

export const useRunTestCase = ({ onSuccess, onError }: { onSuccess?: (result: TestCaseResult) => void, onError?: (error: Error) => void } = {}) => {
    return useMutation<TestCaseResult, Error, { snippetId: string; testCaseId: string }>(
        async ({ snippetId, testCaseId }) => {
            const response = await axios.post(
                `${SNIPPET_SERVICE_URL}/${snippetId}/tests/${testCaseId}/run`,
                {},
                { headers: getAuthHeaders() }
            );
            return response.data;
        },
        {
            onSuccess,
            onError,
        }
    );
};

export const useTestSnippet = ({ onSuccess, onError }: { onSuccess?: (result: TestCaseResult) => void, onError?: (error: Error) => void } = {}) => {
    return useMutation<TestCaseResult, Error, { snippetId: string; testCase: Partial<TestCase> }>(
        async ({ snippetId, testCase }) => {
            const response = await axios.post(
                `${SNIPPET_SERVICE_URL}/${snippetId}/test`,
                testCase,
                { headers: getAuthHeaders() }
            );
            return response.data;
        },
        {
            onSuccess,
            onError,
        }
    );
};

// ============= FORMATTING RULES =============

export const useGetFormattingRules = () => {
    return useQuery<FormattingRule[], Error>(
        ['formattingRules'],
        async () => {
            const response = await axios.get(`${BACKEND_URL}/rules/format`, {
                headers: getAuthHeaders({ contentType: false }),
            });
            const data = Array.isArray(response.data) ? response.data : [];
            return data.map(fromBackendFormattingRule) as FormattingRule[];
        },
        {
            enabled: !!getToken(),
            retry: 1,
        }
    );
};

export const useSaveFormattingRules = ({
    onSuccess,
    onError
}: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
} = {}) => {
    const queryClient = useQueryClient();

    return useMutation<FormattingRule[], Error, { rules: FormattingRule[] }>(
        async ({ rules }) => {
            const toSend = (rules || []).map(toBackendFormattingRule);

            const response = await axios.post(
                `${BACKEND_URL}/rules/format`,
                toSend,
                { headers: getAuthHeaders() }
            );

            const data = Array.isArray(response.data) ? response.data : [];
            return data.map(fromBackendFormattingRule) as FormattingRule[];
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['formattingRules']);
                onSuccess?.();
            },
            onError,
        }
    );
};

export const useFormatSnippet = ({
    onSuccess,
    onError
}: {
    onSuccess?: (formattedContent: string) => void;
    onError?: (error: Error) => void;
} = {}) => {
    return useMutation<FormattingResponse, Error, { snippetId: string }>(
        async ({ snippetId }) => {
            const response = await axios.post(
                `${CODE_ANALYSIS_URL}/format`,
                { snippetId },
                { headers: getAuthHeaders() }
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                onSuccess?.(data.formattedContent);
            },
            onError,
        }
    );
};

// ============= LINTING RULES =============

export const useGetLintingRules = () => {
    return useQuery<LintingRule[], Error>(
        ['lintingRules'],
        async () => {
            const response = await axios.get(`${BACKEND_URL}/rules/lint`, {
                headers: getAuthHeaders({ contentType: false }),
            });
            const data = Array.isArray(response.data) ? response.data : [];
            return data.map(fromBackendLintingRule) as LintingRule[];
        },
        {
            enabled: !!getToken(),
            retry: 1,
            onError: (error: any) => {
                console.error('Error fetching linting rules:', error);
            },
        }
    );
};

export const useSaveLintingRules = ({
    onSuccess,
    onError
}: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
} = {}) => {
    const queryClient = useQueryClient();

    return useMutation<LintingRule[], Error, { rules: LintingRule[] }>(
        async ({ rules }) => {
            const toSend = (rules || []).map(toBackendLintingRule);
            const response = await axios.post(
                `${BACKEND_URL}/rules/lint`,
                toSend,
                { headers: getAuthHeaders() }
            );
            const data = Array.isArray(response.data) ? response.data : [];
            return data.map(fromBackendLintingRule) as LintingRule[];
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['lintingRules']);
                queryClient.invalidateQueries(['listSnippets']); // Refresh snippets to show updated compliance
                onSuccess?.();
            },
            onError,
        }
    );
};

export const useLintSnippet = ({
    onSuccess,
    onError
}: {
    onSuccess?: (response: LintingResponse) => void;
    onError?: (error: Error) => void;
} = {}) => {
    return useMutation<LintingResponse, Error, { snippetId: string }>(
        async ({ snippetId }) => {
            const response = await axios.post(
                `${CODE_ANALYSIS_URL}/lint`,
                { snippetId },
                { headers: getAuthHeaders() }
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                onSuccess?.(data);
            },
            onError,
        }
    );
};
