import {SnippetOperations} from '../snippetOperations'
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet'
import autoBind from 'auto-bind'
import {PaginatedUsers} from "../users.ts";
import {TestCase} from "../../types/TestCase.ts";
import {TestCaseResult} from "../queries.tsx";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";
import axios from 'axios';
import {BACKEND_URL} from '../constants.ts';

const getToken = () => localStorage.getItem('token') || '';
const getUserId = () => localStorage.getItem('userId') || '';

const SNIPPET_SERVICE_URL = `${BACKEND_URL}/snippets`;
const PERMISSION_SERVICE_URL = `${BACKEND_URL.replace('8080', '8081')}/permissions`;

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'ngrok-skip-browser-warning': '69420'
});

export class RealSnippetOperations implements SnippetOperations {
    constructor() {
        autoBind(this)
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        try {
            // Convert to multipart/form-data as backend expects
            const formData = new FormData();
            const blob = new Blob([createSnippet.content], {type: 'text/plain'});
            const file = new File([blob], `${createSnippet.name}.${createSnippet.extension}`, {type: 'text/plain'});
            
            formData.append('file', file);
            formData.append('name', createSnippet.name);
            formData.append('description', ''); // Add description field
            formData.append('language', createSnippet.language);
            formData.append('version', '1.1'); // Default version

            const response = await axios.post(
                SNIPPET_SERVICE_URL,
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // Map backend response to frontend Snippet model
            return this.mapBackendSnippetToFrontend(response.data);
        } catch (error: any) {
            // Extract detailed error message from backend response
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    async getSnippetById(id: string): Promise<Snippet | undefined> {
        try {
            const response = await axios.get(
                `${SNIPPET_SERVICE_URL}/${id}`,
                {
                    headers: getAuthHeaders(),
                }
            );
            return this.mapBackendSnippetToFrontend(response.data);
        } catch (error: any) {
            if (error.response?.status === 404) {
                return undefined;
            }
            throw new Error(`Error fetching snippet: ${error.message}`);
        }
    }

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        try {
            const response = await axios.get(
                SNIPPET_SERVICE_URL,
                {
                    headers: getAuthHeaders(),
                    params: {
                        page,
                        size: pageSize,
                        name: snippetName,
                    },
                }
            );

            // Get permissions for current user to determine which snippets they can see
            const userId = getUserId();
            const permissionsResponse = await axios.get(
                `${PERMISSION_SERVICE_URL}/user/${userId}`,
                {
                    headers: getAuthHeaders(),
                }
            );

            const snippets = response.data.map((s: any) => this.mapBackendSnippetToFrontend(s));
            
            return {
                content: snippets,
                page,
                page_size: pageSize,
                count: snippets.length,
            };
        } catch (error: any) {
            throw new Error(`Error fetching snippets: ${error.message}`);
        }
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        try {
            // Check write permission first
            const hasWritePermission = await this.checkWritePermission(id);
            if (!hasWritePermission) {
                throw new Error('You do not have permission to update this snippet');
            }

            // Convert to multipart/form-data
            const formData = new FormData();
            const blob = new Blob([updateSnippet.content], {type: 'text/plain'});
            const file = new File([blob], `snippet.txt`, {type: 'text/plain'});
            
            formData.append('file', file);

            const response = await axios.put(
                `${SNIPPET_SERVICE_URL}/${id}`,
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return this.mapBackendSnippetToFrontend(response.data);
        } catch (error: any) {
            // Extract detailed error message from backend response
            const errorMessage = this.extractErrorMessage(error);
            throw new Error(errorMessage);
        }
    }

    async getUserFriends(page: number = 0, pageSize: number = 10): Promise<PaginatedUsers> {
        // TODO: Implement user service integration when available
        // For now, return mock data
        return {
            page,
            page_size: pageSize,
            count: 0,
            users: []
        };
    }

    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        try {
            // Create permission for the target user
            await axios.post(
                PERMISSION_SERVICE_URL,
                {
                    snippet_id: parseInt(snippetId),
                    user_id: userId,
                    role: 'READ' // Default to read permission
                },
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Return the snippet
            const snippet = await this.getSnippetById(snippetId);
            if (!snippet) {
                throw new Error('Snippet not found');
            }
            return snippet;
        } catch (error: any) {
            throw new Error(`Error sharing snippet: ${error.message}`);
        }
    }

    async getFormatRules(): Promise<Rule[]> {
        // TODO: Implement when format rules endpoint is available
        return [];
    }

    async getLintingRules(): Promise<Rule[]> {
        // TODO: Implement when linting rules endpoint is available
        return [];
    }

    async formatSnippet(snippetId: string, language: string): Promise<string> {
        // TODO: Implement when format endpoint is available
        throw new Error('Format snippet not implemented yet');
    }

    async getTestCases(snippetId: string): Promise<TestCase[]> {
        // TODO: Implement when test cases endpoint is available
        return [];
    }

    async postTestCase(testCase: TestCase): Promise<TestCase> {
        // TODO: Implement when test cases endpoint is available
        throw new Error('Post test case not implemented yet');
    }

    async removeTestCase(id: string): Promise<string> {
        // TODO: Implement when test cases endpoint is available
        throw new Error('Remove test case not implemented yet');
    }

    async testSnippet(id: string, envVars: string): Promise<TestCaseResult> {
        // TODO: Implement when test execution endpoint is available
        throw new Error('Test snippet not implemented yet');
    }

    async deleteSnippet(id: string): Promise<string> {
        try {
            await axios.delete(
                `${SNIPPET_SERVICE_URL}/${id}`,
                {
                    headers: getAuthHeaders(),
                }
            );
            return id;
        } catch (error: any) {
            throw new Error(`Error deleting snippet: ${error.message}`);
        }
    }

    async getFileTypes(): Promise<FileType[]> {
        // Return supported file types
        return [
            {language: 'printscript', extension: 'prs'},
            {language: 'printscript', extension: 'ps'},
        ];
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        // TODO: Implement when format rules endpoint is available
        return newRules;
    }

    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        // TODO: Implement when linting rules endpoint is available
        return newRules;
    }

    // Helper methods

    private async checkWritePermission(snippetId: string): Promise<boolean> {
        try {
            const userId = getUserId();
            const response = await axios.get(
                `${PERMISSION_SERVICE_URL}/write-check`,
                {
                    headers: getAuthHeaders(),
                    params: {
                        snippetId: parseInt(snippetId),
                        userId,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return false;
        }
    }

    private mapBackendSnippetToFrontend(backendSnippet: any): Snippet {
        return {
            id: String(backendSnippet.id),
            name: backendSnippet.name,
            content: backendSnippet.content,
            language: backendSnippet.language,
            extension: this.getExtensionFromLanguage(backendSnippet.language),
            author: backendSnippet.user_id || backendSnippet.userId || 'Unknown',
            compliance: this.mapComplianceStatus(backendSnippet),
        };
    }

    private getExtensionFromLanguage(language: string): string {
        const extensionMap: Record<string, string> = {
            'printscript': 'prs',
            'PRINTSCRIPT': 'prs',
        };
        return extensionMap[language] || 'prs';
    }

    private mapComplianceStatus(backendSnippet: any): 'pending' | 'failed' | 'not-compliant' | 'compliant' {
        // Map backend validation status to frontend compliance enum
        // This will need to be adjusted based on actual backend response
        if (backendSnippet.status === 'VALIDATED') return 'compliant';
        if (backendSnippet.status === 'INVALID') return 'not-compliant';
        if (backendSnippet.status === 'FAILED') return 'failed';
        return 'pending';
    }

    private extractErrorMessage(error: any): string {
        // Try to extract detailed error message from various response formats
        if (error.response) {
            // Check for different error response formats
            const data = error.response.data;
            
            // Format 1: { message: "error message" }
            if (data?.message) {
                return data.message;
            }
            
            // Format 2: { error: "error message" }
            if (data?.error) {
                return data.error;
            }
            
            // Format 3: String response
            if (typeof data === 'string') {
                return data;
            }
            
            // Format 4: Validation errors with line/column info
            if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                const firstError = data.errors[0];
                return `Syntax error at line ${firstError.line}, column ${firstError.column}: ${firstError.message}`;
            }
            
            // Fallback to status text
            if (error.response.status === 400) {
                return 'Invalid snippet syntax or data';
            }
            if (error.response.status === 403) {
                return 'You do not have permission to perform this action';
            }
            if (error.response.status === 404) {
                return 'Snippet not found';
            }
        }
        
        // Fallback to generic error message
        return error.message || 'An unexpected error occurred';
    }
}

