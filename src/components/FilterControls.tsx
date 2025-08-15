import type { Kernel, KernelType } from "../types";
import { getBackendColor } from "../utils/color";
import { KERNEL_DIMS } from "../utils/utils";

interface SelectProps {
  title: string;
  options: string[];
}
interface SingleSelectProps extends SelectProps {
  selectedOption: string;
  onInput: (selectedOption: string) => void;
}
interface MultiSelectProps extends SelectProps {
  selectedOptions: string[];
  distinctColors?: boolean;
  onInput: (selectedOptions: string[]) => void;
}

export function SingleSelectFilter({
  title,
  options,
  selectedOption,
  onInput,
}: SingleSelectProps) {
  return (
    <div className="select-none flex gap-2 items-center">
      <span className="font-semibold">{title}:</span>
      {options.map((option) => (
        <button
          key={option}
          className={`px-3 py-1 rounded ${option === selectedOption ? "bg-blue-600 text-white" : "bg-white border-gray-300"}`}
          onClick={() => onInput(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function MultiSelectFilter({
  title,
  options,
  selectedOptions,
  distinctColors,
  onInput,
}: MultiSelectProps) {
  function handleToggle(
    value: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  }

  return (
    <div className="select-none flex gap-2 items-center">
      <span className="font-semibold">{title}:</span>
      {options.map((option) => (
        <button
          key={option}
          className="px-2 py-1 rounded outline-0"
          style={{
            backgroundColor:
              selectedOptions.includes(option) && distinctColors
                ? getBackendColor(option).lighten(0.4).string()
                : selectedOptions.includes(option)
                  ? "#bfdbfe" // blue-200
                  : "#ffffff",
          }}
          onClick={(e) => {
            if (e.shiftKey) onInput([option]);
            else if (e.ctrlKey) onInput(options);
            else handleToggle(option, selectedOptions, onInput);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

interface FilterConfig {
  type: "single" | "multi";
  props: SingleSelectProps | MultiSelectProps;
}

interface FilterControlsProps {
  filters: FilterConfig[];
}

export default function FilterControls({ filters }: FilterControlsProps) {
  return (
    <div className="flex w-[100%] rounded-md shadow-md bg-gray-100 p-3 flex-wrap mb-6 gap-6 items-center justify-center">
      {filters.map((filter) =>
        filter.type === "single" ? (
          <SingleSelectFilter {...(filter.props as SingleSelectProps)} />
        ) : (
          <MultiSelectFilter {...(filter.props as MultiSelectProps)} />
        )
      )}
    </div>
  );
}

interface DashboardFilterControlsProps {
  kernels: Kernel[];
  kernelType: KernelType;
  setKernelType: (type: KernelType) => void;
  selectedBackends: string[];
  setSelectedBackends: (values: string[]) => void;
  selectedDtypes: string[];
  setSelectedDtypes: (values: string[]) => void;
  selectedTags: string[];
  setSelectedTags: (values: string[]) => void;
  selectedMachine: string;
  setSelectedMachine: (value: string) => void;
}

export function DashboardFilterControls({
  kernels,
  kernelType,
  setKernelType,
  selectedBackends,
  setSelectedBackends,
  selectedDtypes,
  setSelectedDtypes,
  selectedTags,
  setSelectedTags,
  selectedMachine,
  setSelectedMachine,
}: DashboardFilterControlsProps) {
  const activeKernels = kernels.filter((k) => k.kernelType === kernelType);
  const backends = Array.from(new Set(activeKernels.map((k) => k.backend)));
  const dtypes = Array.from(new Set(activeKernels.map((k) => k.dtype)));
  const tags = Array.from(new Set(activeKernels.map((k) => k.tag)));
  const machines = Array.from(new Set(activeKernels.map((k) => k.machine)));

  return (
    <FilterControls
      filters={[
        {
          type: "single",
          props: {
            title: "Machine",
            options: machines,
            selectedOption: selectedMachine,
            onInput: (machine: string) => setSelectedMachine(machine),
          },
        },
        {
          type: "single",
          props: {
            title: "Kernel Type",
            options: Object.keys(KERNEL_DIMS),
            selectedOption: kernelType,
            onInput: (str: string) => setKernelType(str as KernelType),
          },
        },
        {
          type: "multi",
          props: {
            title: "Backends",
            options: backends,
            selectedOptions: selectedBackends,
            distinctColors: true,
            onInput: setSelectedBackends,
          },
        },
        {
          type: "multi",
          props: {
            title: "Data Types",
            options: dtypes,
            selectedOptions: selectedDtypes,
            onInput: setSelectedDtypes,
          },
        },
        {
          type: "multi",
          props: {
            title: "Tags",
            options: tags,
            selectedOptions: selectedTags,
            onInput: setSelectedTags,
          },
        },
      ]}
    />
  );
}
