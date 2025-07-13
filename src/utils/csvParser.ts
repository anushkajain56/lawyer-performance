
import { Lawyer } from '@/types/lawyer';

export interface CSVProcessingResult {
  success: boolean;
  data?: Lawyer[];
  error?: string;
}

export interface RawLawyerRow {
  [key: string]: string | number;
}

// Optimized CSV parser with better performance
export const parseCSVContent = (csvContent: string): CSVProcessingResult => {
  try {
    console.log('Starting fast CSV parsing...');
    
    if (!csvContent || csvContent.trim().length === 0) {
      return { success: false, error: 'CSV file appears to be empty' };
    }

    // Fast line splitting and filtering
    const lines = csvContent.trim().split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length < 1) {
      return { success: false, error: 'CSV file must have at least a header row' };
    }

    // Auto-detect separator
    const firstLine = lines[0];
    const separator = (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
    
    // Fast header parsing
    const headers = firstLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
    console.log('CSV headers detected:', headers.length, 'columns');
    
    if (lines.length === 1) {
      console.log('Only headers found, no data to process');
      return { success: false, error: 'CSV file contains only headers, no data rows found' };
    }

    // Fast row processing
    const rawRows: RawLawyerRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
      const row: RawLawyerRow = {};
      
      // Map values to headers
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rawRows.push(row);
    }

    console.log(`Fast parsing completed: ${rawRows.length} rows processed`);
    return { success: true, data: rawRows as any };
  } catch (error) {
    console.error('Error in fast CSV parsing:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred while parsing CSV' 
    };
  }
};

export function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
