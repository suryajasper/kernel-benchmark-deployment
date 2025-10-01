import { useEffect, useState } from "react";
import type { RepoPullRequest, BenchmarkRun } from "../types";
import PageContainer from "../components/PageContainer";
import {
  fetchModifications,
  fetchPerformanceRuns,
  fetchRuns,
  rebase,
} from "../utils/github";
import ModificationView, {
  PerformanceView,
} from "../components/ModificationView";
// import { generateFakeRepoHistory } from "../utils/history";

export default function History() {
  const [modifications, setModifications] = useState<
    RepoPullRequest[] | undefined
  >(undefined);
  const [runs, setRuns] = useState<Record<string, BenchmarkRun>>({});
  const [performances, setPerformances] = useState<BenchmarkRun[]>([]);
  const [rebaseWaiting, setRebaseWaiting] = useState<boolean>(false);

  useEffect(() => {
    const updateModifications = () => {
      if (rebaseWaiting) return;
      fetchModifications().then(setModifications);
    };

    const updateRuns = () => {
      if (rebaseWaiting) return;
      fetchRuns().then((runArr) => {
        const newRuns: Record<string, BenchmarkRun> = {};
        for (let run of runArr) {
          if (!run.mappingId)
            continue;
          const existingRun = newRuns[run.mappingId];
          if (!existingRun || run.timestamp > existingRun.timestamp) {
            if (
              existingRun &&
              run.status === "completed" &&
              run.conclusion !== "success"
            )
              continue;
            newRuns[run.mappingId] = run;
          }
        }
        console.log(newRuns);
        setRuns(newRuns);
      });
    };

    const updatePerfs = () => {
      if (rebaseWaiting) return;
      fetchPerformanceRuns().then(setPerformances);
    };

    updateRuns();
    updateModifications();
    updatePerfs();

    const modInterval = setInterval(updateModifications, 30 * 1000);
    const runInterval = setInterval(updateRuns, 10 * 1000);
    const perfInterval = setInterval(updatePerfs, 60 * 1000);

    return () => {
      clearInterval(modInterval);
      clearInterval(runInterval);
      clearInterval(perfInterval);
    };
  }, []);

  const triggerRebase = async () => {
    try {
      setRebaseWaiting(true);
      const rebaseRes = await rebase();
      console.log("rebase", rebaseRes);
      setModifications(rebaseRes.modifications);
      setPerformances(rebaseRes.performances);
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
            performances &&
            [
              ...modifications.filter((mod) => mod.type === "pr"),
              ...performances,
            ]
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((item) => {
                if ("type" in item && item.type === "pr") {
                  return (
                    <ModificationView
                      pr={item as RepoPullRequest}
                      runs={runs}
                    />
                  );
                } else {
                  return <PerformanceView perf={item as BenchmarkRun} />;
                }
              })}
        </div>
      </div>
    </PageContainer>
  );
}
