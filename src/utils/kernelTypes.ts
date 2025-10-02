import type { KernelTypeDefinition } from "../types";

// Sample kernel type definitions based on the existing types
export const DEFAULT_KERNEL_TYPES: KernelTypeDefinition[] = [
  {
    _id: "gemm",
    name: "gemm",
    displayName: "GEMM",
    description: "General matrix multiplication operations (C = A * B)",
    attributes: [
      {
        name: "M",
        type: "integer",
        required: true,
        description: "Number of rows in matrix A and C",
        constraints: { min: 1, max: 100000 },
      },
      {
        name: "N",
        type: "integer",
        required: true,
        description: "Number of columns in matrix B and C",
        constraints: { min: 1, max: 100000 },
      },
      {
        name: "K",
        type: "integer",
        required: true,
        description: "Number of columns in matrix A and rows in matrix B",
        constraints: { min: 1, max: 100000 },
      },
      {
        name: "transpose",
        type: "string",
        required: false,
        description: "Transpose configuration for matrices",
        constraints: { choices: ["NN", "NT", "TN", "TT"] },
      },
      {
        name: "dtype",
        type: "string",
        required: true,
        description: "Input data type for matrix elements",
        constraints: { choices: ["f16", "bf16", "f8"] },
      },
    ],
  },
  {
    _id: "attention",
    name: "attention",
    displayName: "Attention",
    description: "Attention mechanism computations for transformer models",
    attributes: [
      {
        name: "B",
        type: "integer",
        required: true,
        description: "Batch size",
        constraints: { min: 1, max: 1024 },
      },
      {
        name: "M",
        type: "integer",
        required: true,
        description: "Sequence length",
        constraints: { min: 1, max: 32768 },
      },
      {
        name: "N",
        type: "integer",
        required: true,
        description: "Number of attention heads",
        constraints: { min: 1, max: 128 },
      },
      {
        name: "K1",
        type: "integer",
        required: true,
        description: "Key dimension",
        constraints: { min: 1, max: 4096 },
      },
      {
        name: "K2",
        type: "integer",
        required: true,
        description: "Value dimension",
        constraints: { min: 1, max: 4096 },
      },
      {
        name: "dtype",
        type: "string",
        required: true,
        description: "Data type for computations",
        constraints: { choices: ["f16", "bf16", "f8"] },
      },
    ],
  },
  {
    _id: "conv",
    name: "conv",
    displayName: "Convolution",
    description: "Convolution operations for neural networks",
    attributes: [
      {
        name: "B",
        type: "integer",
        required: true,
        description: "Batch size",
        constraints: { min: 1, max: 1024 },
      },
      {
        name: "H",
        type: "integer",
        required: true,
        description: "Input height",
        constraints: { min: 1, max: 8192 },
      },
      {
        name: "W",
        type: "integer",
        required: true,
        description: "Input width",
        constraints: { min: 1, max: 8192 },
      },
      {
        name: "C",
        type: "integer",
        required: true,
        description: "Input channels",
        constraints: { min: 1, max: 4096 },
      },
      {
        name: "P",
        type: "integer",
        required: true,
        description: "Filter height",
        constraints: { min: 1, max: 11 },
      },
      {
        name: "Q",
        type: "integer",
        required: true,
        description: "Filter width",
        constraints: { min: 1, max: 11 },
      },
      {
        name: "F",
        type: "integer",
        required: true,
        description: "Output channels",
        constraints: { min: 1, max: 4096 },
      },
      {
        name: "S",
        type: "integer",
        required: false,
        description: "Stride",
        constraints: { min: 1, max: 8 },
      },
      {
        name: "dtype",
        type: "string",
        required: true,
        description: "Data type for computations",
        constraints: { choices: ["f16", "bf16", "f8"] },
      },
    ],
  },
];

// Helper function to create a new kernel type with generated ID
export function createKernelType(
  data: Omit<KernelTypeDefinition, "_id">
): KernelTypeDefinition {
  return {
    ...data,
    _id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

// Helper function to get a kernel type by its name
export function getKernelTypeByName(
  kernelTypes: KernelTypeDefinition[],
  name: string
): KernelTypeDefinition | undefined {
  return kernelTypes.find((kt) => kt.name === name);
}

// Helper function to validate kernel type data
export function validateKernelTypeData(
  data: Omit<KernelTypeDefinition, "_id">
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("Name is required");
  }

  if (!data.displayName.trim()) {
    errors.push("Display name is required");
  }

  if (data.attributes.length === 0) {
    errors.push("At least one attribute is required");
  }

  // Validate attribute names are unique
  const attrNames = data.attributes.map((attr) => attr.name.toLowerCase());
  const duplicateNames = attrNames.filter(
    (name, index) => attrNames.indexOf(name) !== index
  );
  if (duplicateNames.length > 0) {
    errors.push(
      `Duplicate attribute names: ${[...new Set(duplicateNames)].join(", ")}`
    );
  }

  // Validate each attribute
  data.attributes.forEach((attr, index) => {
    if (!attr.name.trim()) {
      errors.push(`Attribute ${index + 1}: Name is required`);
    }

    if (attr.constraints) {
      // Validate numeric constraints
      if (
        (attr.type === "integer" || attr.type === "float") &&
        attr.constraints.min !== undefined &&
        attr.constraints.max !== undefined
      ) {
        if (attr.constraints.min > attr.constraints.max) {
          errors.push(
            `Attribute "${attr.name}": Min value cannot be greater than max value`
          );
        }
      }

      // Validate string choices
      if (attr.type === "string" && attr.constraints.choices) {
        const uniqueChoices = [...new Set(attr.constraints.choices)];
        if (uniqueChoices.length !== attr.constraints.choices.length) {
          errors.push(`Attribute "${attr.name}": Duplicate choices found`);
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
