import {SnippetOperations} from '../snippetOperations'
import {FakeSnippetStore} from './fakeSnippetStore'
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet'
import autoBind from 'auto-bind'
import {PaginatedUsers} from "../users.ts";
import {TestCase} from "../../types/TestCase.ts";
import {TestCaseResult} from "../queries.tsx";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";
import axios from 'axios';



const DELAY: number = 1000;
const token = localStorage.getItem('token')
const userId = localStorage.getItem('userId')

//use localhost
const url =  `${window.location.origin}/operations`
const SNIPPET_URL = `${url}/snippets`
const TEST_CASE_URL = `${url}/test-case`
const RUN_URL = `${url}/run`

export class FakeSnippetOperations implements SnippetOperations {
    private readonly fakeStore = new FakeSnippetStore()

    constructor() {
        autoBind(this)
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        try {
            const response = await axios.post(
                SNIPPET_URL, {
                    ...createSnippet,
                    authorId: userId,
                    compliance: 'pending'
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                }
            );
            return response.data as Snippet;
        } catch (error) {
            throw new Error(`Error creating snippet: ${error}`);
        }
    }

    async getSnippetById(id: string): Promise<Snippet | undefined> {
        try {
            const response = await axios.get(
                `${SNIPPET_URL}/byId`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        snippetId: id,
                        userId
                    }}
            );
            return response.data as Snippet;
        } catch (error) {
            throw new Error(`Error fetching snippet: ${error}`);
        }
    }

    async listSnippetDescriptors(page: number, pageSize: number): Promise<PaginatedSnippets> {
        try {
            const response = await axios.get(
                SNIPPET_URL, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        userId,
                        pageNumber: String(page),
                        pageSize: String(pageSize),
                    },
                });
            return response.data as PaginatedSnippets;
        } catch (error) {
            throw new Error(`Error fetching snippets: ${error}`);
        }
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        try {
            const response = await axios.put(
                `${SNIPPET_URL}`, {
                    id,
                    ...updateSnippet,
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        userId
                    }
                }
            );
            return response.data as Snippet;
        } catch (error) {
            throw new Error(`Error updating snippet: ${error}`);
        }
    }

    async getUserFriends(page: number = 0, pageSize: number = 10, name?: string): Promise<PaginatedUsers> {
        try {
            const response = await axios.get(
                `${SNIPPET_URL}/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        pageNumber: page,
                        pageSize,
                        ...(name && { name })
                    }
                })
            return response.data as PaginatedUsers;
        } catch (error) {
            throw new Error(`Error fetching friends: ${error}`);
        }
    }

    async shareSnippet(snippetId: string, friendId: string): Promise<Snippet> {
        try {
            const response = await axios.post(
                `${SNIPPET_URL}/share`, {
                    snippetId,
                    friendId
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        userId
                    }
                });
            return response.data as Snippet;
        } catch (error) {
            throw new Error(`Error sharing snippet: ${error}`);
        }
    }

    async getFormatRules(): Promise<Rule[]> {
        try {
            const response = await axios.get(
                `${RUN_URL}/format-rules`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        userId
                    }
                });
            return response.data as Rule[];
        } catch (error) {
            throw new Error(`Error fetching format rules: ${error}`);
        }
    }

    async getLintingRules(): Promise<Rule[]> {
        try {
            const response = await axios.get(
                `${RUN_URL}/lint-rules`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        userId
                    }
                });
            return response.data as Rule[];
        } catch (error) {
            throw new Error(`Error fetching linting rules: ${error}`);
        }
    }

    async formatSnippet(snippetId: string, language: string): Promise<string> {
        try {
            const response = await axios.put(
                `${RUN_URL}/format`, {
                    snippetId,
                    language
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        userId
                    }
                });
            return response.data as string;
        } catch (error) {
            throw new Error(`Error formatting snippet: ${error}`);
        }
    }

    async getTestCases(snippetId: string): Promise<TestCase[]> {
        try {
            const response = await axios.get(
                `${TEST_CASE_URL}`, {
                    params: {
                        snippetId
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                });
            return response.data as TestCase[];
        } catch (error) {
            console.log(error)
            throw new Error(`Error fetching test cases: ${error}`);
        }
    }

    async postTestCase(testCase: TestCase): Promise<TestCase> {
        try {
            const body = {
                ...testCase,
                id: parseInt(String(testCase.id))
            }
            const response = await axios.post(
                `${TEST_CASE_URL}`, body,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                });
            return response.data as TestCase;
        } catch (error) {
            throw new Error(`Error posting test case: ${error}`);
        }
    }

    async removeTestCase(id: string): Promise<string> {
        try {
            const response = await axios.delete(
                `${TEST_CASE_URL}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        testCaseId: parseInt(id)
                    }
                });
            return response.data as string;
        } catch (error) {
            throw new Error(`Error removing test case: ${error}`);
        }
    }

    async testSnippet(id: string, envVars: string): Promise<TestCaseResult> {
        try {
            const response = await axios.post(
                `${TEST_CASE_URL}/run`, {},{
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        testCaseId: parseInt(id),
                        envVars
                    },
                });
            return response.data as TestCaseResult;
        } catch (e) {
            throw new Error(`Error testing snippet: ${e}`);
        }
    }

    async executeSnippet(_snippetId: string, _inputs: string[]): Promise<{ outputs: string[], errors: string[] }> {
        // Mock implementation for fake operations
        return Promise.resolve({
            outputs: ['Mock output'],
            errors: [],
        });
    }

    async deleteSnippet(id: string): Promise<string> {
        try {
            const response = await axios.delete(
                `${SNIPPET_URL}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        snippetId: id,
                        userId
                    }},
            );
            return response.data as string;
        } catch (error) {
            throw new Error(`Error deleting snippet: ${error}`);
        }
    }

    getFileTypes(): Promise<FileType[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.getFileTypes()), DELAY)
        })
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        try {
            const response = await axios.put(
                `${RUN_URL}/format-rules`, {
                    rules: newRules
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        userId
                    }
                });
            return response.data as Rule[];
        } catch (error) {
            throw new Error(`Error modifying format rules: ${error}`);
        }
    }

    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        try {
            const response = await axios.put(
                `${RUN_URL}/lint-rules`, {
                    rules: newRules
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        userId
                    }
                });
            return response.data as Rule[];
        } catch (error) {
            throw new Error(`Error modifying linting rules: ${error}`);
        }
    }
}