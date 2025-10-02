/* Kernels */

export type KernelType = "gemm" | "attention" | "conv";
export type WorkflowType = "none" | "e2e" | "all";

// Available machines for kernel execution
export const AVAILABLE_MACHINES = [
  "mi300x",
  "mi325x",
  "mi350x",
  "mi355x",
] as const;
export type MachineType = (typeof AVAILABLE_MACHINES)[number];

// Runtime configuration for kernels
export interface KernelRuntimeConfig {
  tag: string;
  workflow: WorkflowType;
  machines: string[];
}

export interface Kernel {
  id: string;
  machine: string;
  backend: string;
  kernelType: KernelType;
  name: string;
  tag: string;
  dtype: string;
  meanMicroseconds: number;
  arithmeticIntensity: number;
  tflops: number;
  shape: Record<string, any>;
  tuningConfig: Record<string, any> | undefined | null;
  ok: string;
}

export interface KernelConfig {
  _id: string;
  name: string;
  kernelType: string;
  machines: string[];
  workflow: string;
  tag: string;
  problem: Record<string, any>;
}

// Backend API types for kernel submission
export interface BackendKernelConfig {
  _id: string;
  name: string;
  kernelType: string;
  tag: string;
  machines: string[];
  workflow: WorkflowType;
  problem: Record<string, any>;
}

/* Kernel Type Definitions */

export type AttributeType = "integer" | "float" | "string" | "boolean";

export interface AttributeConstraints {
  // For numeric types (integer, float)
  min?: number;
  max?: number;
  // For string types
  choices?: string[];
}

export interface KernelTypeAttribute {
  name: string;
  type: AttributeType;
  required: boolean;
  constraints?: AttributeConstraints;
  description?: string;
}

export interface KernelTypeDefinition {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  attributes: KernelTypeAttribute[];
}

/* Source Control */
export interface ChangeAuthor {
  name: string;
  profileUrl: string;
}

export type ChangeStats = Record<KernelType, number>;

// export interface RepoCommit {
//   _id: string;
//   title: string;
//   author: ChangeAuthor;
//   timestamp: Date;
//   description?: string;
// }

export interface RepoPullRequest {
  _id: string;
  url: string;
  type: "pr";
  timestamp: Date;
  author: ChangeAuthor;
  title: string;
  status: "open" | "closed";
  commits: number;
  repoName: string;
  branchName: string;
  mappingId?: string;
  description?: string;
  isMerged: boolean;
}

export type RunStatusType =
  | "requested"
  | "in_progress"
  | "completed"
  | "queued"
  | "pending"
  | "waiting";

export type RunConclusionType =
  | "action_required"
  | "cancelled"
  | "failure"
  | "neutral"
  | "skipped"
  | "stale"
  | "success"
  | "timed_out"
  | "startup_failure"
  | "null";

export type JobStatusType = "queued" | "in_progress" | "completed" | "waiting";

export type JobConclusionType =
  | "success"
  | "failure"
  | "null"
  | "skipped"
  | "cancelled"
  | "action_required"
  | "neutral"
  | "timed_out";

export interface BenchmarkJobStep {
  completed_at: Date;
  name: string;
  number: number;
  started_at: Date;
  conclusion: JobConclusionType;
  status: JobStatusType;
}

export interface BenchmarkRun {
  _id: string;
  type: string;
  blobName: string;
  timestamp: Date;
  status: RunStatusType;
  conclusion: RunConclusionType;
  numSteps: number;
  steps: BenchmarkJobStep[];
  completed: boolean;
  hasArtifact: boolean;
  mappingId?: string;
}

export interface TuningConfig {
  _id: string;
  kernelName: string;
  runId: string;
  timestamp: Date;
  result: Record<string, any>;
}

export type TuningResults = Record<string, TuningConfig[]>;

export interface KernelRuntimeConfig {
  tag: string;
  workflow: "none" | "e2e" | "all";
  machines: string[];
}

export interface BenchmarkWorkflowProps {
  githubUrl: string;
  repoName: string;
  branchName: string;
  selectedBackends: string[];
  maxKernels?: number;
}
