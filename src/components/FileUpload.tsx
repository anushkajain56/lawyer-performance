
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAddLawyers } from "@/hooks/useLawyers";
import { Lawyer } from "@/types/lawyer";
import axios from "axios";

interface FileUploadProps {
  onFileUpload: (lawyers: Lawyer[]) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Lawyer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const addLawyersMutation = useAddLawyers();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      // Clear previous preview when new file is selected
      setPreview([]);
    }
  };

  const processFileWithBackend = async (file: File): Promise<Lawyer[]> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending file to Flask backend...');
      const response = await axios.post('http://localhost:5000/preprocess', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Backend response:', response.data);

      // Transform backend response to match our Lawyer interface
      const processedLawyers: Lawyer[] = response.data.map((row: any) => ({
        lawyer_id: row.lawyer_id || `L${Date.now()}-${Math.random()}`,
        branch_name: row.branch_name || 'Corporate',
        allocation_month: row.allocation_month || new Date().toISOString().slice(0, 7),
        case_id: row.case_id || `C${Date.now()}-${Math.random()}`,
        cases_assigned: parseInt(row.cases_assigned) || 30,
        cases_completed: parseInt(row.cases_completed) || 25,
        completion_rate: parseFloat(row.completion_rate) || 0.8,
        cases_remaining: parseInt(row.cases_remaining) || 5,
        performance_score: parseFloat(row.performance_score) || 0.75,
        tat_compliance_percent: parseFloat(row.tat_compliance_percent) || 0.8,
        avg_tat_days: parseFloat(row.avg_tat_days) || 15,
        tat_flag: (row.tat_flag as 'Red' | 'Green') || 'Green',
        quality_check_flag: row.quality_check_flag === true || row.quality_check_flag === 'true',
        client_feedback_score: parseFloat(row.client_feedback_score) || 4.0,
        feedback_flag: row.feedback_flag === true || row.feedback_flag === 'true',
        complaints_per_case: parseFloat(row.complaints_per_case) || 0.05,
        reworks_per_case: parseFloat(row.reworks_per_case) || 0.1,
        low_performance_flag: row.low_performance_flag === true || row.low_performance_flag === 'true',
        lawyer_score: parseFloat(row.lawyer_score) || Math.random() * 0.4 + 0.6,
        quality_rating: parseFloat(row.quality_rating) || 4.0,
        allocation_status: (row.allocation_status as 'Allocated' | 'Available') || 'Available',
        total_cases_ytd: parseInt(row.total_cases_ytd) || 100
      }));

      return processedLawyers;
    } catch (error) {
      console.error('Error processing file with backend:', error);
      throw new Error('Failed to process file with backend. Make sure your Flask server is running on localhost:5000');
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const processedData = await processFileWithBackend(file);
      // Show first 5 rows for preview
      setPreview(processedData.slice(0, 5));
      
      toast({
        title: "File processed successfully",
        description: `Preview showing first ${Math.min(5, processedData.length)} rows from ${processedData.length} total records.`,
      });
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Failed to process file for preview.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Process file with backend
      const processedLawyers = await processFileWithBackend(file);
      
      // Upload processed data to Supabase
      await addLawyersMutation.mutateAsync(processedLawyers);
      
      // Notify parent component
      onFileUpload(processedLawyers);
      
      // Reset form
      setFile(null);
      setPreview([]);
      
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Lawyer Data</h1>
        <p className="text-muted-foreground">Upload a CSV file to process with the backend and store in the database</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              File Upload & Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>

            {file && (
              <Alert>
                <AlertDescription>
                  Selected file: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handlePreview} 
                disabled={!file || isProcessing}
                variant="outline"
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Preview (Backend)'}
              </Button>
              
              <Button 
                onClick={handleUpload} 
                disabled={!file || isProcessing || addLawyersMutation.isPending}
                className="flex-1"
              >
                {isProcessing || addLawyersMutation.isPending ? 'Uploading...' : 'Process & Upload'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>• Preview: Processes file with Flask backend and shows first 5 rows</p>
              <p>• Upload: Processes file with Flask backend and saves all data to database</p>
              <p>• Backend URL: http://localhost:5000/preprocess</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backend Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="font-medium">Flask Backend Features:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Feature Engineering:</strong> Calculates completion_rate, cases_remaining, complaints_per_case, reworks_per_case</li>
                <li><strong>Data Encoding:</strong> Creates encoded flags (tat_flag_encoded, feedback_flag_encoded)</li>
                <li><strong>Date Processing:</strong> Derives allocation_month_num from allocation_date</li>
                <li><strong>Performance Flags:</strong> Computes low_performance_flag automatically</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                The backend processes your raw CSV and returns fully transformed data ready for analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Backend Processed Preview</CardTitle>
            <p className="text-sm text-muted-foreground">First {preview.length} rows processed by Flask backend</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Lawyer ID</th>
                    <th className="text-left p-2">Branch</th>
                    <th className="text-left p-2">Cases Assigned</th>
                    <th className="text-left p-2">Cases Completed</th>
                    <th className="text-left p-2">Completion Rate</th>
                    <th className="text-left p-2">Low Performance</th>
                    <th className="text-left p-2">Lawyer Score</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((lawyer) => (
                    <tr key={lawyer.lawyer_id} className="border-b">
                      <td className="p-2 font-medium">{lawyer.lawyer_id}</td>
                      <td className="p-2">{lawyer.branch_name}</td>
                      <td className="p-2">{lawyer.cases_assigned}</td>
                      <td className="p-2">{lawyer.cases_completed}</td>
                      <td className="p-2">{(lawyer.completion_rate * 100).toFixed(1)}%</td>
                      <td className="p-2">
                        {lawyer.low_performance_flag ? (
                          <span className="text-red-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-green-600">No</span>
                        )}
                      </td>
                      <td className="p-2 font-bold text-blue-600">
                        {(lawyer.lawyer_score * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
