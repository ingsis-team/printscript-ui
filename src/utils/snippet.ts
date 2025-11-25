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
    content: string
}

// Tipo que coincide exactamente con la respuesta de la API
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
    return fileExt && fileTypes?.find(x => x.extension == fileExt)
}