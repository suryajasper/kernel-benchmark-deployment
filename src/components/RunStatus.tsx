import { twMerge } from "tailwind-merge";
import type { BenchmarkJobStep, BenchmarkRun, RepoPullRequest } from "../types";
import { toTitleCase } from "../utils/utils";
import { BarLoader } from "react-spinners";
import { useState } from "react";
import { cancelWorkflow, triggerWorkflow } from "../utils/github";

interface RunStatusContainerProps {
  children: React.ReactNode;
  fill?: boolean;
  run?: BenchmarkRun;
  actions?: Record<string, (runId: string) => void>;
}

function RunStatusContainer({
  children,
  fill,
  run,
  actions = {},
}: RunStatusContainerProps) {
  const [hovered, setHovered] = useState(false);
  const hasActions = Object.keys(actions).length > 0;

  if (fill) {
    let backgroundTint = "gray";

    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={twMerge(
          `relative bg-${backgroundTint}-400/35`,
          "h-25 w-80 ml-auto rounded-md border-2 border-gray-400 border-dashed"
        )}
      >
        <div className="w-full h-full flex flex-col gap-2 py-2 px-6 items-center justify-center">
          {children}
        </div>

        {hasActions && hovered && (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center gap-4 rounded-md z-10"
          >
            {Object.entries(actions).map(([label, callback]) => (
              <button
                key={label}
                onClick={(e) => {
                  e.stopPropagation();
                  if (run) {
                    callback(run._id);
                  }
                }}
                className="bg-white text-black px-4 py-1 rounded shadow hover:bg-gray-100"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-25 w-80 flex flex-col justify-center items-center gap-2 ml-auto">
      {children}
    </div>
  );
}

interface JobProgressBarProps {
  numSteps: number;
  steps: BenchmarkJobStep[];
}

function getStepColor(step?: BenchmarkJobStep): string {
  if (!step) return "bg-gray-200"; // light gray for undefined steps

  const { status, conclusion } = step;

  if (status === "completed") {
    if (conclusion === "success") return "bg-green-500";
    else if (conclusion === "skipped") return "bg-green-300";
    else if (conclusion === "cancelled") return "bg-gray-600";
    else return "bg-red-500";
  } else if (status === "in_progress") {
    return "bg-yellow-400";
  } else {
    return "bg-gray-600"; // dark gray
  }
}

export function JobProgressBar({ numSteps, steps }: JobProgressBarProps) {
  const blocks = Array.from({ length: numSteps }, (_, i) => {
    const step = steps[i];
    const colorClass = getStepColor(step);

    // Rounded corners for first and last blocks
    const roundedClass =
      i === 0 ? "rounded-l-full" : i === numSteps - 1 ? "rounded-r-full" : "";

    // Dotted border between blocks except the last one
    const borderClass =
      i < numSteps - 1 ? "border-r-2 border-solid border-gray-300" : "";

    return (
      <div
        key={i}
        className={`flex-1 h-2 ${colorClass} ${roundedClass} ${borderClass}`}
      />
    );
  });

  const formatStatus = (status: string) => {
    status = status.split("_").join(" ");
    status = toTitleCase(status);
    return status;
  };

  let title = "Waiting for Job";
  if (steps.length > 0) {
    let activeStep: BenchmarkJobStep = steps[0];
    for (activeStep of steps)
      if (!activeStep.started_at || !activeStep.completed_at) break;

    title = `${toTitleCase(activeStep.name)}: `;
    if (activeStep.status === "completed")
      title += formatStatus(activeStep.conclusion);
    else title += formatStatus(activeStep.status);
  }

  return (
    <>
      {title}
      <div className="flex w-full overflow-hidden">{blocks}</div>
    </>
  );
}

interface ChangeStatusProps {
  run: BenchmarkRun;
}

export function ChangeStatView({ run }: ChangeStatusProps) {
  return (
    <RunStatusContainer run={run}>
      {/* {Object.entries(run.changeStats).map(([kernelType, change]) => (
        <ChangeStatBar
          key={kernelType}
          kernelType={kernelType}
          change={change}
        />
      ))} */}
      <div>hi</div>
    </RunStatusContainer>
  );
}

interface RunStatusProps {
  run?: BenchmarkRun;
  pr: RepoPullRequest;
}

export default function RunStatus({ run, pr }: RunStatusProps) {
  const [workflowWaiting, setWorkflowWaiting] = useState<boolean>(false);

  const dispatchWorkflow = async () => {
    try {
      setWorkflowWaiting(true);
      await triggerWorkflow(pr);
    } finally {
      setWorkflowWaiting(false);
    }
  };

  // if (run && Object.keys(run.changeStats).length > 0)
  //   return <ChangeStatView run={run} />;

  if (!run || (run.status === "completed" && run.conclusion !== "success")) {
    if (pr.status === "closed") return <div className="ml-auto" />;
    return (
      <RunStatusContainer run={run}>
        <button
          disabled={workflowWaiting}
          className="bg-green-300 text-black px-4 py-1 rounded shadow hover:not-[disabled]:bg-green-400 disabled:bg-gray-300 transition-all"
          onClick={(e) => {
            dispatchWorkflow();
            e.stopPropagation();
          }}
        >
          {workflowWaiting ? "Run Requested" : "Trigger CI Run"}
        </button>
      </RunStatusContainer>
    );
  }

  if (["queued", "requested", "pending", "waiting"].includes(run.status))
    return (
      <RunStatusContainer run={run} fill actions={{ Cancel: cancelWorkflow }}>
        Run {toTitleCase(run.status)}
        <BarLoader />
      </RunStatusContainer>
    );
  else {
    return (
      <RunStatusContainer run={run} fill actions={{ Cancel: cancelWorkflow }}>
        <JobProgressBar numSteps={run.numSteps} steps={run.steps} />
      </RunStatusContainer>
    );
  }
}
