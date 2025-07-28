/* Kernels */

export type KernelType = "gemm" | "attention" | "conv";

export interface Kernel {
  id: string;
  backend: string;
  kernelType: KernelType;
  name: string;
  tag: string;
  dtype: string;
  meanMicroseconds: number;
  arithmeticIntensity: number;
  tflops: number;
  shape: Record<string, any>;
  ok: string;
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

export interface BenchmarkRun {
  _id: string;
  headSha: string;
  status: RunStatusType;
  conclusion: RunConclusionType;
  numSteps: number;
  steps: BenchmarkJobStep[];
  blobName: string;
  timestamp: Date;
  changeStats: ChangeStats;
}
