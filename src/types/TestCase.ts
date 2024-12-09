export interface TestCase {
    id: string;
    name: string;
    input: string[];
    output: string[];
    envVars?: string; // Optional environment variables
    snippetId: string; // Ensure snippetId is included
    creator: string; // Add creator field
}
