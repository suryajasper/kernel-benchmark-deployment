import { useState } from "react";
import { FaCheck, FaExclamationTriangle, FaTimes } from "react-icons/fa";
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
    workflow: "all",
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center gap-3">
          <FaCheck className="text-green-600" />
          Confirm Kernel Addition
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Configuration Section */}
          <div className="space-y-4">
            {/* Tag Input */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Kernel Tag *</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={config.tag}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, tag: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., llama, square, perf2025"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-sm text-blue-700">
                  This tag will be applied to all {kernels.length} kernel
                  {kernels.length !== 1 ? "s" : ""} and can be used to group
                  them in the dashboard.
                </p>
              </div>
            </div>

            {/* Machine Selection */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3">
                Target Machines *
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-green-700">
                  Select which machines should run these kernels. At least one
                  machine must be selected.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_MACHINES.map((machine) => (
                    <label
                      key={machine}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={config.machines.includes(machine)}
                        onChange={() => handleMachineToggle(machine)}
                        disabled={isSubmitting}
                        className="rounded border-green-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-green-800">
                        {machine}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="text-xs text-green-600">
                  Selected: {config.machines.length} of{" "}
                  {AVAILABLE_MACHINES.length} machines
                </div>
              </div>
            </div>

            {/* Workflow Selection */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-3">
                Workflow Configuration *
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-purple-700">
                  Choose when these kernels should be executed in the
                  benchmarking workflows.
                </p>
                <div className="space-y-2">
                  <label className="flex items-start space-x-2">
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
                      className="mt-0.5 border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-purple-800">
                        Never run (Disabled)
                      </span>
                      <p className="text-xs text-purple-600">
                        Kernels will be stored but not executed in any workflows
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-2">
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
                      className="mt-0.5 border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-purple-800">
                        End-to-end nightly only
                      </span>
                      <p className="text-xs text-purple-600">
                        Run only in comprehensive nightly workflows (slower,
                        thorough)
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-2">
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
                      <span className="text-sm font-medium text-purple-800">
                        Both workflows (Recommended)
                      </span>
                      <p className="text-xs text-purple-600">
                        Run in both quick benchmarks and nightly end-to-end
                        workflows
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Kernels Review Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Review {kernels.length} Kernel{kernels.length !== 1 ? "s" : ""}{" "}
              for {kernelType.displayName}
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {kernels.map((kernel, index) => (
                <div
                  key={kernel.id}
                  className="border border-gray-200 rounded-lg p-3 bg-white"
                >
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    Kernel {index + 1}
                    <FaCheck className="text-green-500 text-sm" />
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {kernelType.attributes.map((attribute) => {
                      const value = kernel.values[attribute.name];
                      const displayValue = formatValue(value, attribute.type);

                      return (
                        <div
                          key={attribute.name}
                          className="bg-gray-50 p-2 rounded border"
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
                            <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded">
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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
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
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaTimes />
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting || !isFormValid}
          className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Adding Kernels...
            </>
          ) : (
            <>
              <FaCheck />
              Add {kernels.length} Kernel{kernels.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}
