import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAddLawyers } from "@/hooks/useLawyers";
import { Lawyer } from "@/types/lawyer";
import { supabase } from "@/integrations/supabase/client";
import { parseCSVContent } from "@/utils/csvProcessor";

interface FileUploadProps {
  onFileUpload: (lawyers: Lawyer[]) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Lawyer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingMethod, setProcessingMethod] = useState<'edge-function' | 'client-side' | null>(null);
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
      setPreview([]);
      setError(null);
      setProcessingMethod(null);
    }
  };

  const processWithEdgeFunction = async (file: File): Promise<Lawyer[]> => {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Attempting Edge Function processing...');
    
    const { data, error } = await supabase.functions.invoke('preprocess-csv', {
      body: formData,
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(`Edge Function failed: ${error.message}`);
    }

    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid response from Edge Function');
    }

    console.log('Edge Function response sample:', data[0]);

    // Map the edge function response to our Lawyer type with proper expertise_domains handling
    return data.map((row: any, index: number): Lawyer => {
      // Ensure expertise_domains is properly preserved as a full string
      const expertiseDomains = row.expertise_domains || row.domain;
      console.log(`Lawyer ${index} expertise_domains from Edge Function:`, expertiseDomains);
      
      return {
        lawyer_id: row.lawyer_id || `L${Date.now()}-${index}`,
        lawyer_name: row.lawyer_name || undefined,
        branch_name: row.branch_name || 'Corporate',
        expertise_domains: expertiseDomains || undefined, // Preserve full string
        allocation_month: row.allocation_month || new Date().toISOString().slice(0, 7),
        case_id: row.case_id || `C${Date.now()}-${index}`,
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
      };
    });
  };

  const processWithClientSide = async (file: File): Promise<Lawyer[]> => {
    console.log('Using client-side processing...');
    const csvContent = await file.text();
    const result = parseCSVContent(csvContent);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to process CSV on client-side');
    }
    
    return result.data;
  };

  const processFile = async (file: File): Promise<{ data: Lawyer[], method: 'edge-function' | 'client-side' }> => {
    // Try Edge Function first, then fallback to client-side processing
    try {
      const data = await processWithEdgeFunction(file);
      return { data, method: 'edge-function' };
    } catch (edgeError) {
      console.warn('Edge Function failed, falling back to client-side processing:', edgeError);
      
      try {
        const data = await processWithClientSide(file);
        return { data, method: 'client-side' };
      } catch (clientError) {
        console.error('Client-side processing also failed:', clientError);
        throw new Error(`Processing failed: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
      }
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const { data, method } = await processFile(file);
      console.log('Preview data sample with expertise domains:', data.slice(0, 3).map(d => ({ 
        id: d.lawyer_id, 
        name: d.lawyer_name, 
        domains: d.expertise_domains 
      })));
      setPreview(data.slice(0, 5));
      setProcessingMethod(method);
      
      toast({
        title: "File processed successfully",
        description: `Preview showing first ${Math.min(5, data.length)} rows from ${data.length} total records. Processed using ${method === 'edge-function' ? 'Supabase Edge Function' : 'client-side processing'}.`,
      });
    } catch (error) {
      console.error('Preview error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process file for preview.";
      setError(errorMessage);
      toast({
        title: "Preview failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const { data, method } = await processFile(file);
      console.log('Upload data sample with expertise domains:', data.slice(0, 3).map(d => ({ 
        id: d.lawyer_id, 
        name: d.lawyer_name, 
        domains: d.expertise_domains 
      })));
      setProcessingMethod(method);
      
      await addLawyersMutation.mutateAsync(data);
      
      onFileUpload(data);
      
      setFile(null);
      setPreview([]);
      
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${data.length} lawyer records using ${method === 'edge-function' ? 'Supabase Edge Function' : 'client-side processing'}.`,
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "There was an error processing your file. Please try again.";
      setError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
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
        <p className="text-muted-foreground">Upload a CSV file with robust processing and automatic fallback</p>
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

            {processingMethod && (
              <Alert>
                {processingMethod === 'edge-function' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {processingMethod === 'edge-function' 
                    ? 'Processed using Supabase Edge Function (server-side)' 
                    : 'Processed using client-side fallback (Edge Function unavailable)'}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handlePreview} 
                disabled={!file || isProcessing}
                variant="outline"
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Preview'}
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
              <p>• <strong>Dual Processing:</strong> Edge Function with client-side fallback</p>
              <p>• <strong>Robust:</strong> Handles various CSV formats and missing data</p>
              <p>• <strong>Reliable:</strong> Always works regardless of backend status</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="font-medium">Automatic Processing Features:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Smart Fallback:</strong> Edge Function → Client-side if needed</li>
                <li><strong>Feature Engineering:</strong> Auto-calculates performance metrics</li>
                <li><strong>Data Validation:</strong> Handles missing/invalid data gracefully</li>
                <li><strong>Flexible CSV:</strong> Supports comma/semicolon separators</li>
                <li><strong>Sample Generation:</strong> Creates realistic data if only headers provided</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                The system automatically chooses the best processing method available and ensures your data is always processed successfully.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview - Processed Data</CardTitle>
            <p className="text-sm text-muted-foreground">
              First {preview.length} rows processed 
              {processingMethod && ` using ${processingMethod === 'edge-function' ? 'Supabase Edge Function' : 'client-side processing'}`}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Lawyer ID</th>
                    <th className="text-left p-2">Lawyer Name</th>
                    <th className="text-left p-2">Branch</th>
                    <th className="text-left p-2">All Expertise Domains</th>
                    <th className="text-left p-2">Cases Assigned</th>
                    <th className="text-left p-2">Cases Completed</th>
                    <th className="text-left p-2">Completion Rate</th>
                    <th className="text-left p-2">Lawyer Score</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((lawyer) => (
                    <tr key={lawyer.lawyer_id} className="border-b">
                      <td className="p-2 font-medium">{lawyer.lawyer_id}</td>
                      <td className="p-2">{lawyer.lawyer_name || 'Not specified'}</td>
                      <td className="p-2">{lawyer.branch_name}</td>
                      <td className="p-2 max-w-xs">
                        <div className="break-words">
                          {lawyer.expertise_domains ? (
                            <span className="text-sm">
                              {lawyer.expertise_domains}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">{lawyer.cases_assigned}</td>
                      <td className="p-2">{lawyer.cases_completed}</td>
                      <td className="p-2">{(lawyer.completion_rate * 100).toFixed(1)}%</td>
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
