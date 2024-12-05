import { SnippetOperations } from "../snippetOperations.ts";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "../snippet.ts";
import { FileType } from "../../types/FileType.ts";
import { Rule } from "../../types/Rule.ts";
import { TestCase } from "../../types/TestCase.ts";
import { PaginatedUsers } from "../users.ts";
import { TestCaseResult } from "../queries.tsx";
import api from "../api.ts";
import {FakeSnippetStore} from "./fakeSnippetStore.ts"; // Centralized Axios instance

const DELAY: number = 1000

export class MySnippetOperations implements SnippetOperations {
    private token: string | null = null;

    private readonly fakeStore = new FakeSnippetStore()

    setToken(token: string) {
        this.token = token;
    }

    async listSnippetDescriptors(
        page: number,
        pageSize: number,
        snippetName?: string
    ): Promise<PaginatedSnippets> {
        // if no token, delay for 1 second

        if (!this.token) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }


        try {
            const response = await api.get("/snippets", {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: {
                    pageNumber: String(page),
                    pageSize: String(pageSize),
                    snippetName,
                },
            });
            return response.data as PaginatedSnippets;
        } catch (error) {
            throw new Error(`Error fetching snippet descriptors: ${error}`);
        }
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {

        console.log(createSnippet)
        try {
            const username = localStorage.getItem("username")
            const response = await api.post(
                "/snippets",
                { ...createSnippet, author: username, compliance: "pending"  },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
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
            const response = await api.get(`/snippets/byId`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: { snippetId: id },
            });
            return response.data as Snippet;
        } catch (error) {
            throw new Error(`Error fetching snippet: ${error}`);
        }
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        try {
            const response = await api.put(
                "/snippets",
                { id, ...updateSnippet },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            );
            return response.data as Snippet;
        } catch (error) {
            throw new Error(`Error updating snippet: ${error}`);
        }
    }

    async getUserFriends(
        name?: string,
        page?: number,
        pageSize?: number
    ): Promise<PaginatedUsers> {
        try {
            const response = await api.get("/snippets/users", {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: {
                    name,
                    pageNumber: page,
                    pageSize,
                },
            });
            return response.data as PaginatedUsers;
        } catch (error) {
            throw new Error(`Error fetching user friends: ${error}`);
        }
    }

    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        try {
            const response = await api.post(
                "/snippets/share",
                { snippetId, userId },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            );
            return response.data as Snippet;
        } catch (error) {
            throw new Error(`Error sharing snippet: ${error}`);
        }
    }

    async getFormatRules(): Promise<Rule[]> {
        try {
            const response = await api.get("/run/format-rules", {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            });
            return response.data as Rule[];
        } catch (error) {
            throw new Error(`Error fetching format rules: ${error}`);
        }
    }

    async getLintingRules(): Promise<Rule[]> {
        try {
            const response = await api.get("/run/lint-rules", {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            });
            return response.data as Rule[];
        } catch (error) {
            throw new Error(`Error fetching linting rules: ${error}`);
        }
    }

    async getTestCases(snippetId: string): Promise<TestCase[]> {
        try {
            const response = await api.get("/test-case", {
                params: { snippetId },
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            });
            return response.data as TestCase[];
        } catch (error) {
            throw new Error(`Error fetching test cases: ${error}`);
        }
    }

    async formatSnippet(snippet: string): Promise<string> {
        try {
            const response = await api.put(
                "/run/format",
                { snippet },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            );
            return response.data as string;
        } catch (error) {
            throw new Error(`Error formatting snippet: ${error}`);
        }
    }

    async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        try {
            const response = await api.post("/test-case", testCase, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            });
            return response.data as TestCase;
        } catch (error) {
            throw new Error(`Error posting test case: ${error}`);
        }
    }

    async removeTestCase(id: string): Promise<string> {
        try {
            const response = await api.delete("/test-case", {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: { testCaseId: id },
            });
            return response.data as string;
        } catch (error) {
            throw new Error(`Error removing test case: ${error}`);
        }
    }

    async deleteSnippet(id: string): Promise<string> {
        try {
            const response = await api.delete("/snippets", {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: { snippetId: id },
            });
            return response.data as string;
        } catch (error) {
            throw new Error(`Error deleting snippet: ${error}`);
        }
    }

    async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        try {
            const response = await api.post(
                "/test-case/run",
                testCase,
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            );
            return response.data as TestCaseResult;
        } catch (error) {
            throw new Error(`Error testing snippet: ${error}`);
        }
    }

    getFileTypes(): Promise<FileType[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.getFileTypes()), DELAY)
        })
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        try {
            const response = await api.put(
                "/run/format-rules",
                { rules: newRules },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            );
            return response.data as Rule[];
        } catch (error) {
            throw new Error(`Error modifying format rules: ${error}`);
        }
    }

    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        try {
            const response = await api.put(
                "/run/lint-rules",
                { rules: newRules },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            );
            return response.data as Rule[];
        } catch (error) {
            throw new Error(`Error modifying linting rules: ${error}`);
        }
    }
}
