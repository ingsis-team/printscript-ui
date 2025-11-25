export type TestCase = {
    id: string;
    name: string;
    input?: string[];
    output?: string[];
    snippetId?: string;
    expected_status?: 'VALID' | 'INVALID';
};