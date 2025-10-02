import { useState } from "react";
import {
  Check,
  AlertTriangle,
  X,
  Loader2,
  Tag,
  Settings,
  Monitor,
} from "lucide-react";
import Modal from "../Modal/Modal";
import { ModalHeader, ModalBody, ModalFooter } from "../Modal/ModalComponents";
import type { KernelTypeDefinition } from "../../types";

interface KernelData {
  id: string;
  values: Record<string, string | boolean>;
  isValid: boolean;
  errors: Record<string, string>;
}

export interface KernelRuntimeConfig {
  tag: string;
  workflow: "none" | "e2e" | "all";
  machines: string[];
}

interface KernelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: KernelRuntimeConfig) => void;
  kernelType: KernelTypeDefinition;
  kernels: KernelData[];
}

const AVAILABLE_MACHINES = ["mi300x", "mi325x", "mi350x", "mi355x"];

export default function KernelConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  kernelType,
  kernels,
}: KernelConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<KernelRuntimeConfig>({
    tag: "",
    workflow: "e2e",
    machines: AVAILABLE_MACHINES, // Default to all machines
  });

  const handleConfirm = async () => {
    if (!config.tag.trim()) {
      alert("Please enter a tag for the kernels.");
      return;
    }

    if (config.machines.length === 0) {
      alert("Please select at least one machine.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        ...config,
        tag: config.tag.trim(),
      });
      onClose();
      // Reset config on successful submission
      setConfig({
        tag: "",
        workflow: "all",
        machines: AVAILABLE_MACHINES,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset config on cancel
      setConfig({
        tag: "",
        workflow: "all",
        machines: AVAILABLE_MACHINES,
      });
      onClose();
    }
  };

  const handleMachineToggle = (machine: string) => {
    setConfig((prev) => ({
      ...prev,
      machines: prev.machines.includes(machine)
        ? prev.machines.filter((m) => m !== machine)
        : [...prev.machines, machine],
    }));
  };

  const isFormValid = config.tag.trim() && config.machines.length > 0;
  const formatValue = (
    value: string | boolean,
    attributeType: string
  ): string => {
    if (attributeType === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Confirm Kernel Addition
            </h2>
            <p className="text-sm text-gray-600">
              Review and configure {kernels.length} kernel
              {kernels.length !== 1 ? "s" : ""} for deployment
            </p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Configuration Section */}
          <div className="space-y-4">
            {/* Tag Input */}
            <div
              className={`rounded-xl p-5 shadow-sm transition-colors ${
                !config.tag.trim()
                  ? "bg-red-50 border-2 border-red-300"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    !config.tag.trim() ? "bg-red-100" : "bg-blue-100"
                  }`}
                >
                  <Tag
                    className={`w-4 h-4 ${
                      !config.tag.trim() ? "text-red-600" : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      !config.tag.trim() ? "text-red-900" : "text-gray-900"
                    }`}
                  >
                    Kernel Tag *
                  </h4>
                  <p
                    className={`text-sm ${
                      !config.tag.trim() ? "text-red-700" : "text-gray-600"
                    }`}
                  >
                    Identifier for grouping kernels
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={config.tag}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, tag: e.target.value }))
                  }
                  className={`w-full px-4 py-3 rounded-lg outline-0 transition-colors ${
                    !config.tag.trim()
                      ? "border-2 border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      : "border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="e.g., llama, square, perf2025"
                  required
                  disabled={isSubmitting}
                />
                {!config.tag.trim() && (
                  <p className="text-sm text-red-600 font-medium">
                    ⚠ Please enter a tag for the kernels
                  </p>
                )}
                <p
                  className={`text-sm ${
                    !config.tag.trim() ? "text-red-700" : "text-gray-600"
                  }`}
                >
                  This tag will be applied to all {kernels.length} kernel
                  {kernels.length !== 1 ? "s" : ""} and can be used to group
                  them in the dashboard.
                </p>
              </div>
            </div>

            {/* Machine Selection */}
            <div
              className={`rounded-xl p-5 shadow-sm transition-colors ${
                config.machines.length === 0
                  ? "bg-red-50 border-2 border-red-300"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    config.machines.length === 0 ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  <Monitor
                    className={`w-4 h-4 ${
                      config.machines.length === 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  />
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      config.machines.length === 0
                        ? "text-red-900"
                        : "text-gray-900"
                    }`}
                  >
                    Target Machines *
                  </h4>
                  <p
                    className={`text-sm ${
                      config.machines.length === 0
                        ? "text-red-700"
                        : "text-gray-600"
                    }`}
                  >
                    Hardware platforms for execution
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p
                  className={`text-sm ${
                    config.machines.length === 0
                      ? "text-red-700"
                      : "text-gray-600"
                  }`}
                >
                  Select which machines should run these kernels. At least one
                  machine must be selected.
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {AVAILABLE_MACHINES.map((machine) => (
                    <label
                      key={machine}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        config.machines.length === 0
                          ? "border-2 border-red-300 hover:bg-red-100"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={config.machines.includes(machine)}
                        onChange={() => handleMachineToggle(machine)}
                        disabled={isSubmitting}
                        className={`rounded focus:ring-2 outline-0 ${
                          config.machines.length === 0
                            ? "border-red-300 text-red-600 focus:ring-red-500"
                            : "border-gray-300 text-green-600 focus:ring-green-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          config.machines.length === 0
                            ? "text-red-900"
                            : "text-gray-900"
                        }`}
                      >
                        {machine}
                      </span>
                    </label>
                  ))}
                </div>
                {config.machines.length === 0 && (
                  <p className="text-sm text-red-600 font-medium">
                    ⚠ Please select at least one machine
                  </p>
                )}
                <div
                  className={`text-sm px-3 py-2 rounded-lg ${
                    config.machines.length === 0
                      ? "text-red-700 bg-red-100"
                      : "text-gray-600 bg-gray-50"
                  }`}
                >
                  Selected: {config.machines.length} of{" "}
                  {AVAILABLE_MACHINES.length} machines
                </div>
              </div>
            </div>

            {/* Workflow Selection */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                  <Settings className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Workflow Configuration *
                  </h4>
                  <p className="text-sm text-gray-600">
                    Execution scheduling preferences
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Choose when these kernels should be executed in the
                  benchmarking workflows.
                </p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="workflow"
                      value="none"
                      checked={config.workflow === "none"}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          workflow: e.target.value as "none" | "e2e" | "all",
                        }))
                      }
                      disabled={isSubmitting}
                      className="mt-0.5 border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Never run (Disabled)
                      </span>
                      <p className="text-xs text-gray-600">
                        Kernels will be stored but not executed in any workflows
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="workflow"
                      value="e2e"
                      checked={config.workflow === "e2e"}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          workflow: e.target.value as "none" | "e2e" | "all",
                        }))
                      }
                      disabled={isSubmitting}
                      className="mt-0.5 border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        End-to-end nightly only
                      </span>
                      <p className="text-xs text-gray-600">
                        Run only in comprehensive nightly workflows (slower,
                        thorough)
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="workflow"
                      value="all"
                      checked={config.workflow === "all"}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          workflow: e.target.value as "none" | "e2e" | "all",
                        }))
                      }
                      disabled={isSubmitting}
                      className="mt-0.5 border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Both workflows
                      </span>
                      <p className="text-xs text-gray-700">
                        Run in both quick benchmarks and nightly end-to-end
                        workflows. Quick benchmarks are run automatically upon
                        each Wave pull request.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Kernels Review Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Review {kernels.length} Kernel
                  {kernels.length !== 1 ? "s" : ""}
                </h4>
                <p className="text-sm text-gray-600">
                  {kernelType.displayName} configuration
                </p>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {kernels.map((kernel, index) => (
                <div
                  key={kernel.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <h5 className="font-medium text-gray-900">
                      Kernel {index + 1}
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {kernelType.attributes.map((attribute) => {
                      const value = kernel.values[attribute.name];
                      const displayValue = formatValue(value, attribute.type);

                      return (
                        <div
                          key={attribute.name}
                          className="bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                {attribute.name}
                              </span>
                              {attribute.required && (
                                <span className="text-red-500 text-xs ml-1">
                                  *
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                              {displayValue || (
                                <em className="text-gray-400">empty</em>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-yellow-900">
                    Important Note
                  </h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Once added, these kernels will be available for benchmarking
                    and analysis with the selected configuration. Make sure all
                    values are correct.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting || !isFormValid}
          className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding Kernels...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Add {kernels.length} Kernel{kernels.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}
