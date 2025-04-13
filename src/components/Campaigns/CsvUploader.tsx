
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, FileText, Upload, X, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';

interface CsvUploaderProps {
  onUpload: (data: any[]) => void;
  onColumnsDetected: (columns: string[]) => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ 
  onUpload,
  onColumnsDetected
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    setError(null);
    setIsUploaded(false);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsLoading(false);
        
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }
        
        if (results.data.length === 0) {
          setError('The CSV file is empty');
          return;
        }
        
        // Check for required phone number column
        const columns = Object.keys(results.data[0]);
        const hasPhoneColumn = columns.some(col => 
          col.toLowerCase().includes('phone') || 
          col.toLowerCase() === 'mobile' || 
          col.toLowerCase() === 'cell'
        );
        
        if (!hasPhoneColumn) {
          setError('CSV must contain a phone number column');
          return;
        }
        
        onUpload(results.data);
        onColumnsDetected(columns);
        setIsUploaded(true);
      },
      error: (error) => {
        setIsLoading(false);
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const resetFile = () => {
    setFile(null);
    setError(null);
    setIsUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept=".csv"
            className="cursor-pointer"
          />
        </div>
        <div>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isLoading || isUploaded}
            className="w-full"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing
              </>
            ) : isUploaded ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Uploaded
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>
      
      {file && !error && !isUploaded && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetFile}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isUploaded && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            File uploaded successfully. Please map the columns below.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
