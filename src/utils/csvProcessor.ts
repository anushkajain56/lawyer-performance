import { Lawyer } from '@/types/lawyer';
import { parseCSVContent as parseCSV, RawLawyerRow } from './csvParser';
import { processRowWithFeatureEngineering } from './csvFeatureEngineering';
import { aggregateByLawyerId } from './csvAggregation';
import { convertToLawyerFormat } from './csvTransformer';

export interface CSVProcessingResult {
  success: boolean;
  data?: Lawyer[];
  error?: string;
}

export type { RawLawyerRow };

export const parseCSVContent = (csvContent: string): CSVProcessingResult => {
  try {
    console.log('Starting CSV processing...');
    
    // Step 1: Parse raw CSV content
    const parseResult = parseCSV(csvContent);
    if (!parseResult.success) {
      return parseResult;
    }

    const rawRows = parseResult.data as any[];
    if (!rawRows || rawRows.length === 0) {
      return { success: false, error: 'No valid data rows found in CSV' };
    }

    // Step 2: Process each row with feature engineering
    const processedRows = rawRows.map(row => processRowWithFeatureEngineering(row));

    // Step 3: Group by lawyer_id and apply aggregation rules
    const aggregatedData = aggregateByLawyerId(processedRows);

    // Step 4: Convert to final Lawyer format
    const finalData: Lawyer[] = aggregatedData.map(convertToLawyerFormat);

    console.log('Successfully processed', finalData.length, 'lawyer records');
    console.log('Sample processed lawyer:', finalData[0]);
    return { success: true, data: finalData };
  } catch (error) {
    console.error('Error processing CSV:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred while processing CSV' 
    };
  }
};