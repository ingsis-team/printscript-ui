export type FileType = {
    // value used in the UI (e.g. 'printscript')
    language: string;
    // extension like 'ps' or 'prs'
    extension: string;
    // optional display name (e.g. 'PrintScript')
    name?: string;
    // optional description from backend
    description?: string;
    // original id from backend (if any)
    id?: string;
}
