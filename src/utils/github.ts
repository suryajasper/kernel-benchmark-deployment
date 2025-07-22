import type {
  RepoPullRequest,
  ChangeAuthor,
  ChangeStats,
  KernelType,
} from "../types";

const KERNEL_TYPES = ["gemm", "attention", "convolution"] as const;

function randomStats(): ChangeStats {
  const stats: Record<KernelType, number> = {} as any;
  for (const k of KERNEL_TYPES) {
    stats[k as KernelType] = parseFloat((Math.random() * 150 - 50).toFixed(2)); // change of speed as percentage (-50% to +100%)
  }
  return stats;
}

export async function fetchPullRequests() {
  try {
    const response = await fetch("http://localhost:3000/pull_requests");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let data = await response.json();
    for (let obj of data)
      obj['timestamp'] = new Date(obj['timestamp']);
    
    const pullRequests = data as RepoPullRequest[];

    pullRequests.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return pullRequests;
  } catch (error) {
    throw new Error(`Failed to fetch pull requests: ${error}`);
  }
}
