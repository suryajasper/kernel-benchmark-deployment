import { useState, useMemo } from "react";
import {
  FaFileImport,
  FaCheck,
  FaExclamationTriangle,
  FaDownload,
} from "react-icons/fa";
import { validateAttributeValue } from "./AttributeInput";
import type { KernelTypeDefinition } from "../../types";

interface KernelData {
  id: string;
  values: Record<string, string | boolean>;
  isValid: boolean;
  errors: Record<string, string>;
}

interface EngineerFriendlyKernelFormProps {
  kernelType: KernelTypeDefinition;
  onSubmit: (kernels: KernelData[]) => void;
}

interface ParsedRow {
  rowNumber: number;
  values: Record<string, string | boolean>;
  errors: string[];
}

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

const convertValue = (
  value: string,
  attributeType: string
): string | boolean => {
  if (attributeType === "boolean") {
    const lower = value.toLowerCase().trim();
    return (
      lower === "true" || lower === "1" || lower === "yes" || lower === "y"
    );
  }
  return value.trim();
};

export default function EngineerFriendlyKernelForm({
  kernelType,
  onSubmit,
}: EngineerFriendlyKernelFormProps) {
  const [inputText, setInputText] = useState<string>("");

  // Generate example CSV format
  const exampleCSV = useMemo(() => {
    const headers = kernelType.attributes.map((attr) => attr.name).join(",");
    const exampleRow = kernelType.attributes
      .map((attr) => {
        switch (attr.type) {
          case "integer":
            const intMin = attr.constraints?.min ?? 1;
            const intMax = attr.constraints?.max ?? 100;
            return Math.floor((intMin + intMax) / 2).toString();
          case "float":
            const floatMin = attr.constraints?.min ?? 0.1;
            const floatMax = attr.constraints?.max ?? 1.0;
            return ((floatMin + floatMax) / 2).toFixed(2);
          case "string":
            return attr.constraints?.choices?.[0] ?? "example";
          case "boolean":
            return "true";
          default:
            return "value";
        }
      })
      .join(",");

    return `${headers}\n${exampleRow}`;
  }, [kernelType]);

  // Parse and validate input
  const parsedData = useMemo(() => {
    if (!inputText.trim()) {
      return { rows: [], errors: [] };
    }

    const lines = inputText
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    if (lines.length === 0) {
      return { rows: [], errors: [] };
    }

    const errors: string[] = [];
    const rows: ParsedRow[] = [];

    // Parse header line (optional)
    let startIndex = 0;
    const firstLine = parseCSVLine(lines[0]);

    // Check if first line looks like headers
    const isHeaderLine = firstLine.every((cell) =>
      kernelType.attributes.some(
        (attr) => attr.name.toLowerCase() === cell.toLowerCase().trim()
      )
    );

    if (isHeaderLine) {
      startIndex = 1;
    }

    // Parse data lines
    for (let i = startIndex; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i];
      const cells = parseCSVLine(line);

      if (cells.length !== kernelType.attributes.length) {
        errors.push(
          `Line ${lineNumber}: Expected ${kernelType.attributes.length} values, got ${cells.length}`
        );
        continue;
      }

      const values: Record<string, string | boolean> = {};
      const rowErrors: string[] = [];

      kernelType.attributes.forEach((attr, index) => {
        const rawValue = cells[index];
        const convertedValue = convertValue(rawValue, attr.type);
        values[attr.name] = convertedValue;

        // Validate the value
        const validation = validateAttributeValue(convertedValue, attr);
        if (!validation.isValid) {
          rowErrors.push(`${attr.name}: ${validation.message}`);
        }
      });

      rows.push({
        rowNumber: lineNumber,
        values,
        errors: rowErrors,
      });
    }

    return { rows, errors };
  }, [inputText, kernelType]);

  const downloadTemplate = () => {
    const blob = new Blob([exampleCSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${kernelType.name}-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    const validRows = parsedData.rows.filter((row) => row.errors.length === 0);

    const kernels: KernelData[] = validRows.map((row, index) => ({
      id: `kernel-${Date.now()}-${index}`,
      values: row.values,
      isValid: true,
      errors: {},
    }));

    if (kernels.length > 0) {
      onSubmit(kernels);
      setInputText("");
    }
  };

  const validKernelCount = parsedData.rows.filter(
    (row) => row.errors.length === 0
  ).length;
  const totalRows = parsedData.rows.length;
  const hasErrors =
    parsedData.errors.length > 0 ||
    parsedData.rows.some((row) => row.errors.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Bulk Import Kernels</h3>
          <p className="text-sm text-gray-600">
            Paste CSV data or comma-separated values to add multiple kernels at
            once.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
        >
          <FaDownload /> Download Template
        </button>
      </div>

      {/* Format Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Expected Format</h4>
        <div className="space-y-2">
          <p className="text-sm text-blue-800">
            Each line should contain values for:{" "}
            <strong>
              {kernelType.attributes.map((attr) => attr.name).join(", ")}
            </strong>
          </p>
          <div className="bg-white border border-blue-200 rounded p-2 font-mono text-xs overflow-x-auto">
            <pre>{exampleCSV}</pre>
          </div>
          <div className="text-xs text-blue-700">
            <p>• First line can optionally contain headers</p>
            <p>• Boolean values: true/false, 1/0, yes/no, y/n</p>
            <p>• Use quotes for values containing commas</p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          CSV Data
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Paste your CSV data here...\n\nExample:\n${exampleCSV}`}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      {/* Validation Results */}
      {inputText.trim() && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Validation Results</h4>
            <div className="flex items-center gap-3">
              {hasErrors && (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle /> {totalRows - validKernelCount}{" "}
                  errors
                </span>
              )}
              <span className="text-sm text-green-600 flex items-center gap-1">
                <FaCheck /> {validKernelCount} valid kernels
              </span>
            </div>
          </div>

          {/* Parse Errors */}
          {parsedData.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h5 className="font-medium text-red-800 mb-2">Parse Errors:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {parsedData.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Row Validation Errors Only */}
          {parsedData.rows.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {parsedData.rows
                .filter((row) => row.errors.length > 0)
                .map((row) => (
                  <div
                    key={row.rowNumber}
                    className="p-2 rounded-lg border bg-red-50 border-red-200"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                      <span className="font-medium">Row {row.rowNumber}:</span>
                      <span className="text-red-700">
                        {row.errors.join(", ")}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {validKernelCount > 0 ? (
            <span className="text-green-600 flex items-center gap-1">
              <FaCheck /> {validKernelCount} kernel
              {validKernelCount !== 1 ? "s" : ""} ready to import
            </span>
          ) : inputText.trim() ? (
            <span className="text-red-600">
              Please fix validation errors before importing
            </span>
          ) : (
            <span>Paste CSV data above to get started</span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={validKernelCount === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <FaFileImport />
          Import {validKernelCount} Kernel{validKernelCount !== 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
}
