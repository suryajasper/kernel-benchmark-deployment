import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import type { KernelTypeDefinition } from "../../types";

interface KernelTypeDisplayProps {
  kernelTypes: KernelTypeDefinition[];
  selectedKernelType: KernelTypeDefinition | null;
  onSelectKernelType: (kernelType: KernelTypeDefinition) => void;
  onCreateNewType: () => void;
  onEditKernelType?: (kernelType: KernelTypeDefinition) => void;
  onDeleteKernelType?: (kernelType: KernelTypeDefinition) => void;
}

export default function KernelTypeDisplay({
  kernelTypes,
  selectedKernelType,
  onSelectKernelType,
  onCreateNewType,
  onEditKernelType,
  onDeleteKernelType,
}: KernelTypeDisplayProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Kernel Types</h2>
      <div className="flex flex-wrap gap-3 items-center">
        {kernelTypes.map((kernelType) => (
          <button
            key={kernelType._id}
            onClick={() => onSelectKernelType(kernelType)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedKernelType?._id === kernelType._id
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            <div className="text-center">
              <div className="font-medium">{kernelType.displayName}</div>
              <div className="text-xs opacity-75">
                {kernelType.attributes.length} attributes
              </div>
            </div>
          </button>
        ))}

        <button
          onClick={onCreateNewType}
          className="px-4 py-2 rounded-lg border border-dashed border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
        >
          <FaPlus className="text-sm" />
          <span>Add New Type</span>
        </button>
      </div>

      {selectedKernelType && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-lg">
              {selectedKernelType.displayName}
            </h3>
            <div className="flex items-center gap-2">
              {onEditKernelType && (
                <button
                  onClick={() => onEditKernelType(selectedKernelType)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Edit kernel type"
                >
                  <FaEdit className="text-sm" />
                </button>
              )}
              {onDeleteKernelType && (
                <button
                  onClick={() => onDeleteKernelType(selectedKernelType)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete kernel type"
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
          </div>
          {selectedKernelType.description && (
            <p className="text-gray-600 mb-3">
              {selectedKernelType.description}
            </p>
          )}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Attributes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectedKernelType.attributes.map((attr) => (
                <div key={attr.name} className="bg-white p-2 rounded border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{attr.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        attr.required
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {attr.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Type: {attr.type}
                    {attr.constraints?.min !== undefined &&
                      attr.constraints?.max !== undefined && (
                        <span>
                          {" "}
                          ({attr.constraints.min} - {attr.constraints.max})
                        </span>
                      )}
                    {attr.constraints?.choices && (
                      <span>
                        {" "}
                        (choices: {attr.constraints.choices.join(", ")})
                      </span>
                    )}
                  </div>
                  {attr.description && (
                    <div className="text-xs text-gray-600 mt-1">
                      {attr.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
