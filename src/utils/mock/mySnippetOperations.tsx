import {SnippetOperations} from "../snippetOperations.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from "../snippet.ts";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";
import {TestCase} from "../../types/TestCase.ts";
import {PaginatedUsers} from "../users.ts";
import {TestCaseResult} from "../queries.tsx";
import axios from "axios";

//const DELAY: number = 1000;
const token = localStorage.getItem('token')
const userId = localStorage.getItem('userId')

//use localhost
const url =  `${window.location.origin}/operations`
const SNIPPET_URL = `${url}/snippets`
const TEST_CASE_URL = `${url}/test-case`
const RUN_URL = `${url}/run`

export class MySnippetOperations implements SnippetOperations{
    private token: string|null = null;

    constructor() {
        this.token = null;
    }

    setToken(token: string){
        this.token = token;
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

   async  deleteSnippet(id: string): Promise<string> {
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

    async formatSnippet(snippet: string): Promise<string> {
        try {
            const response = await axios.put(
                `${RUN_URL}/format`, {
                    snippet,
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

    getFileTypes(): Promise<FileType[]> {
        return Promise.resolve([]);
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
            return response.data;
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
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching linting rules: ${error}`);
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
                    }
                }
            );
            return response.data as Snippet;
        } catch (error) {
            throw new Error(`Error fetching snippet: ${error}`);
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
            return response.data;
        } catch (error) {
            console.log(error)
            throw new Error(`Error fetching test cases: ${error}`);
        }
    }

    async getUserFriends(name?: string, page?: number, pageSize?: number): Promise<PaginatedUsers> {
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
                        pageSize
                    }
                })
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching friends: ${error}`);
        }
    }

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
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


    async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
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

    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        try {
            const response = await axios.post(
                `${SNIPPET_URL}/share`, {
                    snippetId,
                    userId
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

    async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        try {
            const response = await axios.post(
                `${TEST_CASE_URL}/run`, {},{
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': '69420'
                    },
                    params: {
                        testCaseId: parseInt(testCase.id as string),
                        testCase
                    },
                });
            return response.data as TestCaseResult;
        } catch (e) {
            throw new Error(`Error testing snippet: ${e}`);
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

}