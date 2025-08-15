/* Kernels */

export type KernelType = "gemm" | "attention" | "conv";

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
  id: string;
  kernelType: string;
  name: string;
  tag: string;
  dtype: string;
  allowedBackends: string[];
  problem: Record<string, any>;
  tunedConfig?: Record<string, any>;
}

/* Source Control */
export interface ChangeAuthor {
  name: string;
  profileUrl: string;
}

export type ChangeStats = Record<KernelType, number>;

export interface RepoModification {
  _id: string;
  headSha: string;
  url: string;
  type: "pr" | "merge";
  timestamp: Date;
  author: ChangeAuthor;
}

export interface RepoCommit {
  _id: string;
  title: string;
  author: ChangeAuthor;
  timestamp: Date;
  description?: string;
}

export interface RepoPullRequest extends RepoModification {
  type: "pr";
  title: string;
  description?: string;
  status: "open" | "closed";
  repoName: string;
  branchName: string;
  commits: RepoCommit[];
}

export interface RepoMerge extends RepoModification {
  type: "merge";
  prId: string;
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

export interface PerformanceRun {
  _id: string;
  blobName: string;
  timestamp: Date;
  changeStats: ChangeStats;
}

export interface BenchmarkRun extends PerformanceRun {
  headSha: string;
  status: RunStatusType;
  conclusion: RunConclusionType;
  numSteps: number;
  steps: BenchmarkJobStep[];
}

export interface TuningConfig {
  _id: string;
  kernelName: string;
  runId: string;
  timestamp: Date;
  result: Record<string, any>;
}

export type TuningResults = Record<string, TuningConfig[]>;
