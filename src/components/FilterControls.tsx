import { useEffect, useRef, useState } from "react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"left" | "right">(
    "left"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 256; // 64 * 4 (w-64 in tailwind)
      const windowWidth = window.innerWidth;

      // Check if dropdown would overflow on the right
      if (buttonRect.left + dropdownWidth > windowWidth - 20) {
        // 20px margin
        setDropdownPosition("right");
      } else {
        setDropdownPosition("left");
      }
    }
  }, [isDropdownOpen]);

  function handleToggle(
    value: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) {
    if (selected.includes(value)) {
      if (selected.length === 1) setSelected(options);
      else setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  }

  function handleOptionClick(option: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey) onInput([option]);
    else if (e.ctrlKey) onInput(options);
    else handleToggle(option, selectedOptions, onInput);
  }

  const allSelected = selectedOptions.length === options.length;

  // Render as dropdown if more than 10 options
  if (options.length > 10) {
    return (
      <div
        className="select-none flex gap-2 items-center relative"
        ref={dropdownRef}
      >
        <span className="font-semibold">{title}:</span>
        <div className="relative">
          <button
            ref={buttonRef}
            className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {allSelected
              ? "All selected"
              : selectedOptions.length === 0
                ? "None selected"
                : `${selectedOptions.length} selected`}
            <span className="ml-2">▼</span>
          </button>

          {isDropdownOpen && (
            <div
              className={`absolute z-10 mt-1 w-80 max-h-90 overflow-auto bg-white border border-gray-300 rounded shadow-lg ${
                dropdownPosition === "right" ? "right-0" : "left-0"
              }`}
            >
              <div className="p-2 border-b">
                <button
                  className="text-sm text-blue-600 hover:text-blue-800 mr-4"
                  onClick={(e) => {
                    e.preventDefault();
                    onInput(options);
                  }}
                >
                  Select All
                </button>
                <button
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.preventDefault();
                    onInput([]);
                  }}
                >
                  Clear All
                </button>
              </div>
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => handleOptionClick(option, e)}
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={() => {}} // Handled by label onClick
                    className="mr-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span
                    style={{
                      color:
                        selectedOptions.includes(option) && distinctColors
                          ? getBackendColor(option).darken(0.2).string()
                          : undefined,
                    }}
                  >
                    {option}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original row layout for 10 or fewer options
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
          onClick={(e) => handleOptionClick(option, e)}
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
  selectedVariants: string[];
  setSelectedVariants: (value: string[]) => void;
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
  selectedVariants,
  setSelectedVariants,
}: DashboardFilterControlsProps) {
  const typeKernels = kernels.filter((k) => k.kernelType === kernelType);
  const machines = Array.from(new Set(typeKernels.map((k) => k.machine)));
  const activeKernels = typeKernels.filter(
    (k) => k.machine === selectedMachine
  );
  const backends = Array.from(new Set(activeKernels.map((k) => k.backend)));
  const dtypes = Array.from(new Set(activeKernels.map((k) => k.dtype)));
  const tags = Array.from(new Set(activeKernels.map((k) => k.tag)));

  const filters: FilterConfig[] = [
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
      type: "single",
      props: {
        title: "Machine",
        options: machines,
        selectedOption: selectedMachine,
        onInput: (machine: string) => setSelectedMachine(machine),
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
  ];

  if (kernelType === "gemm") {
    const variants = Array.from(
      new Set(
        activeKernels.map((k) => k.shape.transpose || k.shape.tA + k.shape.tB)
      )
    );
    filters.push({
      type: "multi",
      props: {
        title: "Transpose",
        options: variants,
        selectedOptions: selectedVariants,
        onInput: setSelectedVariants,
      },
    });
  }

  return <FilterControls filters={filters} />;
}
