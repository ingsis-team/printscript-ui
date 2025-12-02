import {Pagination} from "./pagination.ts";
import {FileType} from "../types/FileType.ts";

export type ComplianceEnum =
    'pending' |
    'failed' |
    'not-compliant' |
    'compliant'


export type CreateSnippet = {
    name: string;
    content: string;
    language: string;
    extension: string;
    description?: string;
}

export type CreateSnippetWithLang = CreateSnippet & { language: string }

export type UpdateSnippet = {
    content?: string;
    name?: string;
    description?: string;
}

export type BackendSnippet = {
    id: string;
    name: string;
    description: string;
    language: string;
    content: string;
    user_id: string;
    version: string;
    created_at: string;
    updated_at: string;
}

export type Snippet = CreateSnippet & {
    id: string
    author: string;
    compliance: ComplianceEnum;
    created_at?: string;
    updated_at?: string;
    user_id?: string;
    version?: string;
}

export type PaginatedSnippets = Pagination & {
    content: Snippet[]
}

export const getFileLanguage = (fileTypes: FileType[], fileExt?: string) => {
    if (!fileExt) return undefined;
    const normalized = String(fileExt).toLowerCase().replace(/^\./, '');

    // First, try exact match
    let match = fileTypes?.find(x => x.extension === normalized);

    // If not found and extension is 'prs', try to find 'ps' (they're both PrintScript)
    if (!match && normalized === 'prs') {
        match = fileTypes?.find(x => x.extension === 'ps' || x.language.toLowerCase() === 'printscript');
    }

    // If not found and extension is 'ps', check if it's actually PrintScript
    if (!match && normalized === 'ps') {
        match = fileTypes?.find(x => x.extension === 'ps' || x.language.toLowerCase() === 'printscript');
    }

    return match;
}