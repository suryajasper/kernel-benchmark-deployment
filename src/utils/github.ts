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

    const data = await response.json();

    const pullRequests: RepoPullRequest[] = data.map((prData: any) => {
      const author: ChangeAuthor = {
        name: prData["user"]["name"] || prData["user"]["login"],
        profileUrl: prData["user"]["avatar_url"],
      };

      const pr: RepoPullRequest = {
        type: "pr",
        url: prData["html_url"],
        changeStats: randomStats(),
        _id: prData["id"].toString(),
        timestamp: new Date(prData["updated_at"]),
        author,
        title: prData["title"],
        description: prData["body"],
        status: prData["state"],
        commits: [],
      };

      return pr;
    });

    pullRequests.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return pullRequests;
  } catch (error) {
    throw new Error(`Failed to fetch pull requests: ${error}`);
  }
}
