import {ComplianceEnum, CreateSnippet, Snippet, UpdateSnippet} from '../snippet'
import {v4 as uuid} from 'uuid'
import {PaginatedUsers} from "../users.ts";
import {TestCase} from "../../types/TestCase.ts";
import {TestCaseResult} from "../queries.tsx";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";

const INITIAL_SNIPPETS: Snippet[] = [
  {
    id: '9af91631-cdfc-4341-9b8e-3694e5cb3672',
    name: 'Super Snippet',
    content: 'let a : number = 5;\nlet b : number = 5;\n\nprintln(a + b);',
    compliance: 'pending',
    author: 'John Doe',
    language: 'printscript',
    extension: 'prs'
  },
  {
    id: 'c48cf644-fbc1-4649-a8f4-9dd7110640d9',
    name: 'Extra cool Snippet',
    content: 'let a : number = 5;\nlet b : number = 5;\n\nprintln(a + b);',
    compliance: 'not-compliant',
    author: 'John Doe',
    language: 'printscript',
    extension: 'prs'
  },
  {
    id: '34bf4b7a-d4a1-48be-bb26-7d9a3be46227',
    name: 'Boaring Snippet',
    content: 'let a : number = 5;\nlet b : number = 5;\n\nprintln(a + b);',
    compliance: 'compliant',
    author: 'John Doe',
    language: 'printscript',
    extension: 'prs'
  }
]

const paginatedUsers: PaginatedUsers = {
  count: 5,
  page: 1,
  page_size: 10,
  users: [
    {
      user_id: "1",
      name: "Chona",
      email: "chona@example.com",
      nickname: "chona",
      picture: ""
    },
    {
      user_id: "2",
      name: "Fede",
      email: "fede@example.com",
      nickname: "fede",
      picture: ""
    },
    {
      user_id: "3",
      name: "Mateo",
      email: "mateo@example.com",
      nickname: "mateo",
      picture: ""
    },
    {
      user_id: "4",
      name: "Tomi",
      email: "tomi@example.com",
      nickname: "tomi",
      picture: ""
    },
    {
      user_id: "5",
      name: "Berrets",
      email: "berrets@example.com",
      nickname: "berrets",
      picture: ""
    }
  ]
}

const INITIAL_FORMATTING_RULES: Rule[] = [
  {
    name: "indentation",
    value: 3
  },
  {
    name: "open-if-block-on-same-line",
    value: false,
  },
  {
    name: "max-line-length",
    value: 100
  },
  {
    name: "no-trailing-spaces",
    value: null
  },
  {
    name: "no-multiple-empty-lines",
    value: null,
  }
]

const INITIAL_LINTING_RULES: Rule[] = [
  {
    name: "no-expressions-in-print-line",
    value: null
  },
  {
    name: "no-unused-vars",
    value: null
  },
  {
    name: "no-undef-vars",
    value: null
  },
  {
    name: "no-unused-params",
    value: null
  },
]

const fakeTestCases: TestCase[] = [
  {
    id: uuid(),
    name: "Test Case 1",
    input: ["A", "B"],
    output: ["C", "D"]
  },
  {
    id: uuid(),
    name: "Test Case 2",
    input: ["E", "F"],
    output: ["G", "H"]
  },
]

const fileTypes: FileType[] = [
  {
    language: "printscript",
    extension: "prs",
  },
  {
    language: "python",
    extension: "py",
  },
  {
    language: "java",
    extension: "java",
  },
  {
    language: 'golang',
    extension: 'go'
  }
]

export class FakeSnippetStore {
  private readonly snippetMap: Map<string, Snippet> = new Map()
  private readonly testCaseMap: Map<string, TestCase> = new Map()
  private formattingRules: Rule[] = [];
  private lintingRules: Rule[] = [];

  constructor() {
    INITIAL_SNIPPETS.forEach(snippet => {
      this.snippetMap.set(snippet.id, snippet)
    })

    fakeTestCases.forEach(testCase => {
      this.testCaseMap.set(testCase.id, testCase)
    })
    this.formattingRules = INITIAL_FORMATTING_RULES
    this.lintingRules = INITIAL_LINTING_RULES
  }

  listSnippetDescriptors(): Snippet[] {
    return Array.from(this.snippetMap, ([, value]) => value)
  }

  createSnippet(createSnippet: CreateSnippet): Snippet {
    const id = uuid();
    const newSnippet = {
      id,
      compliance: 'compliant' as ComplianceEnum,
      author: 'yo',
      ...createSnippet
    }
    this.snippetMap.set(id, newSnippet)

    return newSnippet
  }

  getSnippetById(id: string): Snippet | undefined {
    return this.snippetMap.get(id)
  }

  updateSnippet(id: string, updateSnippet: UpdateSnippet): Snippet {
    const existingSnippet = this.snippetMap.get(id)

    if (existingSnippet === undefined)
      throw Error(`Snippet with id ${id} does not exist`)

    const newSnippet = {
      ...existingSnippet,
      ...updateSnippet
    }
    this.snippetMap.set(id, newSnippet)

    return newSnippet
  }

  getUserFriends(name: string, page: number, pageSize: number) {
    return {
      ...paginatedUsers,
      page: page,
      pageSize: pageSize,
      users: paginatedUsers.users.filter(x => x.name.includes(name))
    };
  }

  getFormatRules(): Rule[] {
    return this.formattingRules
  }

  getLintingRules(): Rule[] {
    return this.lintingRules
  }

  formatSnippet(snippetContent: string): string {
    return `//Mocked format of snippet :) \n${snippetContent}`
  }

  getTestCases(): TestCase[] {
    return Array.from(this.testCaseMap, ([, value]) => value)
  }

  postTestCase(testCase: Partial<TestCase>): TestCase {
    const id = testCase.id ?? uuid()
    const newTestCase = {...testCase, id} as TestCase
    this.testCaseMap.set(id,newTestCase)
    return newTestCase
  }

  removeTestCase(id: string): string {
    this.testCaseMap.delete(id)
    return id
  }

  deleteSnippet(id: string): string {
    this.snippetMap.delete(id)
    return id
  }

  testSnippet(): TestCaseResult {
    const success = Math.random() > 0.5;
    return {
      passed: success,
      expectedStatus: 'VALID',
      expectedOutputs: [],
      actualOutputs: success ? ['Test passed'] : ['Test failed'],
      executionFailed: !success,
      message: success ? 'Test passed' : 'Test failed'
    };
  }

  getFileTypes(): FileType[] {
    return fileTypes
  }

  modifyFormattingRule(newRules: Rule[]): Rule[] {
    this.formattingRules = newRules;
    return newRules;
  }

  modifyLintingRule(newRules: Rule[]): Rule[] {
    this.lintingRules = newRules
    return newRules
  }
}
