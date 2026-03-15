/* ── Builder Types ──────────────────────────────────────
   Shared types for the prompt-to-app pipeline.
   Projects, files, chat, and deploy models.
   ───────────────────────────────────────────────────── */

export interface BuilderProject {
  id: string;
  name: string;
  description: string;
  framework: "nextjs" | "react" | "html" | "node" | "worker";
  createdAt: number;
  updatedAt: number;
  deployUrl: string | null;
  deployStatus: "idle" | "building" | "deployed" | "failed";
  buildLog: string[];
}

export interface BuilderFile {
  path: string;
  content: string;
  language: string;
  editedBy: "ai" | "user";
  updatedAt: number;
}

export interface BuilderChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  /** Which files were generated/modified in this turn */
  filesChanged?: string[];
}

export interface GenerateRequest {
  prompt: string;
  framework?: BuilderProject["framework"];
  projectId?: string;
}

export interface GenerateResponse {
  projectId: string;
  files: BuilderFile[];
  chatMessage: BuilderChatMessage;
  buildLog: string[];
}

export interface EditRequest {
  projectId: string;
  message: string;
  /** Current files for context (send relevant subset) */
  files?: Pick<BuilderFile, "path" | "content" | "language">[];
  /** Specific files to focus on */
  targetFiles?: string[];
}

export interface EditResponse {
  files: BuilderFile[];
  chatMessage: BuilderChatMessage;
  /** Paths of files that changed */
  changedPaths: string[];
  buildLog: string[];
}

/** File output schema the LLM must follow */
export interface LLMFileOutput {
  path: string;
  content: string;
  language: string;
}

/** Structured output from LLM codegen */
export interface LLMCodegenOutput {
  projectName: string;
  description: string;
  files: LLMFileOutput[];
  setupInstructions?: string;
  explanation: string;
}

/** Deploy target configuration */
export interface DeployTarget {
  provider: "vercel" | "cloudflare" | "github";
  /** Project ID on the deploy platform */
  externalId?: string;
  url?: string;
  status: "idle" | "building" | "deployed" | "failed";
  lastDeployAt?: number;
}

/** The full builder state managed client-side */
export interface BuilderState {
  project: BuilderProject | null;
  files: Record<string, BuilderFile>;
  chat: BuilderChatMessage[];
  activeFile: string | null;
  isGenerating: boolean;
  deployTargets: DeployTarget[];
  /** Generation run history for rollback */
  runs: { id: string; timestamp: number; filesSnapshot: Record<string, BuilderFile>; prompt: string }[];
}
