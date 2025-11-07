import {SnippetOperations} from "../snippetOperations.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from "../snippet.ts";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";
import {TestCase} from "../../types/TestCase.ts";
import {PaginatedUsers} from "../users.ts";
import {TestCaseResult} from "../queries.tsx";
import autoBind from "auto-bind";

const API_BASE_URL = "http://localhost:8083/snippets"

export class SnippetOperationsImpl implements SnippetOperations{

    private authToken: string | null;

    constructor(authToken: string | null) {
        this.authToken = authToken
        autoBind(this)
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        const response = await fetch(`${API_BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.authToken}`
            },
            body: JSON.stringify(createSnippet)
        })
        if (!response.ok) throw new Error("Error al crear snippet.")
        return response.json();
    }

    async deleteSnippet(id: string): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        });
        if (!response.ok) throw new Error("Error al eliminar snippet.");
        return "Deleted Successfully";
    }

    async getSnippetById(id: string): Promise<Snippet | undefined> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        });
        if (!response.ok) throw new Error("Error al obtener snippet.");
        return response.json();
    }

    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        const response = await fetch(`${API_BASE_URL}/${snippetId}/share?userToShareWith=${userId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.authToken}`
            }
        });
        if (!response.ok) throw new Error("Error al compartir snippet.");
        return response.json();
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.authToken}`
            },
            body: JSON.stringify(updateSnippet)
        });
        if (!response.ok) throw new Error("Error al actualizar snippet.");
        return response.json();
    }

    async formatSnippet(snippet: string): Promise<string> {
        console.log(`Implementar: ${snippet}`);
        return Promise.resolve("");
    }

    async getFileTypes(): Promise<FileType[]> {
        return Promise.resolve([]);
    }

    async getFormatRules(): Promise<Rule[]> {
        return Promise.resolve([]);
    }

    async getLintingRules(): Promise<Rule[]> {
        return Promise.resolve([]);
    }
    async getTestCases(snippetId: string): Promise<TestCase[]> {
        console.log(`Implementar: ${snippetId}`);
        return Promise.resolve([]);
    }

    async getUserFriends(page?: number, pageSize?: number, name?: string): Promise<PaginatedUsers> {
        console.log(`Implementar: ${name} ${page} ${pageSize}`);
        throw new Error("Método no implementado");
    }

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        console.log(`Implementar: ${snippetName} ${page} ${pageSize}`);
        throw new Error("Método no implementado");
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        console.log(`Implementar: ${newRules}`);
        return Promise.resolve([]);
    }

    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        console.log(`Implementar: ${newRules}`);
        return Promise.resolve([]);
    }

    async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        console.log(`Implementar: ${testCase}`);
        throw new Error("Método no implementado");
    }

    async removeTestCase(id: string): Promise<string> {
        console.log(`Implementar: ${id}`);
        return Promise.resolve("");
    }

    async testSnippet(id: string, envVars: string): Promise<TestCaseResult> {
        console.log(`Implementar: ${id} ${envVars}`);
        throw new Error("Método no implementado");
    }
}