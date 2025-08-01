import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import type {
  RepoPullRequest,
  RepoMerge,
  RepoModification,
  BenchmarkRun,
} from "../types";
import { FaCodePullRequest, FaCodeMerge, FaGithub } from "react-icons/fa6";
import { SlGraph } from "react-icons/sl";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import { getTimeStringRelative } from "../utils/utils";
import PageContainer from "../components/PageContainer";
import { fetchModifications, fetchRuns, rebase } from "../utils/github";
import RunStatus from "../components/RunStatus";
import { twMerge } from "tailwind-merge";
// import { generateFakeRepoHistory } from "../utils/history";

export default function History() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [modifications, setModifications] = useState<
    RepoModification[] | undefined
  >(undefined);
  const [runs, setRuns] = useState<Record<string, BenchmarkRun>>({});
  const [rebaseWaiting, setRebaseWaiting] = useState<boolean>(false);
  const navigate = useNavigate();

  const toggleExpand = (id: string) => {
    const copy = new Set(expandedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setExpandedIds(copy);
  };

  const getPullRequestTitleById = (prId: string) => {
    if (!modifications) return "No PR found";
    for (const modification of modifications) {
      if (modification._id === prId && modification.type === "pr") {
        const pr = modification as RepoPullRequest;
        return pr.title;
      }
    }
    return "No PR found";
  };

  useEffect(() => {
    fetchModifications().then(setModifications);

    const updateRuns = () => {
      fetchRuns().then((runArr) => {
        const newRuns: Record<string, BenchmarkRun> = {};
        for (let run of runArr) {
          const existingRun = newRuns[run.headSha];
          if (!existingRun || run.timestamp > existingRun.timestamp) {
            if (
              existingRun &&
              run.status === "completed" &&
              run.conclusion !== "success"
            )
              continue;
            newRuns[run.headSha] = run;
          }
        }
        console.log(newRuns);
        setRuns(newRuns);
      });
    };
    updateRuns();

    const modInterval = setInterval(() => {
      fetchModifications().then(setModifications);
    }, 30 * 1000);

    const runInterval = setInterval(updateRuns, 10 * 1000);

    return () => {
      clearInterval(modInterval);
      clearInterval(runInterval);
    };
  }, []);

  const triggerRebase = async () => {
    try {
      setRebaseWaiting(true);
      await rebase();
      const results = await fetchModifications();
      setModifications(results);
    } finally {
      setRebaseWaiting(false);
    }
  };

  return (
    <PageContainer activePage="history" isLoading={modifications === undefined}>
      <div className="px-24">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-center w-full">
            <button
              disabled={rebaseWaiting}
              className="px-4 py-2 w-40 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              onClick={triggerRebase}
            >
              {rebaseWaiting ? "Rebasing..." : "Rebase"}
            </button>
          </div>

          {modifications &&
            modifications
              .slice()
              .reverse()
              .map((mod) => {
                const isPR = mod.type === "pr";
                const isExpanded = expandedIds.has(mod._id);
                const base = isPR
                  ? (mod as RepoPullRequest)
                  : (mod as RepoMerge);
                const isMerge = base.type === "merge";

                const title = isMerge
                  ? `Merge: ${getPullRequestTitleById(base.prId)}`
                  : base.title;

                const run = runs[base.headSha];

                return (
                  <div
                    id={base._id}
                    key={base._id}
                    className={`p-4 rounded-md shadow-md hover:shadow-lg transition ${
                      isMerge
                        ? "bg-purple-50 hover:bg-purple-100"
                        : "bg-gray-50 hover:bg-gray-100"
                    } cursor-pointer`}
                    onMouseEnter={() => setHoverId(base._id)}
                    onMouseLeave={() => setHoverId(undefined)}
                    onClick={() => {
                      if (run && run.conclusion === "success") {
                        navigate(
                          `/kernel-benchmark-deployment/dashboard/${run.blobName}`,
                          {
                            preventScrollReset: true,
                          }
                        );
                      }
                    }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* Icon */}
                      <div className="mt-1">
                        {isMerge ? (
                          <FaCodeMerge className="text-purple-700 text-xl" />
                        ) : (
                          <FaCodePullRequest
                            className={twMerge(
                              (base as RepoPullRequest).status === "open"
                                ? "text-green-700"
                                : "text-purple-700",
                              "text-xl"
                            )}
                          />
                        )}
                      </div>

                      {/* Title + Author */}
                      <div className="flex flex-col">
                        {isMerge ? (
                          <a
                            href={`#${(base as RepoMerge).prId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-lg font-semibold text-purple-800 underline"
                          >
                            {title}
                          </a>
                        ) : (
                          <div className="text-lg font-semibold">{title}</div>
                        )}
                        <div className="flex items-center gap-2 mt-4">
                          <img
                            src={base.author.profileUrl}
                            alt={base.author.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-700">
                            {base.author.name}
                          </span>
                          <div className="text-sm ml-6">
                            {getTimeStringRelative(base.timestamp)}
                          </div>
                        </div>
                      </div>

                      {/* Change Stats */}
                      {isPR ? (
                        <RunStatus run={run} pr={base as RepoPullRequest} />
                      ) : (
                        <div className="ml-auto"></div>
                      )}
                    </div>

                    {/* Expandable PR Description */}
                    {isPR &&
                      isExpanded &&
                      (base as RepoPullRequest).description && (
                        <div className="mt-4 text-sm text-gray-800 whitespace-pre-line">
                          {(base as RepoPullRequest).description}
                        </div>
                      )}

                    {/* Hover Menu */}
                    {base._id === hoverId && (
                      <div className="absolute flex flex-row bg-gray-50 left-1/2 px-2 py-1 rounded-md shadow-sm justify-between gap-4">
                        <a
                          href={base.url}
                          className="rounded-full hover:bg-gray-200"
                          title="View on GitHub"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaGithub className="text-md text-gray-700 hover:text-black" />
                        </a>
                        {isPR && (base as RepoPullRequest).description && (
                          <div
                            className="rounded-full hover:bg-gray-200"
                            onClick={(e) => {
                              toggleExpand(base._id);
                              e.stopPropagation();
                            }}
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <MdOutlineExpandLess className="text-md text-gray-700 hover:text-black" />
                            ) : (
                              <MdOutlineExpandMore className="text-md text-gray-700 hover:text-black" />
                            )}
                          </div>
                        )}
                        {run && run.conclusion === "success" && (
                          <Link
                            to={`/kernel-benchmark-deployment/dashboard/${run.blobName}`}
                            className="rounded-full hover:bg-gray-200"
                            title="View Dashboard Summary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SlGraph className="text-md text-gray-700 hover:text-black" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      </div>
    </PageContainer>
  );
}
