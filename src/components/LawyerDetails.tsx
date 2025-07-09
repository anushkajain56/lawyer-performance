
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
    { feature: 'Cases Completed', value: lawyer.cases_completed, importance: lawyer.completion_rate },
    { feature: 'Performance Score', value: lawyer.performance_score * 100, importance: lawyer.performance_score },
    { feature: 'TAT Compliance', value: lawyer.tat_compliance_percent * 100, importance: lawyer.tat_compliance_percent },
    { feature: 'Client Feedback', value: lawyer.client_feedback_score * 20, importance: lawyer.client_feedback_score / 5 },
    { feature: 'Quality Rating', value: lawyer.quality_rating * 20, importance: lawyer.quality_rating / 5 },
  ];

  const performanceMetrics = [
    { label: 'Cases Assigned', value: lawyer.cases_assigned, unit: '' },
    { label: 'Cases Completed', value: lawyer.cases_completed, unit: '' },
    { label: 'Completion Rate', value: (lawyer.completion_rate * 100).toFixed(1), unit: '%' },
    { label: 'Cases Remaining', value: lawyer.cases_remaining, unit: '' },
    { label: 'Total Cases YTD', value: lawyer.total_cases_ytd, unit: '' },
    { label: 'Avg TAT Days', value: lawyer.avg_tat_days.toFixed(1), unit: ' days' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Table
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {lawyer.lawyer_name || lawyer.lawyer_id}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <span>{lawyer.branch_name}</span>
            <span>•</span>
            <span>Allocation Month: {lawyer.allocation_month}</span>
            {lawyer.expertise_domains && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-1">
                  {lawyer.expertise_domains.split(',').map((domain, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {domain.trim()}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Lawyer Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">
              {(lawyer.lawyer_score * 100).toFixed(1)}%
            </div>
            <Progress value={lawyer.lawyer_score * 100} className="w-full" />
            <div className="flex flex-col space-y-2">
              <Badge variant={lawyer.tat_flag === 'Green' ? 'default' : 'destructive'}>
                TAT: {lawyer.tat_flag}
              </Badge>
              {lawyer.low_performance_flag && (
                <Badge variant="destructive">Low Performance Flag</Badge>
              )}
              {lawyer.quality_check_flag && (
                <Badge variant="default">Quality Check Passed</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Status: {lawyer.allocation_status}
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
          <CardTitle>Performance Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            Key metrics contributing to the lawyer score
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
                  name === 'importance' ? 'Score' : 'Value'
                ]}
              />
              <Bar dataKey="value" fill="#3b82f6" name="Current Value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality & Risk Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">TAT Compliance:</span>
              <span className="font-medium">{(lawyer.tat_compliance_percent * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client Feedback Score:</span>
              <span className="font-medium">{lawyer.client_feedback_score.toFixed(1)}/5.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quality Rating:</span>
              <span className="font-medium">{lawyer.quality_rating.toFixed(1)}/5.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complaints per Case:</span>
              <span className="font-medium">{lawyer.complaints_per_case.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reworks per Case:</span>
              <span className="font-medium">{lawyer.reworks_per_case.toFixed(3)}</span>
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
                <span className="text-sm">Completion Rate</span>
                <span className="text-sm font-medium">{(lawyer.completion_rate * 100).toFixed(1)}%</span>
              </div>
              <Progress value={lawyer.completion_rate * 100} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Performance Score</span>
                <span className="text-sm font-medium">{(lawyer.performance_score * 100).toFixed(1)}%</span>
              </div>
              <Progress value={lawyer.performance_score * 100} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">TAT Compliance</span>
                <span className="text-sm font-medium">{(lawyer.tat_compliance_percent * 100).toFixed(1)}%</span>
              </div>
              <Progress value={lawyer.tat_compliance_percent * 100} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
