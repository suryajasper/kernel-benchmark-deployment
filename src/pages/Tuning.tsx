import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/PageContainer";
import type { Kernel, KernelType } from "../types";
import { fetchData } from "../utils/csv";
import { toTitleCase } from "../utils/utils";
import { getBackendColor } from "../utils/color";
import type { ColorInstance } from "color";
import Color from "color";
import FilterControls from "../components/FilterControls";

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

export default function Tuning() {
  const [kernels, setKernels] = useState<Kernel[]>([]);
  const [query, setQuery] = useState<string>("");
  const [kernelType, setKernelType] = useState<KernelType>("attention");
  const [selectedBackends, setSelectedBackends] = useState<string[]>([]);
  const [selectedDtypes, setSelectedDtypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tuningKernels, setTuningKernels] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData("baseline").then(setKernels);
  }, []);

  useEffect(() => {
    const uniqueBackends = Array.from(new Set(kernels.map((k) => k.backend)));
    const uniqueDtypes = Array.from(new Set(kernels.map((k) => k.dtype)));
    const uniqueTags = Array.from(new Set(kernels.map((k) => k.tag)));

    setSelectedBackends(uniqueBackends);
    setSelectedDtypes(uniqueDtypes);
    setSelectedTags(uniqueTags);
  }, [kernels]);

  const matchQuery = (kernel: Kernel) => {
    if (query.length === 0) return true;
    const name = kernel.name.toLowerCase();
    const queries = query.toLowerCase().split(" ");
    for (const queryStr of queries) {
      if (name.includes(queryStr)) return true;
    }
    return false;
  };

  const filteredKernels = useMemo(() => {
    return kernels.filter(
      (k) =>
        matchQuery(k) &&
        selectedBackends.includes(k.backend) &&
        selectedDtypes.includes(k.dtype) &&
        selectedTags.includes(k.tag) &&
        kernelType === k.kernelType
    );
  }, [
    kernels,
    kernelType,
    selectedBackends,
    selectedDtypes,
    selectedTags,
    query,
  ]);

  const toggleTuningKernel = (kernelId: string) => {
    setTuningKernels((oldTk) => {
      if (!oldTk.has(kernelId)) {
        return new Set([...oldTk, kernelId]);
      } else {
        return new Set([...oldTk].filter((id) => id !== kernelId));
      }
    });
  };

  return (
    <PageContainer activePage="tune" isLoading={kernels.length === 0}>
      <div className="w-[100%] flex flex-col rounded-md">
        <div className="w-[100%] pb-5 pl-10 flex flex-row justify-between">
          <input
            className="border-none flex-grow outline-none"
            value={query}
            placeholder="Enter Search Query"
            onInput={(e) => setQuery(e.currentTarget.value)}
          />
          {tuningKernels.size > 0 && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Tune {tuningKernels.size} Kernels
            </button>
          )}
        </div>
        <FilterControls
          kernels={kernels}
          kernelType={kernelType}
          setKernelType={setKernelType}
          selectedBackends={selectedBackends}
          setSelectedBackends={setSelectedBackends}
          selectedDtypes={selectedDtypes}
          setSelectedDtypes={setSelectedDtypes}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
      </div>
      <div className="flex flex-col w-[100%] gap-1 px-4">
        {filteredKernels.map((k) => (
          <div
            className="cursor-pointer flex flex-row justify-between w-[100%] bg-gray-100 border border-gray-500 rounded-md py-1 px-4"
            onClick={() => toggleTuningKernel(k.id)}
          >
            <div className="flex flex-row gap-4">
              <input
                type="checkbox"
                checked={tuningKernels.has(k.id)}
                onInput={() => toggleTuningKernel(k.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <ItemTag label={toTitleCase(k.kernelType)} />
              <ItemTag label={k.backend} />
              <>
                {Object.entries(k.shape).map(([dimName, dimValue]) => (
                  <ItemTag
                    label={`${dimName} = ${dimValue}`}
                    colorHash={`dim_${dimName}`}
                  />
                ))}
              </>
              <ItemTag label={`dtype = ${k.dtype}`} />
            </div>
            <div>Last tuned: Never</div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
