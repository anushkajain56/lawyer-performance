
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Lawyer } from "@/types/lawyer";

interface FileUploadProps {
  onFileUpload: (lawyers: Lawyer[]) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Lawyer[]>([]);
  const { toast } = useToast();

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
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Parse first few rows for preview
      const previewData: Lawyer[] = lines.slice(1, 6).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        return {
          id: `preview-${index}`,
          name: values[0] || `Lawyer ${index + 1}`,
          branch: values[1] || 'Corporate',
          experience: parseInt(values[2]) || 5,
          casesCompleted: parseInt(values[3]) || 100,
          successRate: parseFloat(values[4]) || 0.8,
          avgCaseValue: parseInt(values[5]) || 50000,
          clientSatisfaction: parseFloat(values[6]) || 4.5,
          certifications: parseInt(values[7]) || 2,
          hoursWorked: parseInt(values[8]) || 2000,
          predictedScore: Math.random() * 0.3 + 0.7, // Mock prediction
          riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
          allocated: Math.random() > 0.5,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }).filter(lawyer => lawyer.name && lawyer.name !== '');
      
      setPreview(previewData);
    };
    reader.readAsText(file);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call your backend API
      const processedLawyers: Lawyer[] = preview.map((lawyer, index) => ({
        ...lawyer,
        id: `uploaded-${Date.now()}-${index}`,
        predictedScore: Math.random() * 0.4 + 0.6, // Mock ML prediction
        lastUpdated: new Date().toISOString().split('T')[0]
      }));

      onFileUpload(processedLawyers);
      
      toast({
        title: "Upload successful",
        description: `Processed ${processedLawyers.length} lawyer records with AI predictions.`,
      });

      setFile(null);
      setPreview([]);
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Lawyer Data</h1>
        <p className="text-muted-foreground">Upload a CSV file to get AI predictions for lawyer performance</p>
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
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Upload & Predict'}
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
              <ul className="list-disc pl-5 space-y-1">
                <li>name - Lawyer's full name</li>
                <li>branch - Legal specialization</li>
                <li>experience - Years of experience</li>
                <li>casesCompleted - Total cases handled</li>
                <li>successRate - Success rate (0.0-1.0)</li>
                <li>avgCaseValue - Average case value ($)</li>
                <li>clientSatisfaction - Rating (1.0-5.0)</li>
                <li>certifications - Number of certifications</li>
                <li>hoursWorked - Annual hours worked</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                The AI model will automatically predict performance scores and risk levels based on these features.
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
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Branch</th>
                    <th className="text-left p-2">Experience</th>
                    <th className="text-left p-2">Cases</th>
                    <th className="text-left p-2">Success Rate</th>
                    <th className="text-left p-2">Predicted Score</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((lawyer) => (
                    <tr key={lawyer.id} className="border-b">
                      <td className="p-2 font-medium">{lawyer.name}</td>
                      <td className="p-2">{lawyer.branch}</td>
                      <td className="p-2">{lawyer.experience}</td>
                      <td className="p-2">{lawyer.casesCompleted}</td>
                      <td className="p-2">{(lawyer.successRate * 100).toFixed(1)}%</td>
                      <td className="p-2 font-bold text-blue-600">
                        {(lawyer.predictedScore * 100).toFixed(1)}%
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
