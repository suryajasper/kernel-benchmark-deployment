import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { RepoPullRequest, BenchmarkRun, PerformanceRun } from "../types";
import { FaCodePullRequest, FaCodeMerge, FaGithub } from "react-icons/fa6";
import { MdOutlineSpeed } from "react-icons/md";
import { SlGraph } from "react-icons/sl";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import { getTimeStringRelative } from "../utils/utils";
import RunStatus, { ChangeStatView } from "../components/RunStatus";

interface ModificationViewProps {
  pr: RepoPullRequest;
  runs: Record<string, BenchmarkRun>;
}

export default function ModificationView({ pr, runs }: ModificationViewProps) {
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [isHovering, setHover] = useState<boolean>(false);

  const navigate = useNavigate();

  const isMerge = pr.status === "closed";

  const title = pr.title;
  const run = runs[pr.headSha];

  return (
    <div
      id={pr._id}
      key={pr._id}
      className={`p-4 rounded-md shadow-md hover:shadow-lg transition ${
        isMerge
          ? "bg-purple-50 hover:bg-purple-100"
          : "bg-green-50 hover:bg-green-100"
      } cursor-pointer`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (run && run.conclusion === "success") {
          navigate(`/dashboard/${run.blobName}`, {
            preventScrollReset: true,
          });
        }
      }}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Icon */}
        <div className="mt-1">
          {isMerge ? (
            <FaCodeMerge className="text-purple-700 text-xl" />
          ) : (
            <FaCodePullRequest className="text-green-700 text-xl" />
          )}
        </div>

        {/* Title + Author */}
        <div className="flex flex-col">
          <div
            className={`text-lg font-semibold ${isMerge ? "text-purple-800" : "text-green-800"}`}
          >
            {title}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <img
              src={pr.author.profileUrl}
              alt={pr.author.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-700">{pr.author.name}</span>
            <div className="text-sm ml-6">
              {getTimeStringRelative(pr.timestamp)}
            </div>
          </div>
        </div>

        {/* Change Stats */}
        <RunStatus run={run} pr={pr} />
      </div>

      {/* Expandable PR Description */}
      {isExpanded && pr.description && (
        <div className="mt-4 text-sm text-gray-800 whitespace-pre-line">
          {pr.description}
        </div>
      )}

      {/* Hover Menu */}
      {isHovering && (
        <div className="absolute flex flex-row bg-gray-50 left-1/2 px-2 py-1 rounded-md shadow-sm justify-between gap-4">
          <a
            href={pr.url}
            className="rounded-full hover:bg-gray-200"
            title="View on GitHub"
            onClick={(e) => e.stopPropagation()}
          >
            <FaGithub className="text-md text-gray-700 hover:text-black" />
          </a>
          {pr.description && (
            <div
              className="rounded-full hover:bg-gray-200"
              onClick={(e) => {
                setExpanded(!isExpanded);
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
              to={`/dashboard/${run.blobName}`}
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
}

interface PerformanceViewProps {
  perf: PerformanceRun;
}

export function PerformanceView({ perf }: PerformanceViewProps) {
  const navigate = useNavigate();

  const title = "Full Benchmark " + new Date(perf.timestamp).toISOString();

  return (
    <div
      id={perf._id}
      key={perf._id}
      className="p-4 rounded-md shadow-md hover:shadow-lg transition bg-blue-50 hover:bg-blue-100 cursor-pointer"
      onClick={() => {
        navigate(`/dashboard/${perf.blobName}`, {
          preventScrollReset: true,
        });
      }}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Icon */}
        <div className="mt-1">
          <MdOutlineSpeed className="text-blue-700 text-2xl" />
        </div>

        {/* Title + Author */}
        <div className="flex flex-col">
          <div className="text-lg font-semibold text-blue-800">{title}</div>

          <div className="flex items-center gap-2 mt-4">
            <div className="text-sm ml-6">
              {getTimeStringRelative(perf.timestamp)}
            </div>
          </div>
        </div>

        {/* Change Stats */}
        <ChangeStatView run={perf} />
      </div>
    </div>
  );
}
