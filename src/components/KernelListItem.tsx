// KernelListItem.tsx
import { useState } from "react";
import type { KernelConfig, TuningConfig } from "../types";
import { getTimeStringRelative, toTitleCase } from "../utils/utils";
import { getBackendColor } from "../utils/color";
import type { ColorInstance } from "color";
import Color from "color";
import { twMerge } from "tailwind-merge";

interface ItemTagProps {
  color?: ColorInstance | string;
  colorHash?: string;
  label: string;
}

function ItemTag({ color, colorHash, label }: ItemTagProps) {
  if (!color) {
    color = getBackendColor(colorHash || label);
  }
  const colorStr = Color(color).lighten(0.4).string();

  return (
    <div
      style={{ backgroundColor: colorStr }}
      className="rounded-md px-2 text-black"
    >
      {label}
    </div>
  );
}

interface TuningConfigViewProps {
  config: TuningConfig;
}

function TuningConfigView({ config }: TuningConfigViewProps) {
  const ignoredAttributes = new Set([
    "arithmetic_intensity",
    "mean_microseconds",
    // "tflops",
    "problem",
  ]);

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    } else if (typeof value === "object" && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${k} = ${v}`)
        .join(", ");
    }
    return String(value);
  };

  const formatAttributeName = (name: string): string => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-gray-50 rounded-md p-3 border border-gray-300">
      <div className="mb-2 text-sm text-gray-600">
        {getTimeStringRelative(config.timestamp)}
      </div>
      <div className="space-y-1">
        {Object.entries(config.result)
          .filter(([key]) => !ignoredAttributes.has(key))
          .map(([key, value]) => (
            <div key={key} className="text-sm">
              <b>{formatAttributeName(key)}: </b>
              <span>{formatValue(value)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

interface KernelListItemProps {
  kernel: KernelConfig;
  index: number;
  tuningResults?: TuningConfig[];
  isActive?: boolean;
  onToggle?: (id: string, state: boolean) => void;
  onMouseDown?: (index: number) => void;
  onMouseUp?: (index: number) => void;
}

export function KernelListItem({
  kernel,
  index,
  tuningResults,
  isActive = false,
  onToggle,
  onMouseDown,
  onMouseUp,
}: KernelListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  tuningResults = tuningResults || [];
  const lastTuned =
    tuningResults.length > 0
      ? getTimeStringRelative(tuningResults[0].timestamp)
      : "Never";

  const hasTuningConfigs = tuningResults.length > 0;

  const handleMainClick = () => {
    if (hasTuningConfigs) {
      setIsExpanded(!isExpanded);
    } else if (onToggle) {
      onToggle(kernel.id, !isActive);
    }
  };

  return (
    <div className="w-full">
      <div
        className={twMerge(
          "cursor-pointer select-none transition-all flex flex-row justify-between w-[100%] outline rounded-md py-1 px-4",
          isActive
            ? "bg-green-100 outline-green-600 outline-2"
            : tuningResults.length > 0
              ? "bg-blue-100 hover:bg-blue-200 outline-blue-500"
              : "bg-gray-100 hover:bg-green-200 outline-gray-500",
          hasTuningConfigs && isExpanded ? "rounded-b-none" : ""
        )}
        onClick={handleMainClick}
        onMouseDown={(e) => {
          if (onMouseDown) onMouseDown(index);
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          if (onMouseUp) onMouseUp(index);
          e.stopPropagation();
        }}
      >
        <div className="flex flex-row gap-4 items-center">
          {onToggle && (
            <input
              type="checkbox"
              className="accent-green-500"
              checked={isActive}
              onChange={() => onToggle(kernel.id, !isActive)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {hasTuningConfigs && (
            <svg
              className={twMerge(
                "w-4 h-4 transition-transform",
                isExpanded ? "rotate-90" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          <ItemTag label={toTitleCase(kernel.kernelType)} />
          <ItemTag label={kernel.tag} />
          <ItemTag label={kernel.allowedBackends.join(", ")} />
          <>
            {Object.entries(kernel.problem).map(([dimName, dimValue]) => (
              <ItemTag
                key={`${dimName}_${dimValue}`}
                label={`${dimName} = ${dimValue}`}
                colorHash={`dim_${dimName}`}
              />
            ))}
          </>
        </div>
        <div>Last tuned: {lastTuned}</div>
      </div>

      {hasTuningConfigs && isExpanded && (
        <div className="border border-t-0 border-gray-500 rounded-b-md p-4 bg-white space-y-3">
          <h3 className="font-semibold text-sm mb-2">Tuning Configurations</h3>
          {tuningResults.map((config) => (
            <TuningConfigView key={config._id} config={config} />
          ))}
        </div>
      )}
    </div>
  );
}
