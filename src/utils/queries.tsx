import { useMutation, UseMutationResult, useQuery } from 'react-query';
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from './snippet.ts';
import { SnippetOperations } from './snippetOperations.ts';
import { PaginatedUsers } from './users.ts';
import { TestCase } from '../types/TestCase.ts';
import { FileType } from '../types/FileType.ts';
import { Rule } from '../types/Rule.ts';
import { MySnippetOperations } from './mock/mySnippetOperations.tsx';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export const useSnippetsOperations = (): SnippetOperations => {
    const { getAccessTokenSilently } = useAuth0();
    const snippetOperations: SnippetOperations = new MySnippetOperations();

    useEffect(() => {
        getAccessTokenSilently()
            .then(token => {
                if (token) snippetOperations.setToken(token);
            })
            .catch(error => console.error('Error fetching token:', error));
    }, [getAccessTokenSilently]);

    return snippetOperations;
};

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
    const snippetOperations = useSnippetsOperations();

    return useQuery<PaginatedSnippets, Error>(
        ['listSnippets', page, pageSize, snippetName],
        () => snippetOperations.listSnippetDescriptors(page, pageSize, snippetName)
    );
};

export const useGetSnippetById = (id: string) => {
    const snippetOperations = useSnippetsOperations();

    return useQuery<Snippet | undefined, Error>(
        ['snippet', id],
        () => snippetOperations.getSnippetById(id),
        { enabled: !!id }
    );
};

export const useCreateSnippet = ({ onSuccess }: { onSuccess: () => void }): UseMutationResult<Snippet, Error, CreateSnippet> => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<Snippet, Error, CreateSnippet>(
        (createSnippet) => snippetOperations.createSnippet(createSnippet),
        { onSuccess }
    );
};

export const useUpdateSnippetById = ({
                                         onSuccess,
                                         onError,
                                     }: {
    onSuccess: () => void;
    onError?: (error: Error) => void;
}): UseMutationResult<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }> => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({ id, updateSnippet }) => snippetOperations.updateSnippetById(id, updateSnippet),
        { onSuccess, onError }
    );
};

export const useGetUsers = (name: string = '', page: number = 0, pageSize: number = 10) => {
    const snippetOperations = useSnippetsOperations();

    return useQuery<PaginatedUsers, Error>(
        ['users', name, page, pageSize],
        () => snippetOperations.getUserFriends(name, page, pageSize)
    );
};

export const useShareSnippet = (): UseMutationResult<Snippet, Error, { snippetId: string; userId: string }> => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        ({ snippetId, userId }) => snippetOperations.shareSnippet(snippetId, userId)
    );
};

export const useGetTestCases = (snippetId: string) => {
    const snippetOperations = useSnippetsOperations();

    return useQuery<TestCase[] | undefined, Error>(
        ['testCases', snippetId],
        () => snippetOperations.getTestCases(snippetId),
        { enabled: !!snippetId }
    );
};

export const usePostTestCase = (): UseMutationResult<TestCase, Error, Partial<TestCase>> => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<TestCase, Error, Partial<TestCase>>(
        (tc) => snippetOperations.postTestCase(tc)
    );
};

export const useRemoveTestCase = ({ onSuccess }: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<string, Error, string>(
        (id) => snippetOperations.removeTestCase(id),
        { onSuccess }
    );
};

export type TestCaseResult = 'success' | 'fail';

export const useTestSnippet = (): UseMutationResult<TestCaseResult, Error, Partial<TestCase>> => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<TestCaseResult, Error, Partial<TestCase>>(
        (tc) => snippetOperations.testSnippet(tc)
    );
};

export const useGetFormatRules = () => {
    const snippetOperations = useSnippetsOperations();

    return useQuery<Rule[], Error>('formatRules', () => snippetOperations.getFormatRules());
};

export const useModifyFormatRules = ({ onSuccess }: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<Rule[], Error, Rule[]>(
        (rule) => snippetOperations.modifyFormatRule(rule),
        { onSuccess }
    );
};

export const useGetLintingRules = () => {
    const snippetOperations = useSnippetsOperations();

    return useQuery<Rule[], Error>('lintingRules', () => snippetOperations.getLintingRules());
};

export const useModifyLintingRules = ({ onSuccess }: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<Rule[], Error, Rule[]>(
        (rule) => snippetOperations.modifyLintingRule(rule),
        { onSuccess }
    );
};

export const useFormatSnippet = (): UseMutationResult<string, Error, string> => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<string, Error, string>(
        (snippetContent: string) => snippetOperations.formatSnippet(snippetContent)
    );
};

export const useDeleteSnippet = ({ onSuccess }: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<string, Error, string>(
        (id) => snippetOperations.deleteSnippet(id),
        { onSuccess }
    );
};

export const useGetFileTypes = () => {
    const snippetOperations = useSnippetsOperations();

    return useQuery<FileType[], Error>('fileTypes', () => snippetOperations.getFileTypes());
};
