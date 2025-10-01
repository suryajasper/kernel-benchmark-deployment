import type { KernelConfig, TuningResults } from "../../types";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { KernelListItem } from "./KernelListItem";

interface KernelListProps {
  kernels: KernelConfig[];
  tuningResults: TuningResults;
  toggleKernels?: (ids: string[], state: boolean) => void;
  activeKernels?: Set<string>;
}

export default function KernelList({
  kernels,
  tuningResults,
  toggleKernels,
  activeKernels,
}: KernelListProps) {
  const [selectStart, setSelectStart] = useState<number | undefined>(undefined);

  const allSelected =
    toggleKernels &&
    activeKernels &&
    kernels.every((k) => activeKernels.has(k.id));

  const handleToggle = (id: string, state: boolean) => {
    if (toggleKernels) {
      toggleKernels([id], state);
      setSelectStart(undefined);
    }
  };

  const handleMouseDown = (index: number) => {
    setSelectStart(index);
  };

  const handleMouseUp = (index: number) => {
    if (!selectStart || !toggleKernels || !activeKernels) return;
    if (selectStart === index) return;

    const start = Math.min(selectStart, index);
    const end = Math.max(selectStart, index) + 1;
    toggleKernels(
      kernels.slice(start, end).map((k) => k.id),
      !activeKernels.has(kernels[selectStart].id)
    );
    setSelectStart(undefined);
  };

  return (
    <div className="flex flex-col w-[100%] gap-2 px-4">
      {toggleKernels && activeKernels && kernels.length > 0 && (
        <button
          className={twMerge(
            "px-4 py-2 text-black rounded shadow-md transition-all",
            allSelected
              ? "bg-red-300 hover:bg-red-400"
              : "bg-green-300 hover:bg-green-400"
          )}
          onClick={() => {
            toggleKernels(
              kernels.map((k) => k.id),
              !allSelected
            );
          }}
        >
          {allSelected ? "Deselect" : "Select All"}
        </button>
      )}
      {kernels.map((kernel, index) => (
        <KernelListItem
          key={kernel.id}
          kernel={kernel}
          index={index}
          tuningResults={tuningResults[kernel.name]}
          isActive={activeKernels?.has(kernel.id)}
          onToggle={toggleKernels ? handleToggle : undefined}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      ))}
    </div>
  );
}
