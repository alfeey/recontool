import React, { useState, useCallback } from 'react';
import { Shield, FileText, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { ReconciliationResults } from './components/ReconciliationResults';
import { parseCSV, readFileAsText } from './utils/csvParser';
import { reconcileTransactions } from './utils/reconciliation';
import type { FileUploadState, ReconciliationResult } from './types/Transaction';
import './darkTheme.css';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadState>({
    internal: null,
    provider: null,
  });
  const [results, setResults] = useState<ReconciliationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFileSelect = useCallback(async (file: File, type: 'internal' | 'provider') => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
    setError(null);
    
    const newFiles = { ...uploadedFiles, [type]: file };
    if (newFiles.internal && newFiles.provider) {
      await processReconciliation(newFiles.internal, newFiles.provider);
    }
  }, [uploadedFiles]);

  const processReconciliation = async (internalFile: File, providerFile: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const [internalText, providerText] = await Promise.all([
        readFileAsText(internalFile),
        readFileAsText(providerFile),
      ]);

      const internalTransactions = parseCSV(internalText);
      const providerTransactions = parseCSV(providerText);

      if (internalTransactions.length === 0) {
        throw new Error('No valid transactions found in internal file');
      }
      if (providerTransactions.length === 0) {
        throw new Error('No valid transactions found in provider file');
      }

      const reconciliationResults = reconcileTransactions(internalTransactions, providerTransactions);
      setResults(reconciliationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing files');
      setResults(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetReconciliation = () => {
    setUploadedFiles({ internal: null, provider: null });
    setResults(null);
    setError(null);
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-3 text-center">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold">Transaction Reconciliation Tool</h1>
              <p className="text-gray-400">Compare internal system exports with payment provider statements</p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8 mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-center">Upload Transaction Files</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileUploader
              onFileSelect={handleFileSelect}
              uploadedFiles={uploadedFiles}
              type="internal"
              title="Internal System Export"
              description="Upload your platform's transaction export CSV file"
              darkMode
            />
            <FileUploader
              onFileSelect={handleFileSelect}
              uploadedFiles={uploadedFiles}
              type="provider"
              title="Payment Provider Statement"
              description="Upload your payment processor's statement CSV file"
              darkMode
            />
          </div>

          {(uploadedFiles.internal || uploadedFiles.provider) && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {uploadedFiles.internal && uploadedFiles.provider
                    ? 'Both files uploaded. Reconciliation will begin automatically.'
                    : 'Upload the second file to start reconciliation.'}
                </div>
                <button
                  onClick={resetReconciliation}
                  className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  Reset All Files
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8 mb-8">
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-gray-300">Processing reconciliation...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-300 font-semibold">Processing Error</h3>
                <p className="text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && !isProcessing && (
          <ReconciliationResults results={results} />
        )}

        {/* Instructions Dropdown */}
        {!uploadedFiles.internal && !uploadedFiles.provider && (
          <div className="mb-8">
            <div 
              className={`flex items-center justify-between cursor-pointer p-4 rounded-lg ${
                showInstructions 
                  ? 'bg-blue-900/30 border-b-0 rounded-b-none' 
                  : 'bg-blue-900/20 hover:bg-blue-900/30'
              } border border-blue-800 transition-colors`}
              onClick={toggleInstructions}
              onKeyDown={(e) => e.key === 'Enter' && toggleInstructions()}
              tabIndex={0}
            >
              <h3 className="text-blue-300 font-semibold">How to Use This Tool</h3>
              {showInstructions ? (
                <ChevronUp className="w-5 h-5 text-blue-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-blue-300" />
              )}
            </div>
            
            {showInstructions && (
              <div className="bg-blue-900/20 border border-blue-800 border-t-0 rounded-t-none rounded-lg p-6">
                <div className="text-blue-200 space-y-2">
                  <p>1. Upload your internal system's transaction export CSV file</p>
                  <p>2. Upload your payment provider's statement CSV file</p>
                  <p>3. The tool will automatically compare transactions using the transaction reference</p>
                  <p>4. Review the reconciliation results and export any category as needed</p>
                </div>
                <div className="mt-4 p-4 bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-200">
                    <strong>CSV Format Requirements:</strong> Files should contain columns for transaction reference/ID, 
                    amount, and status. The tool will automatically detect these columns based on common naming patterns.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;