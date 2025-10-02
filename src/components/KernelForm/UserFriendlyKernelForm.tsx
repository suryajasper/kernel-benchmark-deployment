import { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaCheck } from "react-icons/fa";
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Add Kernels</h3>
          <p className="text-sm text-gray-600">
            Fill in the attributes for each kernel you want to add.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {validKernelCount} of {kernels.length} kernels valid
          </span>
          <button
            onClick={addKernel}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <FaPlus /> Add Kernel
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {kernels.map((kernel, kernelIndex) => (
          <div
            key={kernel.id}
            className={`p-4 border rounded-lg transition-colors ${
              kernel.isValid
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Kernel {kernelIndex + 1}</h4>
                {kernel.isValid && (
                  <FaCheck className="text-green-500 text-sm" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => duplicateKernel(kernelIndex)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Duplicate
                </button>
                {kernels.length > 1 && (
                  <button
                    onClick={() => removeKernel(kernelIndex)}
                    className="p-1 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {allKernelsValid ? (
            <span className="text-green-600 flex items-center gap-1">
              <FaCheck /> All kernels are valid and ready to submit
            </span>
          ) : (
            <span>
              Please fix validation errors before submitting.
              {validKernelCount > 0 &&
                ` ${validKernelCount} kernel(s) will be added.`}
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={validKernelCount === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <FaCheck />
          Add {validKernelCount} Kernel{validKernelCount !== 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
}
