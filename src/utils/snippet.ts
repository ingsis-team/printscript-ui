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
}

export type CreateSnippetWithLang = CreateSnippet & { language: string }

export type UpdateSnippet = {
    content: string
}

export type Snippet = CreateSnippet & {
    id: string
} & SnippetStatus & {
    description?: string;
}

type SnippetStatus = {
    compliance: ComplianceEnum;
    author: string;
}
export type PaginatedSnippets = Pagination & {
    content: Snippet[]
}

export const getFileLanguage = (fileTypes: FileType[], fileExt?: string) => {
    return fileExt && fileTypes?.find(x => x.extension == fileExt)
}