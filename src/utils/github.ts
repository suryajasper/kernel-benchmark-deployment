import type {
  RepoPullRequest,
  ChangeAuthor,
  ChangeStats,
  KernelType,
  RepoModification,
  RepoMerge,
  BenchmarkRun,
} from "../types";

const KERNEL_TYPES = ["gemm", "attention", "convolution"] as const;

function randomStats(): ChangeStats {
  const stats: Record<KernelType, number> = {} as any;
  for (const k of KERNEL_TYPES) {
    stats[k as KernelType] = parseFloat((Math.random() * 150 - 50).toFixed(2)); // change of speed as percentage (-50% to +100%)
  }
  return stats;
}

export async function fetchModifications() {
  try {
    const response = await fetch("http://localhost:3000/pull_requests");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const modifications: RepoModification[] = [];

    for (let obj of data) {
      obj["timestamp"] = new Date(obj["timestamp"]);
      if (obj["type"] === "pr") modifications.push(obj as RepoPullRequest);
      else if (obj["type"] === "merge") modifications.push(obj as RepoMerge);
    }

    modifications.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return modifications;
  } catch (error) {
    throw new Error(`Failed to fetch pull requests: ${error}`);
  }
}

export async function fetchRuns() {
  try {
    const response = await fetch("http://localhost:3000/runs");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jobs: BenchmarkRun[] = await response.json();
    return jobs;
  } catch (error) {
    throw new Error(`Failed to fetch runs: ${error}`);
  }
}
