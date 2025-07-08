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

interface FileUploadProps {
  onFileUpload: (lawyers: Lawyer[]) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Lawyer[]>([]);
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
      parseCSVPreview(selectedFile);
    }
  };

  const parseCSVPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Parse first few rows for preview
      const previewData: Lawyer[] = lines.slice(1, 6).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return {
          lawyer_id: values[0] || `L${Date.now()}-${index}`,
          branch_name: values[1] || 'Corporate',
          allocation_month: values[2] || '2024-01',
          case_id: values[3] || `C${Date.now()}-${index}`,
          cases_assigned: parseInt(values[4]) || 30,
          cases_completed: parseInt(values[5]) || 25,
          completion_rate: parseFloat(values[6]) || 0.8,
          cases_remaining: parseInt(values[7]) || 5,
          performance_score: parseFloat(values[8]) || 0.75,
          tat_compliance_percent: parseFloat(values[9]) || 0.8,
          avg_tat_days: parseFloat(values[10]) || 15,
          tat_flag: (values[11] as 'Red' | 'Green') || 'Green',
          quality_check_flag: values[12] === 'true' || false,
          client_feedback_score: parseFloat(values[13]) || 4.0,
          feedback_flag: values[14] === 'true' || false,
          complaints_per_case: parseFloat(values[15]) || 0.05,
          reworks_per_case: parseFloat(values[16]) || 0.1,
          low_performance_flag: values[17] === 'true' || false,
          lawyer_score: parseFloat(values[18]) || Math.random() * 0.4 + 0.6,
          quality_rating: parseFloat(values[19]) || 4.0,
          allocation_status: (values[20] as 'Allocated' | 'Available') || 'Available',
          total_cases_ytd: parseInt(values[21]) || 100
        };
      }).filter(lawyer => lawyer.lawyer_id && lawyer.lawyer_id !== '');
      
      setPreview(previewData);
    };
    reader.readAsText(file);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const processedLawyers: Lawyer[] = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return {
            lawyer_id: values[0] || `uploaded-${Date.now()}-${index}`,
            branch_name: values[1] || 'Corporate',
            allocation_month: values[2] || new Date().toISOString().slice(0, 7),
            case_id: values[3] || `C${Date.now()}-${index}`,
            cases_assigned: parseInt(values[4]) || 30,
            cases_completed: parseInt(values[5]) || 25,
            completion_rate: parseFloat(values[6]) || 0.8,
            cases_remaining: parseInt(values[7]) || 5,
            performance_score: parseFloat(values[8]) || 0.75,
            tat_compliance_percent: parseFloat(values[9]) || 0.8,
            avg_tat_days: parseFloat(values[10]) || 15,
            tat_flag: (values[11] as 'Red' | 'Green') || 'Green',
            quality_check_flag: values[12] === 'true' || false,
            client_feedback_score: parseFloat(values[13]) || 4.0,
            feedback_flag: values[14] === 'true' || false,
            complaints_per_case: parseFloat(values[15]) || 0.05,
            reworks_per_case: parseFloat(values[16]) || 0.1,
            low_performance_flag: values[17] === 'true' || false,
            lawyer_score: parseFloat(values[18]) || Math.random() * 0.4 + 0.6,
            quality_rating: parseFloat(values[19]) || 4.0,
            allocation_status: (values[20] as 'Allocated' | 'Available') || 'Available',
            total_cases_ytd: parseInt(values[21]) || 100
          };
        }).filter(lawyer => lawyer.lawyer_id && lawyer.lawyer_id !== '');

        // Use the mutation to upload to database
        await addLawyersMutation.mutateAsync(processedLawyers);
        
        onFileUpload(processedLawyers);
        
        setFile(null);
        setPreview([]);
        
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Lawyer Data</h1>
        <p className="text-muted-foreground">Upload a CSV file to store performance data in the database</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              File Upload
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

            <Button 
              onClick={handleUpload} 
              disabled={!file || addLawyersMutation.isPending}
              className="w-full"
            >
              {addLawyersMutation.isPending ? 'Uploading...' : 'Upload to Database'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected CSV Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="font-medium">Required columns:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Basic Info:</strong> lawyer_id, branch_name, allocation_month, case_id</li>
                <li><strong>Performance:</strong> cases_assigned, cases_completed, completion_rate, cases_remaining, performance_score, tat_compliance_percent, avg_tat_days</li>
                <li><strong>Quality:</strong> tat_flag (Red/Green), quality_check_flag (true/false), client_feedback_score, feedback_flag (true/false), complaints_per_case, reworks_per_case, low_performance_flag (true/false)</li>
                <li><strong>Summary:</strong> lawyer_score, quality_rating, allocation_status (Allocated/Available), total_cases_ytd</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Data will be stored in the database and available across all views.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <p className="text-sm text-muted-foreground">First {preview.length} rows from your CSV</p>
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
