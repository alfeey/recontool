import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File, type: 'internal' | 'provider') => void;
  uploadedFiles: {
    internal: File | null;
    provider: File | null;
  };
  type: 'internal' | 'provider';
  title: string;
  description: string;
  darkMode?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  uploadedFiles,
  type,
  title,
  description,
  darkMode = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const currentFile = uploadedFiles[type];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      onFileSelect(csvFile, type);
    }
  }, [onFileSelect, type]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, type);
    }
  }, [onFileSelect, type]);

  // Theme-aware styles
  const getContainerStyles = () => {
    if (isDragOver) {
      return darkMode 
        ? 'border-blue-400 bg-blue-900/20' 
        : 'border-blue-400 bg-blue-50';
    }
    if (currentFile) {
      return darkMode 
        ? 'border-green-500 bg-green-900/20' 
        : 'border-green-400 bg-green-50';
    }
    return darkMode 
      ? 'border-gray-600 bg-gray-800 hover:border-gray-500' 
      : 'border-gray-300 bg-gray-50 hover:border-gray-400';
  };

  const getTextStyles = () => {
    return darkMode ? 'text-gray-200' : 'text-gray-700';
  };

  const getSecondaryTextStyles = () => {
    return darkMode ? 'text-gray-400' : 'text-gray-500';
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${getContainerStyles()}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center space-y-4">
          {currentFile ? (
            <>
              <CheckCircle className={`w-12 h-12 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                  {title}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-600'} mt-1`}>
                  {currentFile.name} ({(currentFile.size / 1024).toFixed(1)} KB)
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                  Click or drop a new file to replace
                </p>
              </div>
            </>
          ) : (
            <>
              {isDragOver ? (
                <Upload className={`w-12 h-12 ${darkMode ? 'text-blue-400' : 'text-blue-500'} animate-bounce`} />
              ) : (
                <FileText className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              )}
              <div>
                <h3 className={`text-lg font-semibold ${getTextStyles()}`}>{title}</h3>
                <p className={`text-sm ${getSecondaryTextStyles()} mt-1`}>{description}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                  Drag and drop your CSV file here, or click to browse
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};