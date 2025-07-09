import { Lawyer } from '@/types/lawyer';

export interface CSVProcessingResult {
  success: boolean;
  data?: Lawyer[];
  error?: string;
}

export interface RawLawyerRow {
  [key: string]: string | number;
}

export const parseCSVContent = (csvContent: string): CSVProcessingResult => {
  try {
    console.log('Starting pandas-style CSV processing...');
    
    if (!csvContent || csvContent.trim().length === 0) {
      return { success: false, error: 'CSV file appears to be empty' };
    }

    const lines = csvContent.trim().split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length < 1) {
      return { success: false, error: 'CSV file must have at least a header row' };
    }

    let separator = ',';
    if (lines[0].includes(';') && !lines[0].includes(',')) {
      separator = ';';
    }
    
    const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
    console.log('CSV headers:', headers);
    
    const rawRows: RawLawyerRow[] = [];
    
    if (lines.length === 1) {
      console.log('Only headers found, no data to process');
      return { success: false, error: 'CSV file contains only headers, no data rows found' };
    } else {
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, ''));
          const row: RawLawyerRow = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          rawRows.push(row);
        } catch (rowError) {
          console.error(`Error processing row ${i}:`, rowError);
        }
      }
    }

    return { success: true, data: rawRows as any };
  } catch (error) {
    console.error('Error parsing CSV:', error);
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