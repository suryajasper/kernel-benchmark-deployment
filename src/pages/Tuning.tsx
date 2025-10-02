import { useEffect, useMemo, useState } from "react";
import { Play, Filter } from "lucide-react";
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

  const filteredKernels = useMemo(() => {
    return kernels.filter(
      (k) =>
        selectedDtypes.includes(k.problem.dtype) &&
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
  ]);

  const getUnique = (fromKernels: KernelConfig[]) => {
    const uniqueDtypes = Array.from(
      new Set(fromKernels.map((k) => k.problem.dtype))
    );
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
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        {tuningKernels.size > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {tuningKernels.size} kernel{tuningKernels.size !== 1 ? "s" : ""}{" "}
                selected for tuning
              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm font-medium"
                onClick={() => {
                  triggerTuningWorkflow(Array.from(tuningKernels));
                }}
              >
                <Play className="w-4 h-4" />
                Tune {tuningKernels.size} Kernel
                {tuningKernels.size !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>

          <FilterControls
            filters={[
              {
                type: "multi",
                props: {
                  title: "Tuning Status",
                  options: ["tuned", "untuned"],
                  selectedOptions: selectedTuning,
                  onInput: setSelectedTuning,
                },
              },
              {
                type: "multi",
                props: {
                  title: "Kernel Type",
                  options: Array.from(
                    new Set(kernels.map((k) => k.kernelType))
                  ),
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

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Kernels ({filteredKernels.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select kernels to tune or view their current tuning configurations
            </p>
          </div>

          <div className="p-6">
            <KernelList
              tuningResults={tuningResults}
              kernels={filteredKernels}
              toggleKernels={toggleTuningKernels}
              activeKernels={tuningKernels}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
