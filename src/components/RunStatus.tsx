import { twMerge } from "tailwind-merge";
import type { BenchmarkJobStep, BenchmarkRun } from "../types";
import { toTitleCase } from "../utils/utils";
import ChangeStatBar from "./ChangeStatBar";
import { BarLoader } from "react-spinners";

interface RunStatusContainerProps {
  children: React.ReactNode;
  fill?: boolean;
  run?: BenchmarkRun;
}

function RunStatusContainer({ children, fill, run }: RunStatusContainerProps) {
  if (fill) {
    let backgroundTint = "gray";

    if (run) {
      if (run.status === "completed") {
        if (run.conclusion === "success") {
          backgroundTint = "green";
        } else {
          backgroundTint = "red";
        }
      } else if (run.status === "in_progress") {
        backgroundTint = "yellow";
      }
    }

    return (
      <div
        className={twMerge(
          `bg-${backgroundTint}-400/35`,
          "h-25 w-80 ml-auto rounded-md border-2 border-gray-400 border-dashed"
        )}
      >
        <div className="w-full h-full flex flex-col gap-2 py-2 px-6 items-center justify-center">
          {children}
        </div>
      </div>
    );
  } else {
    return (
      <div className="h-25 w-80 flex flex-col justify-center items-center gap-2 ml-auto">
        {children}
      </div>
    );
  }
}

interface JobProgressBarProps {
  numSteps: number;
  steps: BenchmarkJobStep[];
}

function getStepColor(step?: BenchmarkJobStep): string {
  if (!step) return "bg-gray-200"; // light gray for undefined steps

  const { status, conclusion } = step;

  if (status === "completed") {
    if (conclusion === "success")
      return "bg-green-500";
    else if (conclusion === "skipped")
      return "bg-green-300";
    else if (conclusion === "cancelled")
      return "bg-gray-600";
    else
      return "bg-red-500";
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
    let activeStep : BenchmarkJobStep = steps[0];
    for (activeStep of steps)
      if (!activeStep.started_at || !activeStep.completed_at)
        break;

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

interface RunStatusProps {
  run?: BenchmarkRun;
}

export default function RunStatus({ run }: RunStatusProps) {
  if (!run)
    return (
      <RunStatusContainer run={run}>
        <button
          className="px-4 py-2 w-40 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={(e) => e.stopPropagation()}
        >
          Trigger CI Run
        </button>
      </RunStatusContainer>
    );

  if (Object.keys(run.changeStats).length > 0)
    return (
      <RunStatusContainer run={run}>
        {Object.entries(run.changeStats).map(([kernelType, change]) => (
          <ChangeStatBar
            key={kernelType}
            kernelType={kernelType}
            change={change}
          />
        ))}
      </RunStatusContainer>
    );

  if (["queued", "requested", "pending", "waiting"].includes(run.status))
    return (
      <RunStatusContainer run={run} fill>
        Run {toTitleCase(run.status)}
        <BarLoader />
      </RunStatusContainer>
    );
  else {
    return (
      <RunStatusContainer run={run} fill>
        <JobProgressBar numSteps={run.numSteps} steps={run.steps} />
      </RunStatusContainer>
    );
  }
}
