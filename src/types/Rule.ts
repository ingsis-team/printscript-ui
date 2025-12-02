// Base Rule interface (flexible to support backend-driven rule names)
export interface Rule {
  // allow any rule name returned by backend
  name: string;
  // value can be boolean/number/string or null if backend doesn't provide it
  value: boolean | number | string | null;
  // optional human-readable description from backend
  description?: string;
}

// Specific rule aliases (optional use elsewhere)
export interface FormattingRule extends Rule {
  // we keep this as a marker interface; name can be any string
  // commonly used formatting rules may include 'spaceBeforeColon', 'indentSize', etc.
}

export interface LintingRule extends Rule {
  // marker interface for linting-related rules
  // linting rules may have an id field
  id?: string;
}

// Linting Issue
export interface LintingIssue {
  rule: string;
  line: number;
  column: number;
  message: string;
}

// API Response types
export interface LintingResponse {
  issues: LintingIssue[];
}

export interface FormattingResponse {
  formattedContent: string;
}
