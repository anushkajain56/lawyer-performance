
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft } from "lucide-react";
import { Lawyer } from "@/types/lawyer";

interface LawyerDetailsProps {
  lawyer: Lawyer;
  onBack: () => void;
}

export function LawyerDetails({ lawyer, onBack }: LawyerDetailsProps) {
  const featureImportance = [
    { feature: 'Experience', value: lawyer.experience * 5, importance: 0.25 },
    { feature: 'Success Rate', value: lawyer.successRate * 100, importance: 0.30 },
    { feature: 'Case Value', value: lawyer.avgCaseValue / 1000, importance: 0.20 },
    { feature: 'Client Satisfaction', value: lawyer.clientSatisfaction * 20, importance: 0.15 },
    { feature: 'Certifications', value: lawyer.certifications * 10, importance: 0.10 },
  ];

  const performanceMetrics = [
    { label: 'Cases Completed', value: lawyer.casesCompleted, unit: '' },
    { label: 'Success Rate', value: (lawyer.successRate * 100).toFixed(1), unit: '%' },
    { label: 'Avg Case Value', value: `$${(lawyer.avgCaseValue / 1000).toFixed(0)}`, unit: 'K' },
    { label: 'Client Satisfaction', value: lawyer.clientSatisfaction.toFixed(1), unit: '/5' },
    { label: 'Hours Worked', value: lawyer.hoursWorked.toLocaleString(), unit: '' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Table
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{lawyer.name}</h1>
          <p className="text-muted-foreground">{lawyer.branch} Law • {lawyer.experience} years experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>AI Prediction Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">
              {(lawyer.predictedScore * 100).toFixed(1)}%
            </div>
            <Progress value={lawyer.predictedScore * 100} className="w-full" />
            <div className="flex justify-center">
              <Badge variant={
                lawyer.riskLevel === 'Low' ? 'default' : 
                lawyer.riskLevel === 'Medium' ? 'secondary' : 'destructive'
              } className="text-sm">
                {lawyer.riskLevel} Risk
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Status: {lawyer.allocated ? 'Currently Allocated' : 'Available for Assignment'}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {performanceMetrics.map(metric => (
                <div key={metric.label} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metric.value}{metric.unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Importance Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Factors contributing to the AI prediction score
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'importance' ? `${(value as number * 100).toFixed(1)}%` : value,
                  name === 'importance' ? 'Importance' : 'Value'
                ]}
              />
              <Bar dataKey="value" fill="#3b82f6" name="Current Value" />
              <Bar dataKey="importance" fill="#10b981" name="Feature Weight" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Years of Experience:</span>
              <span className="font-medium">{lawyer.experience} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Specialization:</span>
              <span className="font-medium">{lawyer.branch} Law</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Certifications:</span>
              <span className="font-medium">{lawyer.certifications}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium">{lawyer.lastUpdated}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Success Rate</span>
                <span className="text-sm font-medium">{(lawyer.successRate * 100).toFixed(1)}%</span>
              </div>
              <Progress value={lawyer.successRate * 100} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Client Satisfaction</span>
                <span className="text-sm font-medium">{lawyer.clientSatisfaction}/5.0</span>
              </div>
              <Progress value={(lawyer.clientSatisfaction / 5) * 100} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Workload (Hours/Year)</span>
                <span className="text-sm font-medium">{lawyer.hoursWorked.toLocaleString()}</span>
              </div>
              <Progress value={(lawyer.hoursWorked / 2500) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
