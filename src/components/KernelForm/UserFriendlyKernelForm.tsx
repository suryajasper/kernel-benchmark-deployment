import { useState, useEffect } from "react";
import { Plus, X, Check, Copy } from "lucide-react";
import AttributeInput, { validateAttributeValue } from "./AttributeInput";
import type { KernelTypeDefinition, KernelTypeAttribute } from "../../types";

interface KernelData {
  id: string;
  values: Record<string, string | boolean>;
  isValid: boolean;
  errors: Record<string, string>;
}

interface UserFriendlyKernelFormProps {
  kernelType: KernelTypeDefinition;
  onSubmit: (kernels: KernelData[]) => void;
}

const createEmptyKernel = (kernelType: KernelTypeDefinition): KernelData => {
  const values: Record<string, string | boolean> = {};

  // Initialize with default values
  kernelType.attributes.forEach((attr) => {
    if (attr.type === "boolean") {
      values[attr.name] = false;
    } else {
      values[attr.name] = "";
    }
  });

  return {
    id: `kernel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    values,
    isValid: false,
    errors: {},
  };
};

const validateKernel = (
  kernel: KernelData,
  attributes: KernelTypeAttribute[]
): KernelData => {
  const errors: Record<string, string> = {};
  let isValid = true;

  attributes.forEach((attr) => {
    const value = kernel.values[attr.name];
    const validation = validateAttributeValue(value, attr);

    if (!validation.isValid) {
      errors[attr.name] = validation.message || "Invalid value";
      isValid = false;
    }
  });

  return {
    ...kernel,
    isValid,
    errors,
  };
};

export default function UserFriendlyKernelForm({
  kernelType,
  onSubmit,
}: UserFriendlyKernelFormProps) {
  const [kernels, setKernels] = useState<KernelData[]>([
    createEmptyKernel(kernelType),
  ]);

  // Revalidate all kernels when kernel type changes
  useEffect(() => {
    setKernels([createEmptyKernel(kernelType)]);
  }, [kernelType]);

  // Revalidate kernels whenever they change
  useEffect(() => {
    const validatedKernels = kernels.map((kernel) =>
      validateKernel(kernel, kernelType.attributes)
    );

    // Only update if validation results actually changed
    const hasChanges = validatedKernels.some((vKernel, index) => {
      const original = kernels[index];
      return (
        vKernel.isValid !== original.isValid ||
        JSON.stringify(vKernel.errors) !== JSON.stringify(original.errors)
      );
    });

    if (hasChanges) {
      setKernels(validatedKernels);
    }
  }, [
    kernels.map((k) => JSON.stringify(k.values)).join(","),
    kernelType.attributes,
  ]);

  const updateKernelValue = (
    kernelIndex: number,
    attributeId: string,
    value: string | boolean
  ) => {
    setKernels((prev) => {
      const updated = [...prev];
      updated[kernelIndex] = {
        ...updated[kernelIndex],
        values: {
          ...updated[kernelIndex].values,
          [attributeId]: value,
        },
      };
      return updated;
    });
  };

  const addKernel = () => {
    setKernels((prev) => [...prev, createEmptyKernel(kernelType)]);
  };

  const removeKernel = (index: number) => {
    if (kernels.length > 1) {
      setKernels((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const duplicateKernel = (index: number) => {
    const kernelToCopy = kernels[index];
    const newKernel: KernelData = {
      id: `kernel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      values: { ...kernelToCopy.values },
      isValid: kernelToCopy.isValid,
      errors: { ...kernelToCopy.errors },
    };

    setKernels((prev) => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newKernel);
      return updated;
    });
  };

  const handleSubmit = () => {
    const validKernels = kernels.filter((kernel) => kernel.isValid);
    if (validKernels.length > 0) {
      onSubmit(validKernels);
    }
  };

  const allKernelsValid =
    kernels.length > 0 && kernels.every((kernel) => kernel.isValid);
  const validKernelCount = kernels.filter((kernel) => kernel.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Add Kernels</h3>
          <p className="text-gray-600 mt-1">
            Configure kernel attributes for each kernel you want to add.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            <span className="font-medium text-green-600">
              {validKernelCount}
            </span>{" "}
            of <span className="font-medium">{kernels.length}</span> valid
          </div>
          <button
            onClick={addKernel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Kernel</span>
          </button>
        </div>
      </div>

      {/* Kernel Cards */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {kernels.map((kernel, kernelIndex) => (
          <div
            key={kernel.id}
            className={`border-2 rounded-xl transition-all duration-200 ${
              kernel.isValid
                ? "border-green-200 bg-green-50/50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {/* Kernel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    kernel.isValid ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  {kernel.isValid ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Kernel {kernelIndex + 1}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {Object.keys(kernel.errors).length > 0
                      ? `${Object.keys(kernel.errors).length} error(s) to fix`
                      : kernel.isValid
                        ? "Ready to submit"
                        : "Fill in required fields"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => duplicateKernel(kernelIndex)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  title="Duplicate this kernel"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
                {kernels.length > 1 && (
                  <button
                    onClick={() => removeKernel(kernelIndex)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                    title="Remove this kernel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Kernel Attributes */}
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {kernelType.attributes.map((attribute) => (
                  <AttributeInput
                    key={attribute.name}
                    attribute={attribute}
                    value={kernel.values[attribute.name]}
                    onChange={(value) =>
                      updateKernelValue(kernelIndex, attribute.name, value)
                    }
                    error={kernel.errors[attribute.name]}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allKernelsValid ? (
              <div className="flex items-center gap-2 text-green-700">
                <div className="p-1 bg-green-100 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-medium">
                  All kernels are valid and ready to submit
                </span>
              </div>
            ) : (
              <div className="text-gray-600">
                <span>Please fix validation errors before submitting.</span>
                {validKernelCount > 0 && (
                  <span className="ml-1 font-medium text-green-600">
                    {validKernelCount} kernel(s) will be added.
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={validKernelCount === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-all duration-200"
          >
            <Check className="w-4 h-4" />
            <span>
              Add {validKernelCount} Kernel{validKernelCount !== 1 ? "s" : ""}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
