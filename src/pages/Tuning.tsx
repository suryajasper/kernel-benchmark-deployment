import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/PageContainer";
import type { KernelConfig, KernelType, TuningResults } from "../types";
import {
  fetchKernels,
  fetchTuningResults,
  triggerTuningWorkflow,
} from "../utils/github";
import KernelList from "../components/Kernels/KernelList";
import FilterControls from "../components/FilterControls";

export default function Tuning() {
  const [kernels, setKernels] = useState<KernelConfig[]>([]);
  const [tuningResults, setTuningResults] = useState<TuningResults>({});
  const [query, setQuery] = useState<string>("");
  const [selectedKernelTypes, setSelectedKernelTypes] = useState<KernelType[]>([
    "attention",
  ]);
  const [selectedTuning, setSelectedTuning] = useState<string[]>([
    "tuned",
    "untuned",
  ]);
  const [selectedDtypes, setSelectedDtypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tuningKernels, setTuningKernels] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchKernels().then(setKernels);
    fetchTuningResults().then(setTuningResults);
  }, []);

  const matchQuery = (kernel: KernelConfig) => {
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
        k.allowedBackends.filter((backend) => backend.startsWith("wave"))
          .length > 0 &&
        selectedDtypes.includes(k.dtype) &&
        selectedTags.includes(k.tag) &&
        selectedKernelTypes.includes(k.kernelType as KernelType) &&
        ((tuningResults[k.name] && selectedTuning.includes("tuned")) ||
          (!tuningResults[k.name] && selectedTuning.includes("untuned")))
    );
  }, [
    kernels,
    selectedKernelTypes,
    selectedDtypes,
    selectedTags,
    selectedTuning,
    query,
  ]);

  const getUnique = (fromKernels: KernelConfig[]) => {
    const uniqueDtypes = Array.from(new Set(fromKernels.map((k) => k.dtype)));
    const uniqueTags = Array.from(new Set(fromKernels.map((k) => k.tag)));
    return { uniqueDtypes, uniqueTags };
  };

  const { uniqueDtypes, uniqueTags } = useMemo(
    () => getUnique(kernels),
    [filteredKernels]
  );

  useEffect(() => {
    const unique = getUnique(kernels);
    setSelectedDtypes(unique.uniqueDtypes);
    setSelectedTags(unique.uniqueTags);
  }, [kernels]);

  const toggleTuningKernels = (kernelIds: string[], state: boolean) => {
    setTuningKernels((oldTk) => {
      if (state) {
        return new Set(Array.from(oldTk).concat(kernelIds));
      } else {
        return new Set(
          Array.from(oldTk).filter((id) => !kernelIds.includes(id))
        );
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
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                triggerTuningWorkflow(Array.from(tuningKernels));
              }}
            >
              Tune {tuningKernels.size} Kernels
            </button>
          )}
        </div>
        <FilterControls
          filters={[
            {
              type: "multi",
              props: {
                title: "Tuned",
                options: ["tuned", "untuned"],
                selectedOptions: selectedTuning,
                onInput: setSelectedTuning,
              },
            },
            {
              type: "multi",
              props: {
                title: "Kernel Type",
                options: Array.from(new Set(kernels.map((k) => k.kernelType))),
                selectedOptions: selectedKernelTypes,
                onInput: (kTypes: string[]) =>
                  setSelectedKernelTypes(kTypes as KernelType[]),
              },
            },
            {
              type: "multi",
              props: {
                title: "Data Types",
                options: uniqueDtypes,
                selectedOptions: selectedDtypes,
                onInput: setSelectedDtypes,
              },
            },
            {
              type: "multi",
              props: {
                title: "Tags",
                options: uniqueTags,
                selectedOptions: selectedTags,
                onInput: setSelectedTags,
              },
            },
          ]}
        />
      </div>
      <KernelList
        tuningResults={tuningResults}
        kernels={filteredKernels}
        toggleKernels={toggleTuningKernels}
        activeKernels={tuningKernels}
      />
    </PageContainer>
  );
}
