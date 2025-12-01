import {SnippetOperations} from '../snippetOperations'
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet'
import autoBind from 'auto-bind'
import {PaginatedUsers} from "../users.ts";
import {TestCase} from "../../types/TestCase.ts";
import {TestCaseResult} from "../queries.tsx";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";
import axios from 'axios';
import {BACKEND_URL, PRINTSCRIPT_SERVICE_URL} from '../constants.ts';

const getToken = () => {
    const token = localStorage.getItem('token') || '';
    return token;
};
const getUserId = () => localStorage.getItem('userId') || '';

const SNIPPET_SERVICE_URL = `${BACKEND_URL}/api/snippets`;
const PERMISSION_SERVICE_URL = `${BACKEND_URL.replace('8080', '8081')}/permissions`;

const getAuthHeaders = () => {
    const token = getToken();
    const headers = {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420'
    };
    return headers;
};

export class RealSnippetOperations implements SnippetOperations {
    constructor() {
        autoBind(this)
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        try {
            // Backend expects snake_case
            const requestBody = {
                name: createSnippet.name,
                description: createSnippet.description || '', // Use provided description or empty string
                language: createSnippet.language.toUpperCase(), // Convert to uppercase enum
                content: createSnippet.content,
                version: '1.1', // Default version
            };

            const response = await axios.post(
                SNIPPET_SERVICE_URL,
                requestBody,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
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
            // Simplificar la llamada para que coincida exactamente con el curl que funciona
            const response = await axios.get(
                SNIPPET_SERVICE_URL,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true, // Para incluir cookies
                }
            );

            // Backend returns List<SnippetResponseDTO>, not paginated
            const allSnippets = Array.isArray(response.data) ? response.data : [];
            
            // Map backend snippets to frontend format
            const snippets = allSnippets.map((s: any) => this.mapBackendSnippetToFrontend(s));

            // Apply pagination and filtering on frontend side
            let filteredSnippets = snippets;

            // Apply name filter if provided
            if (snippetName && snippetName.trim()) {
                filteredSnippets = snippets.filter(snippet =>
                    snippet.name.toLowerCase().includes(snippetName.toLowerCase())
                );
            }

            // Apply pagination on frontend side
            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedSnippets = filteredSnippets.slice(startIndex, endIndex);

            return {
                content: paginatedSnippets,
                page,
                page_size: pageSize,
                count: filteredSnippets.length,
            };
        } catch (error: any) {
            // More detailed error handling
            if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
                throw new Error(`Network Error: Could not connect to backend. Please check if the service is running.`);
            }
            throw new Error(`Error fetching snippets: ${error.message}`);
        }
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        try {
            console.log('Attempting to update snippet with ID:', id);
            console.log('Update data:', updateSnippet);
            console.log('Using token:', getToken() ? 'Token exists' : 'No token found');
            console.log('Backend URL:', SNIPPET_SERVICE_URL);

            // Build request body based on what fields are provided
            const requestBody: any = {};

            if (updateSnippet.content !== undefined) {
                requestBody.content = updateSnippet.content;
            }
            if (updateSnippet.name !== undefined) {
                requestBody.name = updateSnippet.name;
            }
            if (updateSnippet.description !== undefined) {
                requestBody.description = updateSnippet.description;
            }

            console.log('Request body:', requestBody);

            const response = await axios.put(
                `${SNIPPET_SERVICE_URL}/${id}`,
                requestBody,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Update response:', response.status, response.data);
            return this.mapBackendSnippetToFrontend(response.data);
        } catch (error: any) {
            console.error('Error in updateSnippetById:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            // Provide more detailed error information based on backend response
            if (error.response?.status === 404) {
                throw new Error(`Snippet with ID ${id} not found`);
            } else if (error.response?.status === 403) {
                throw new Error('You do not have permission to update this snippet');
            } else if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else {
                throw new Error(`Error updating snippet: ${error.response?.data?.message || error.message}`);
            }
        }
    }

    async getUserFriends(page: number = 0, pageSize: number = 10, name?: string): Promise<PaginatedUsers> {
        try {
            console.log('Fetching all users for sharing');
            console.log('Current user ID:', getUserId());

            const response = await axios.get(
                `${SNIPPET_SERVICE_URL}/users`,
                {
                    headers: getAuthHeaders(),
                }
            );

            console.log('Users response:', response.data);

            // Backend returns List<Auth0UserDTO>
            const backendUsers = Array.isArray(response.data) ? response.data : [];
            
            // Get current user ID to filter out from the list
            const currentUserId = getUserId();

            // Map backend users to frontend format and filter out current user
            const users = backendUsers
                .filter((u: any) => u.user_id !== currentUserId) // Exclude current user
                .map((u: any) => ({
                    id: u.user_id,
                    user_id: u.user_id,
                    name: u.name || u.email,
                    username: u.nickname || u.email,
                    email: u.email,
                    nickname: u.nickname,
                    picture: u.picture,
                }));

            // Apply name filter if provided (search in email and nickname)
            let filteredUsers = users;
            if (name && name.trim()) {
                filteredUsers = users.filter(user =>
                    user.email?.toLowerCase().includes(name.toLowerCase()) ||
                    user.nickname?.toLowerCase().includes(name.toLowerCase()) ||
                    user.name?.toLowerCase().includes(name.toLowerCase())
                );
            }

            // Apply pagination on frontend side
            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

            console.log(`Filtered users (excluding current user ${currentUserId}):`, paginatedUsers);

            return {
                page,
                page_size: pageSize,
                count: filteredUsers.length,
                users: paginatedUsers,
            };
        } catch (error: any) {
            console.error('Error fetching users:', error);
            // Return empty list on error
            return {
                page,
                page_size: pageSize,
                count: 0,
                users: []
            };
        }
    }

    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        try {
            console.log('Attempting to share snippet:', snippetId, 'with user:', userId);
            console.log('Using token:', getToken() ? 'Token exists' : 'No token found');

            const response = await axios.post(
                `${SNIPPET_SERVICE_URL}/share`,
                {
                    snippet_id: snippetId, // Use string ID as in your curl
                    target_user_id: userId,
                },
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Share response:', response.status, response.data);

            // Check if sharing was successful based on the response format you provided
            if (response.data.message && response.data.message.includes('exitosamente')) {
                console.log('Snippet shared successfully');
            }

            // Return the snippet
            const snippet = await this.getSnippetById(snippetId);
            if (!snippet) {
                throw new Error('Snippet not found');
            }
            return snippet;
        } catch (error: any) {
            console.error('Error sharing snippet:', error);
            console.error('Share error response:', error.response?.data);
            console.error('Share error status:', error.response?.status);

            // Provide more detailed error information based on backend response
            if (error.response?.status === 404) {
                throw new Error('Snippet or user not found');
            } else if (error.response?.status === 403) {
                throw new Error('You do not have permission to share this snippet');
            } else if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else if (error.response?.status === 400) {
                throw new Error('Invalid request. Please check the snippet ID and user ID.');
            } else {
                // Extract detailed error message from backend response
                const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
                throw new Error(`Error sharing snippet: ${errorMessage}`);
            }
        }
    }

    async getFormatRules(): Promise<Rule[]> {
        try {
            const userId = getUserId();
            // Encode the userId to handle special characters like @ in emails
            const encodedUserId = encodeURIComponent(userId);
            const correlationId = crypto.randomUUID();

            console.log('Fetching format rules for userId:', userId, 'encoded:', encodedUserId);

            const response = await axios.get(
                `${PRINTSCRIPT_SERVICE_URL}/format/${encodedUserId}`,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Correlation-id': correlationId,
                    },
                }
            );
            
            console.log('Format rules response:', response.data);

            // Map backend rules to frontend format
            return this.mapBackendRulesToFrontend(response.data);
        } catch (error: any) {
            console.error('Error fetching format rules:', error);
            console.error('Error response:', error.response?.data);

            // Return default format rules if there's an error
            return this.getDefaultFormatRules();
        }
    }

    async getLintingRules(): Promise<Rule[]> {
        try {
            const userId = getUserId();
            // Encode the userId to handle special characters like @ in emails
            const encodedUserId = encodeURIComponent(userId);
            const correlationId = crypto.randomUUID();

            console.log('Fetching linting rules for userId:', userId, 'encoded:', encodedUserId);

            const response = await axios.get(
                `${PRINTSCRIPT_SERVICE_URL}/lint/${encodedUserId}`,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Correlation-id': correlationId,
                    },
                }
            );
            
            console.log('Linting rules response:', response.data);

            // Map backend rules to frontend format
            return this.mapBackendRulesToFrontend(response.data);
        } catch (error: any) {
            console.error('Error fetching linting rules:', error);
            console.error('Error response:', error.response?.data);

            // Return default linting rules if there's an error
            return this.getDefaultLintingRules();
        }
    }

    async formatSnippet(snippetId: string, language: string): Promise<string> {
        try {
            // Get the snippet first to get its content
            const snippet = await this.getSnippetById(snippetId);
            if (!snippet) {
                throw new Error('Snippet not found');
            }

            const userId = getUserId();
            const correlationId = crypto.randomUUID();

            console.log('Attempting to format snippet:', {
                snippetId,
                userId,
                language,
                correlationId,
                contentLength: snippet.content.length
            });

            // Build the request according to SnippetDTO format
            // Service expects lowercase "printscript", not "PRINTSCRIPT"
            const requestBody = {
                correlationId,
                snippetId,
                language: language.toLowerCase(), // printscript
                version: '1.1',
                input: snippet.content,
                userId,
            };

            const response = await axios.post(
                `${PRINTSCRIPT_SERVICE_URL}/format`,
                requestBody,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000, // 30 second timeout
                }
            );

            console.log('Format response:', response.status, response.data);

            // Return the formatted code from SnippetOutputDTO
            // Backend returns: { snippet: string, correlationId: UUID, snippetId: string }
            const formattedCode = response.data.snippet || response.data.string || response.data.output;
            if (typeof formattedCode !== 'string') {
                throw new Error('Invalid response format: formatted code is not a string');
            }
            return formattedCode;
        } catch (error: any) {
            console.error('Error formatting snippet:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            // Handle specific error cases
            if (error.response?.status === 422) {
                const errorMsg = error.response?.data?.message || 'The snippet content cannot be formatted. Please check the syntax.';
                throw new Error(`Formatting Error: ${errorMsg}`);
            } else if (error.response?.status === 500) {
                throw new Error('Server error while formatting. The formatting service may be unavailable.');
            } else {
                const errorMessage = error.response?.data?.message || error.message;
                throw new Error(`Error formatting snippet: ${errorMessage}`);
            }
        }
    }

    async getTestCases(snippetId: string): Promise<TestCase[]> {
        try {
            console.log('Fetching test cases for snippet ID:', snippetId);

            const response = await axios.get(
                `${SNIPPET_SERVICE_URL}/${snippetId}/tests`,
                {
                    headers: getAuthHeaders(),
                }
            );
            
            console.log('Test cases response:', response.data);

            // Map backend test format to frontend format
            // Use "snippetId-testId" format for the test ID
            const testCases = response.data.map((test: any) => {
                const testCaseId = `${snippetId}-${test.id}`;
                console.log('Creating test case with ID:', testCaseId, 'from snippetId:', snippetId, 'and testId:', test.id);

                return {
                    id: testCaseId,
                    name: test.name,
                    input: test.inputs || [],
                    output: test.expected_outputs || test.expectedOutputs || [],
                    snippetId: snippetId,
                    expected_status: test.expected_status || 'VALID', // Map backend expected_status
                };
            });

            console.log('Mapped test cases:', testCases);
            return testCases;
        } catch (error: any) {
            console.error('Error fetching test cases:', error);
            return [];
        }
    }

    async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        try {
            // Backend expects snake_case
            const requestBody = {
                name: testCase.name,
                inputs: testCase.input || [],
                expected_outputs: testCase.output || [],
                expected_status: testCase.expected_status || 'VALID', // Include expected_status
            };

            const response = await axios.post(
                `${SNIPPET_SERVICE_URL}/${testCase.snippetId}/tests`,
                requestBody,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                id: `${testCase.snippetId}-${response.data.id}`,
                name: response.data.name,
                input: response.data.inputs || [],
                output: response.data.expected_outputs || response.data.expectedOutputs || [],
                snippetId: testCase.snippetId!,
                expected_status: response.data.expected_status || 'VALID',
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            throw new Error(`Error creating test case: ${errorMessage}`);
        }
    }

    async removeTestCase(id: string): Promise<string> {
        try {
            console.log('Attempting to remove test case with ID:', id);

            // Extract snippet ID and test ID from the id
            // Format: "snippetId-testId" where both are UUIDs with format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            // We need to split at the correct position to preserve both UUIDs

            // UUID format: 8-4-4-4-12 characters (36 total with hyphens)
            // So we need to find the dash at position 36 (after the first complete UUID)
            if (id.length < 73) { // 36 + 1 + 36 = 73 minimum length for two UUIDs
                throw new Error(`Invalid test case ID format: ${id}. Expected format: snippetUUID-testUUID`);
            }

            const snippetId = id.substring(0, 36); // First 36 characters (complete UUID)
            const testId = id.substring(37); // Rest after the dash (complete UUID)

            console.log('Parsed snippetId:', snippetId);
            console.log('Parsed testId:', testId);

            // Correct URL for DELETE - should NOT have /execute
            const deleteUrl = `${SNIPPET_SERVICE_URL}/${snippetId}/tests/${testId}`;
            console.log('DELETE URL:', deleteUrl);

            await axios.delete(deleteUrl, {
                headers: getAuthHeaders(),
            });

            console.log('Test case deleted successfully');
            return id;
        } catch (error: any) {
            console.error('Error deleting test case:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw new Error(`Error deleting test case: ${error.response?.data?.message || error.message}`);
        }
    }

    async testSnippet(id: string, envVars: string): Promise<TestCaseResult> {
        try {
            console.log('Attempting to test snippet with ID:', id);

            // Extract snippet ID and test ID from the id
            // Format: "snippetId-testId" where both are UUIDs with format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            // We need to split at the correct position to preserve both UUIDs

            // UUID format: 8-4-4-4-12 characters (36 total with hyphens)
            // So we need to find the dash at position 36 (after the first complete UUID)
            if (id.length < 73) { // 36 + 1 + 36 = 73 minimum length for two UUIDs
                throw new Error(`Invalid test case ID format: ${id}. Expected format: snippetUUID-testUUID`);
            }

            const snippetId = id.substring(0, 36); // First 36 characters (complete UUID)
            const testId = id.substring(37); // Rest after the dash (complete UUID)

            console.log('Parsed snippetId:', snippetId);
            console.log('Parsed testId:', testId);

            const executeUrl = `${SNIPPET_SERVICE_URL}/${snippetId}/tests/${testId}/execute`;
            console.log('EXECUTE URL:', executeUrl);

            const response = await axios.post(
                executeUrl,
                { env_vars: envVars },
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Test execution response:', response.data);

            // Backend response includes:
            // { passed: boolean, expectedStatus: string, expectedOutputs: string[],
            //   actualOutputs: string[], executionFailed: boolean, message: string }

            // The test is successful if it passed according to the backend logic
            // This means:
            // - If expected_status is VALID: test passes if snippet executed successfully and outputs match
            // - If expected_status is INVALID: test passes if snippet failed as expected
            return {
                id: response.data.id || '',
                success: response.data.passed || false,
                output: response.data.output || ''
            };
        } catch (error: any) {
            console.error('Error executing test:', error);
            return {
                id: '',
                success: false,
                output: error.message || 'Test execution failed'
            };
        }
    }

    async executeSnippet(snippetId: string, inputs: string[]): Promise<{ outputs: string[], errors: string[] }> {
        try {
            const response = await axios.post(
                `${SNIPPET_SERVICE_URL}/${snippetId}/execute`,
                { inputs },
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                outputs: response.data.outputs || [],
                errors: response.data.errors || [],
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            return {
                outputs: [],
                errors: [errorMessage],
            };
        }
    }

    async deleteSnippet(id: string): Promise<string> {
        try {
            console.log('Attempting to delete snippet with ID:', id);
            console.log('Using token:', getToken() ? 'Token exists' : 'No token found');
            console.log('Backend URL:', SNIPPET_SERVICE_URL);

            const response = await axios.delete(
                `${SNIPPET_SERVICE_URL}/${id}`,
                {
                    headers: getAuthHeaders(),
                }
            );

            console.log('Delete response:', response.status, response.data);
            return id;
        } catch (error: any) {
            console.error('Error in deleteSnippet:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            // Provide more detailed error information based on backend response
            if (error.response?.status === 404) {
                throw new Error(`Snippet with ID ${id} not found`);
            } else if (error.response?.status === 403) {
                throw new Error('You do not have permission to delete this snippet');
            } else if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else {
                throw new Error(`Error deleting snippet: ${error.response?.data?.message || error.message}`);
            }
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
        try {
            const userId = getUserId();
            const correlationId = crypto.randomUUID();
            
            // Map frontend rules to backend format
            const backendRules = this.mapFrontendRulesToBackend(newRules);
            
            // Build ChangeRulesDTO
            const requestBody = {
                userId,
                rules: backendRules,
                snippets: [], // Empty array as we're just updating rules
                correlationId,
            };
            
            await axios.put(
                `${PRINTSCRIPT_SERVICE_URL}/redis/format`,
                requestBody,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            return newRules;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            throw new Error(`Error updating format rules: ${errorMessage}`);
        }
    }

    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        try {
            const userId = getUserId();
            const correlationId = crypto.randomUUID();
            
            console.log('Attempting to modify linting rules for userId:', userId, 'correlationId:', correlationId);
            console.log('New rules:', newRules);

            // Map frontend rules to backend format
            const backendRules = this.mapFrontendRulesToBackend(newRules);
            
            // Build ChangeRulesDTO
            const requestBody = {
                userId,
                rules: backendRules,
                snippets: [], // Empty array as we're just updating rules
                correlationId,
            };
            
            console.log('Request body for linting rules update:', requestBody);

            await axios.put(
                `${PRINTSCRIPT_SERVICE_URL}/redis/lint`,
                requestBody,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000, // 30 second timeout
                }
            );
            
            console.log('Linting rules updated successfully');
            return newRules;
        } catch (error: any) {
            console.error('Error updating linting rules:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            // Handle specific error cases
            if (error.response?.status === 500) {
                const errorMsg = error.response?.data?.message || 'Database error while updating linting rules. The service may be temporarily unavailable.';
                throw new Error(`Server Error: ${errorMsg}`);
            } else {
                const errorMessage = error.response?.data?.message || error.message;
                throw new Error(`Error updating linting rules: ${errorMessage}`);
            }
        }
    }

    // Helper methods

    // @ts-expect-error - Unused but kept for potential future use
    private async _checkWritePermission(snippetId: string): Promise<boolean> {
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
        } catch (error: any) {
            return false;
        }
    }

    // @ts-expect-error - Unused but kept for potential future use
    private async _checkOwnerPermission(snippetId: string): Promise<boolean> {
        try {
            const userId = getUserId();
            console.log('Checking owner permission for snippet:', snippetId, 'user:', userId);

            const response = await axios.get(
                `${PERMISSION_SERVICE_URL}/check`,
                {
                    headers: getAuthHeaders(),
                    params: {
                        snippetId: parseInt(snippetId),
                        userId,
                    },
                }
            );

            console.log('Permission check response:', response.data);

            // Check if user has permission AND is OWNER
            const hasPermission = response.data.has_permission && response.data.role === 'OWNER';
            console.log('Has owner permission:', hasPermission);

            return hasPermission;
        } catch (error: any) {
            console.error('Error checking owner permission:', error);
            console.error('Permission service error response:', error.response?.data);

            // If permission service is unavailable, allow deletion for now
            // This is a fallback to prevent the permission service from blocking all deletes
            if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
                console.warn('Permission service unavailable, allowing deletion');
                return true;
            }

            return false;
        }
    }

    private mapBackendSnippetToFrontend(backendSnippet: any): Snippet {
        // Convert backend language enum (PRINTSCRIPT) to lowercase for frontend
        const language = typeof backendSnippet.language === 'string' 
            ? backendSnippet.language.toLowerCase() 
            : backendSnippet.language;
        
        return {
            id: String(backendSnippet.id),
            name: backendSnippet.name,
            description: backendSnippet.description || '',
            content: backendSnippet.content,
            language: language,
            extension: this.getExtensionFromLanguage(language),
            author: backendSnippet.user_id || 'Unknown',
            compliance: this.mapComplianceStatus(backendSnippet),
            created_at: backendSnippet.created_at,
            updated_at: backendSnippet.updated_at,
            user_id: backendSnippet.user_id,
            version: backendSnippet.version,
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
        // If backend has a status field, use it
        if (backendSnippet.status === 'VALIDATED') return 'compliant';
        if (backendSnippet.status === 'INVALID') return 'not-compliant';
        if (backendSnippet.status === 'FAILED') return 'failed';
        
        // If no status field:
        // - Syntax validation happens on create/update, so snippets are always syntactically valid
        // - Linting compliance is separate and not automatically checked
        // - Default to 'compliant' since syntax validation passed (required for creation)
        // - Linting can be checked manually via the linting endpoint if needed
        return 'compliant';
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

    private mapBackendRulesToFrontend(backendRules: any[]): Rule[] {
        // Map backend rules format to frontend Rule type
        // Backend returns: { id, name, isActive, value }
        return backendRules.map(rule => ({
            id: rule.id || String(Math.random()),
            name: rule.name,
            isActive: rule.isActive ?? false,
            value: rule.value ?? null,
        }));
    }

    private mapFrontendRulesToBackend(frontendRules: Rule[]): any[] {
        // Map frontend Rule type to backend format for ChangeRulesDTO
        // Backend Rule DTO requires: { id, name, isActive, value }
        return frontendRules.map(rule => ({
            id: rule.id,
            name: rule.name,
            isActive: rule.isActive,
            value: rule.value ?? null,
        }));
    }

    private getDefaultFormatRules(): Rule[] {
        // Return default PrintScript format rules
        return [
            {
                id: '1',
                name: 'enforce_spacing_around_equals',
                isActive: true,
                value: null,
            },
            {
                id: '2',
                name: 'enforce_spacing_before_colon_in_declaration',
                isActive: true,
                value: null,
            },
            {
                id: '3',
                name: 'enforce_spacing_after_colon_in_declaration',
                isActive: true,
                value: null,
            },
            {
                id: '4',
                name: 'if_brace_same_line',
                isActive: true,
                value: null,
            },
            {
                id: '5',
                name: 'println_line_breaks_before',
                isActive: false,
                value: 1,
            },
            {
                id: '6',
                name: 'println_line_breaks_after',
                isActive: false,
                value: 1,
            },
            {
                id: '7',
                name: 'assignment_line_breaks_before',
                isActive: false,
                value: 0,
            },
            {
                id: '8',
                name: 'assignment_line_breaks_after',
                isActive: false,
                value: 0,
            }
        ];
    }

    private getDefaultLintingRules(): Rule[] {
        // Return default linting rules
        return [
            {
                id: '1',
                name: 'Default Lint Rule',
                isActive: true,
                value: null,
            },
        ];
    }
}
