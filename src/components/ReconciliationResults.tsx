import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Download, TrendingUp } from 'lucide-react';
import type { ReconciliationResult } from '../types/Transaction';
import { exportToCSV } from '../utils/csvParser';

interface ReconciliationResultsProps {
  results: ReconciliationResult;
}

export const ReconciliationResults: React.FC<ReconciliationResultsProps> = ({ results }) => {
  const totalTransactions = results.matched.length + results.internalOnly.length + results.providerOnly.length;
  const matchedCount = results.matched.length;
  const matchPercentage = totalTransactions > 0 ? (matchedCount / totalTransactions) * 100 : 0;
  const mismatchedCount = results.matched.filter(m => m.mismatches.length > 0).length;

  const handleExportMatched = () => {
    const data = results.matched.map(match => ({
      transaction_reference: match.internal.transaction_reference,
      internal_amount: match.internal.amount,
      provider_amount: match.provider.amount,
      internal_status: match.internal.status,
      provider_status: match.provider.status,
      mismatches: match.mismatches.join('; '),
    }));
    exportToCSV(data, 'matched_transactions.csv');
  };

  const handleExportInternalOnly = () => {
    exportToCSV(results.internalOnly, 'internal_only_transactions.csv');
  };

  const handleExportProviderOnly = () => {
    exportToCSV(results.providerOnly, 'provider_only_transactions.csv');
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Reconciliation Summary</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
            <div className="text-sm text-blue-600">Total Transactions</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{matchedCount}</div>
            <div className="text-sm text-green-600">Matched</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-600">{results.internalOnly.length + results.providerOnly.length}</div>
            <div className="text-sm text-amber-600">Unmatched</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{mismatchedCount}</div>
            <div className="text-sm text-red-600">With Mismatches</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Match Rate</span>
            <span className="text-sm font-semibold text-gray-800">{matchPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${matchPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Matched Transactions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Matched Transactions ({results.matched.length})
              </h3>
            </div>
            <button
              onClick={handleExportMatched}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={results.matched.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {results.matched.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No matched transactions found</p>
          ) : (
            <div className="space-y-3">
              {results.matched.slice(0, 10).map((match, index) => (
                <div key={index} className={`p-4 rounded-lg border ${match.mismatches.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-sm font-semibold">{match.internal.transaction_reference}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Amount: Ksh {match.internal.amount.toFixed(2)} | Status: {match.internal.status}
                      </div>
                    </div>
                    {match.mismatches.length > 0 && (
                      <div className="text-right">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mb-1" />
                        <div className="text-xs text-amber-700">
                          {match.mismatches.map((mismatch, i) => (
                            <div key={i}>{mismatch}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {results.matched.length > 10 && (
                <p className="text-center text-gray-500 text-sm pt-4">
                  Showing first 10 of {results.matched.length} matched transactions
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Internal Only Transactions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Present Only in Internal File ({results.internalOnly.length})
              </h3>
            </div>
            <button
              onClick={handleExportInternalOnly}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              disabled={results.internalOnly.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {results.internalOnly.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No internal-only transactions found</p>
          ) : (
            <div className="space-y-3">
              {results.internalOnly.slice(0, 10).map((transaction, index) => (
                <div key={index} className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <div className="font-mono text-sm font-semibold">{transaction.transaction_reference}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Amount: ${transaction.amount.toFixed(2)} | Status: {transaction.status}
                  </div>
                </div>
              ))}
              {results.internalOnly.length > 10 && (
                <p className="text-center text-gray-500 text-sm pt-4">
                  Showing first 10 of {results.internalOnly.length} internal-only transactions
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Provider Only Transactions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Present Only in Provider File ({results.providerOnly.length})
              </h3>
            </div>
            <button
              onClick={handleExportProviderOnly}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={results.providerOnly.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {results.providerOnly.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No provider-only transactions found</p>
          ) : (
            <div className="space-y-3">
              {results.providerOnly.slice(0, 10).map((transaction, index) => (
                <div key={index} className="p-4 rounded-lg border border-red-200 bg-red-50">
                  <div className="font-mono text-sm font-semibold">{transaction.transaction_reference}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Amount: ${transaction.amount.toFixed(2)} | Status: {transaction.status}
                  </div>
                </div>
              ))}
              {results.providerOnly.length > 10 && (
                <p className="text-center text-gray-500 text-sm pt-4">
                  Showing first 10 of {results.providerOnly.length} provider-only transactions
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};