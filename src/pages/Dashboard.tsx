import RooflinePlot from "../components/Plots/RooflinePlot";
import { BarComparisonPlot } from "../components/Plots/BarPlot";
import { BellComparisonPlot } from "../components/Plots/BellPlot";
import { DashboardFilterControls } from "../components/FilterControls";
import { useEffect, useMemo, useState } from "react";
import type { Kernel } from "../types";
import { fetchData } from "../utils/csv";
import KernelView from "../components/KernelView";
import PageContainer from "../components/PageContainer";
import {
  filterKernelsByPercentile,
  getCommonKernels,
  KERNEL_DIMS,
} from "../utils/utils";
import { useParams } from "react-router-dom";
import { useKernelFilters } from "../hooks/useKernelFilters";

export default function Dashboard() {
  const [kernels, setKernels] = useState<Kernel[]>([]);
  const [selectedKernelId, setSelectedKernelId] = useState<string | null>(null);
  const [graphType, setGraphType] = useState<string>("bar");
  const [comparisonMetric, setComparisonMetric] = useState<string>("tflops");
  const [percentile, setPercentile] = useState<number>(90);

  const { runId } = useParams();

  // Use the new filter hook
  const { filters, availableOptions, filteredKernels, updateFilter } =
    useKernelFilters(kernels);

  useEffect(() => {
    if (runId) fetchData(runId).then(setKernels);
  }, [runId]);

  // const filteredWaveKernels = useMemo(
  //   () =>
  //     filteredKernels.filter((k) => k.backend.toLowerCase().startsWith("wave")),
  //   [filteredKernels]
  // );

  const selectedKernel = useMemo(
    () => kernels.find((k) => k.id === selectedKernelId),
    [kernels, selectedKernelId]
  );

  const sameShapeKernels = useMemo(() => {
    if (!selectedKernel) return [];
    return kernels.filter((k) => {
      if (k.kernelType !== selectedKernel.kernelType) return false;
      if (k.dtype !== selectedKernel.dtype) return false;
      return KERNEL_DIMS[k.kernelType].every(
        (dimName) => k.shape[dimName] === selectedKernel.shape[dimName]
      );
    });
  }, [kernels, selectedKernel]);

  const commonKernels = useMemo(
    () =>
      filterKernelsByPercentile(
        getCommonKernels(filteredKernels),
        Math.min(Math.max(percentile / 100, 0), 1)
      ),
    [filteredKernels, percentile]
  );

  return (
    <PageContainer activePage="dashboard" isLoading={kernels.length === 0}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <DashboardFilterControls
          filters={filters}
          availableOptions={availableOptions}
          updateFilter={updateFilter}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="w-full lg:w-[60%] flex flex-col items-center">
          <h2 className="text-xl mb-4 font-bold">Roofline Plot</h2>
          <RooflinePlot
            kernels={commonKernels}
            setSelected={setSelectedKernelId}
            selectedKernel={selectedKernel}
          />
        </div>
        <div className="w-full lg:w-[40%] flex flex-col items-center">
          {!selectedKernelId && (
            <div className="flex flex-row gap-5 mb-4">
              <div className="flex flex-row gap-2">
                <h2 className="text-xl font-bold">Graph: </h2>
                <select
                  className="outline-none"
                  value={graphType}
                  onChange={(e) => setGraphType(e.currentTarget.value)}
                >
                  <option value="bar">Bar</option>
                  <option value="bell">Frequency</option>
                </select>
              </div>
              <div className="flex flex-row gap-2">
                <h2 className="text-xl font-bold">Metric: </h2>
                <select
                  className="outline-none"
                  value={comparisonMetric}
                  onChange={(e) => setComparisonMetric(e.currentTarget.value)}
                >
                  <option value="tflops">TFLOPs</option>
                  <option value="runtime">Runtime</option>
                </select>
              </div>
              <div className="flex flex-row gap-2">
                <h2 className="text-xl font-bold">Percentile: </h2>
                <input
                  className="pl-2"
                  type="number"
                  min={1}
                  max={100}
                  value={percentile}
                  onChange={(e) =>
                    setPercentile(parseFloat(e.currentTarget.value))
                  }
                />
              </div>
              %
            </div>
          )}

          <h2 className="text-xl mb-4 font-bold">
            {comparisonMetric == "tflops"
              ? "Average TFLOPs"
              : "Average runtime (microseconds)"}
            {selectedKernel && `: ${selectedKernel.name}`}
          </h2>
          {graphType === "bar" || selectedKernelId ? (
            <BarComparisonPlot
              kernels={selectedKernelId ? sameShapeKernels : commonKernels}
              metric={comparisonMetric}
            />
          ) : (
            <BellComparisonPlot
              kernels={selectedKernelId ? sameShapeKernels : commonKernels}
              metric={comparisonMetric}
            />
          )}

          {/* {!selectedKernel && filteredWaveKernels.length > 0 && (
            <button
              className="px-4 mt-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                console.log(
                  filteredKernels.map((k) => ({
                    backend: k.backend,
                    latency_us: k.meanMicroseconds,
                    tflops: k.tflops,
                    shape: k.shape,
                  }))
                );
              }}
            >
              Tune {filteredWaveKernels.length} Wave Kernels
            </button>
          )} */}
        </div>
      </div>

      {selectedKernel && (
        <KernelView
          selectedKernel={selectedKernel}
          sameShapeKernels={sameShapeKernels}
          kernels={kernels}
          setSelected={setSelectedKernelId}
        />
      )}
    </PageContainer>
  );
}
