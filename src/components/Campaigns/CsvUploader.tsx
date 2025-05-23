
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

interface CsvUploaderProps {
  onUpload: (data: any[]) => void;
  onColumnsDetected: (columns: string[]) => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onUpload, onColumnsDetected }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  // Support for handling drag events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [onUpload, onColumnsDetected]
  );

  // Process the uploaded file
  const handleFile = (file: File) => {
    setIsLoading(true);
    setFileName(file.name);

    // Check if it's a supported file type (CSV/XLS/XLSX)
    if (file.type !== "text/csv" && 
        !file.name.endsWith('.csv') && 
        !file.name.endsWith('.xls') && 
        !file.name.endsWith('.xlsx')) {
      toast.error("Please upload a CSV or Excel file");
      setIsLoading(false);
      return;
    }

    // Enhanced CSV parsing with more flexible options
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimiter: '',  // Auto-detect delimiter
      transformHeader: (header) => header.trim(),  // Trim whitespace from headers
      complete: (results) => {
        setIsLoading(false);
        
        if (results.errors.length > 0) {
          const errorMsg = `Error parsing file: ${results.errors[0].message}`;
          console.error(errorMsg, results.errors);
          toast.error(errorMsg);
          return;
        }

        // If no data or headers detected
        if (results.data.length === 0) {
          toast.error("No data found in the file");
          return;
        }

        // Additional check for empty rows
        const validData = results.data.filter(row => {
          // Filter out empty objects or objects where all values are null/empty
          const values = Object.values(row);
          return values.length > 0 && values.some(val => val !== null && val !== '');
        });

        if (validData.length === 0) {
          toast.error("File contains no valid data rows");
          return;
        }

        // Get column headers
        const columns = Object.keys(validData[0]);
        
        if (columns.length === 0) {
          toast.error("No columns detected in the file");
          return;
        }
        
        onColumnsDetected(columns);
        onUpload(validData);
        toast.success(`Successfully imported ${validData.length} contacts`);
      },
      error: (error) => {
        setIsLoading(false);
        console.error("CSV parsing error:", error);
        toast.error(`Error parsing file: ${error.message}`);
      }
    });
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 transition-all ${
        isDragging ? "border-primary bg-blue-50" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center">
        {!fileName ? (
          <>
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="mb-2 text-lg font-medium">Upload Contact List</h3>
            <p className="mb-4 text-sm text-gray-500 text-center">
              Drag and drop your CSV, Excel or Google Sheet file here, or click to browse
            </p>
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="mb-2"
              disabled={isLoading}
            >
              <FileUp className="mr-2 h-4 w-4" />
              {isLoading ? "Uploading..." : "Select File"}
            </Button>
            <p className="text-xs text-gray-500">
              Supports CSV, Excel (.xls, .xlsx) and Google Sheets export files
            </p>
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="mb-1 text-lg font-medium">File Uploaded</h3>
            <p className="mb-4 text-sm text-gray-600">{fileName}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFileName("");
                document.getElementById("file-upload")?.click();
              }}
            >
              Change File
            </Button>
          </>
        )}
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileInputChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
