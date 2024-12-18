import {useMutation, UseMutationResult, useQuery} from 'react-query';
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from './snippet.ts';
import {SnippetOperations} from "./snippetOperations.ts";
import {PaginatedUsers} from "./users.ts";
import {FakeSnippetOperations} from "./mock/fakeSnippetOperations.ts";
import {TestCase} from "../types/TestCase.ts";
import {FileType} from "../types/FileType.ts";
import {Rule} from "../types/Rule.ts";

const snippetOperations: SnippetOperations = new FakeSnippetOperations(); // TODO: Replace with your implementation

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
    return useQuery<PaginatedSnippets, Error>(['listSnippets', page, pageSize], () => snippetOperations.listSnippetDescriptors(page, pageSize,snippetName));
};

export const useGetSnippetById = (id: string) => {
    return useQuery<Snippet | undefined, Error>(['snippet', id], () => snippetOperations.getSnippetById(id), {
        enabled: !!id, // This query will not execute until the id is provided
    });
};

export const useCreateSnippet = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<Snippet, Error, CreateSnippet> => {
    return useMutation<Snippet, Error, CreateSnippet>(createSnippet => snippetOperations.createSnippet(createSnippet), {onSuccess});
};

export const useUpdateSnippetById = ({onSuccess}: {onSuccess: () => void}): UseMutationResult<Snippet, Error, {
    id: string;
    updateSnippet: UpdateSnippet
}> => {
    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({id, updateSnippet}) => snippetOperations.updateSnippetById(id, updateSnippet),{
            onSuccess,
        }
    );
};

export const useGetUsers = (page: number = 0, pageSize: number = 10) => {
    return useQuery<PaginatedUsers, Error>(['users',page, pageSize], () => snippetOperations.getUserFriends(page, pageSize));
};

export const useShareSnippet = () => {
    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        ({snippetId, userId}) => snippetOperations.shareSnippet(snippetId, userId)
    );
};

export const useGetTestCases = (snippetId: string) => {
    return useQuery<TestCase[] | undefined, Error>(['testCases'], () => snippetOperations.getTestCases(snippetId), {});
};

export const usePostTestCase = (snippetId: string) => {
    return useMutation<TestCase, Error, Partial<TestCase>>(
        (tc) => snippetOperations.postTestCase({...tc, id: snippetId})
    );
};

export const useRemoveTestCase = ({onSuccess}: {onSuccess: () => void}) => {
    return useMutation<string, Error, string>(
        ['removeTestCase'],
        (id) => snippetOperations.removeTestCase(id),
        {
            onSuccess,
        }
    );
};

export type TestCaseResult = "success" | "fail"

export const useTestSnippet = (id: string, envVars: string) => {
    return useMutation<TestCaseResult, Error, Partial<TestCase>>(
        () => snippetOperations.testSnippet(id, envVars)
    )
}

export const useGetFormatRules = () => {
    return useQuery<Rule[], Error>('formatRules', () => snippetOperations.getFormatRules());
}

export const useModifyFormatRules = ({onSuccess}: {onSuccess: () => void}) => {
    return useMutation<Rule[], Error, Rule[]>(
        rule => snippetOperations.modifyFormatRule(rule),
        {onSuccess}
    );
}

export const useGetLintingRules = () => {
    return useQuery<Rule[], Error>('lintingRules', () => snippetOperations.getLintingRules());
}

export const useModifyLintingRules = ({onSuccess}: {onSuccess: () => void}) => {
    return useMutation<Rule[], Error, Rule[]>(
        rule => snippetOperations.modifyLintingRule(rule),
        {onSuccess}
    );
}

export const useFormatSnippet = (snippetId: string, language: string) => {
    return useMutation<string, Error, string>(
        () => snippetOperations.formatSnippet(snippetId, language)
    );
}

export const useDeleteSnippet = ({onSuccess}: {onSuccess: () => void}) => {
    return useMutation<string, Error, string>(
        id => snippetOperations.deleteSnippet(id),
        {
            onSuccess,
        }
    );
}


export const useGetFileTypes = () => {
    return useQuery<FileType[], Error>('fileTypes', () => snippetOperations.getFileTypes());
}