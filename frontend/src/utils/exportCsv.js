/**
 * CSV Export Utility
 * 
 * Converts an array of JavaScript objects into a standard CSV formatted string
 * and triggers a file download in the browser.
 * 
 * @param {Array<Object>} data - Array of row objects
 * @param {Array<{key: string, label: string}>} columns - Column definition with key & label
 * @param {string} filename - Output file name (e.g. 'inventory_products.csv')
 */

export const exportToCsv = (data, columns, filename = 'export.csv') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // 1. Generate CSV header row
  const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // 2. Generate CSV data rows
  const dataRows = data.map((row) => {
    return columns
      .map((col) => {
        let value = row[col.key];

        // Format dates or undefined values
        if (value === undefined || value === null) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else {
          value = String(value);
        }

        // Escape double quotes inside values
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  // 3. Combine header and rows with newline
  const csvContent = [headerRow, ...dataRows].join('\r\n');

  // 4. Create Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
