import { LoremIpsum } from "lorem-ipsum";
import type {
  RepoPullRequest,
  RepoMerge,
  RepoModification,
  ChangeAuthor,
  ChangeStats,
  KernelType,
} from "../types";

const AUTHORS: ChangeAuthor[] = [
  {
    name: "Surya Jasper",
    profileUrl: "https://avatars.githubusercontent.com/u/45545431?v=4",
  },
  {
    name: "James Smith",
    profileUrl: "https://avatars.githubusercontent.com/u/45545432?v=4",
  },
  {
    name: "Jane Doe",
    profileUrl: "https://avatars.githubusercontent.com/u/45545433?v=4",
  },
  {
    name: "Lip Gallagher",
    profileUrl: "https://avatars.githubusercontent.com/u/45545434?v=4",
  },
  {
    name: "Jules Vinyard",
    profileUrl: "https://avatars.githubusercontent.com/u/45545435?v=4",
  },
];

const lorem = new LoremIpsum();

const KERNEL_TYPES = ["gemm", "attention", "convolution"] as const;

function randomStats(): ChangeStats {
  const stats: Record<KernelType, number> = {} as any;
  for (const k of KERNEL_TYPES) {
    stats[k as KernelType] = parseFloat((Math.random() * 150 - 50).toFixed(2)); // change of speed as percentage (-50% to +100%)
  }
  return stats;
}

function randomAuthor(): ChangeAuthor {
  return AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
}

let idCounter = 0;
function nextId() {
  return (++idCounter).toString();
}

export function generateFakeRepoHistory(count: number): RepoModification[] {
  const history: RepoModification[] = [];
  const pullRequests: RepoPullRequest[] = [];
  let baseTime = Date.now() - 1000 * 60 * 60 * 24 * 30; // start 30 days ago

  for (let i = 0; i < count; i++) {
    const isPR = Math.random() < 0.7 || pullRequests.length === 0; // mostly PRs, at least 1 before merge

    const timestamp = new Date(baseTime + i * 1000 * 60 * 60 * 12); // 12hr increments

    if (isPR) {
      const pr: RepoPullRequest = {
        _id: nextId(),
        type: "pr",
        url: "",
        timestamp,
        author: randomAuthor(),
        title: lorem.generateSentences(1),
        description: lorem.generateParagraphs(1),
        status: "open",
        changeStats: randomStats(),
        commits: [
          {
            _id: nextId(),
            title: lorem.generateSentences(1),
            author: randomAuthor(),
            timestamp,
            description: lorem.generateParagraphs(1),
          },
          {
            _id: nextId(),
            title: lorem.generateSentences(1),
            author: randomAuthor(),
            timestamp,
            description: lorem.generateParagraphs(1),
          },
        ],
      };
      pullRequests.push(pr);
      history.push(pr);
    } else {
      // Select a random unmerged PR
      const openPRs = pullRequests.filter((pr) => pr.status === "open");
      if (openPRs.length === 0) continue;

      const targetPR = openPRs[Math.floor(Math.random() * openPRs.length)];
      targetPR.status = "closed";

      const merge: RepoMerge = {
        _id: nextId(),
        url: "",
        type: "merge",
        timestamp,
        author: randomAuthor(),
        prId: targetPR._id,
        changeStats: randomStats(),
      };
      history.push(merge);
    }
  }

  // history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return history;
}
