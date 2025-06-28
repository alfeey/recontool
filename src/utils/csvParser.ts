import type { Transaction } from '../types/Transaction';

export const parseCSV = (csvText: string): Transaction[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length !== headers.length) continue;

    const transaction: Transaction = {
      transaction_reference: '',
      amount: 0,
      status: '',
    };

    headers.forEach((header, index) => {
      const value = values[index];
      
      if (header.toLowerCase().includes('reference') || header.toLowerCase().includes('id')) {
        transaction.transaction_reference = value;
      } else if (header.toLowerCase().includes('amount')) {
        transaction.amount = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
      } else if (header.toLowerCase().includes('status')) {
        transaction.status = value;
      } else if (header.toLowerCase().includes('date')) {
        transaction.date = value;
      } else if (header.toLowerCase().includes('description')) {
        transaction.description = value;
      } else {
        transaction[header] = value;
      }
    });

    if (transaction.transaction_reference) {
      transactions.push(transaction);
    }
  }

  return transactions;
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};