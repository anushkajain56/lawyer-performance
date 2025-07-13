
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowLeft } from "lucide-react";
import { Lawyer } from "@/types/lawyer";

interface LawyerDetailsProps {
  lawyer: Lawyer;
  onBack: () => void;
}

export function LawyerDetails({ lawyer, onBack }: LawyerDetailsProps) {
  // Calculate correct cases remaining
  const correctCasesRemaining = lawyer.cases_assigned - lawyer.cases_completed;

  const featureImportance = [
    { 
      feature: 'Cases Completed', 
      value: lawyer.cases_completed, 
      importance: lawyer.completion_rate,
      color: 'var(--chart-primary)', 
      category: 'Productivity'
    },
    { 
      feature: 'Performance Score', 
      value: lawyer.performance_score * 100, 
      importance: lawyer.performance_score,
      color: 'var(--chart-secondary)', 
      category: 'Overall'
    },
    { 
      feature: 'TAT Compliance', 
      value: lawyer.tat_compliance_percent, 
      importance: lawyer.tat_compliance_percent / 100,
      color: 'var(--chart-accent)', 
      category: 'Efficiency'
    },
    { 
      feature: 'Client Feedback', 
      value: lawyer.client_feedback_score * 20, 
      importance: lawyer.client_feedback_score / 5,
      color: 'var(--chart-tertiary)', 
      category: 'Quality'
    },
    { 
      feature: 'Quality Rating', 
      value: lawyer.quality_rating * 20, 
      importance: lawyer.quality_rating / 5,
      color: 'var(--chart-quaternary)', 
      category: 'Quality'
    },
  ];

  const performanceMetrics = [
    { label: 'Cases Assigned', value: lawyer.cases_assigned, unit: '' },
    { label: 'Cases Completed', value: lawyer.cases_completed, unit: '' },
    { label: 'Completion Rate', value: (lawyer.completion_rate * 100).toFixed(1), unit: '%' },
    { label: 'Cases Remaining', value: correctCasesRemaining, unit: '' },
    { label: 'Total Cases YTD', value: lawyer.total_cases_ytd, unit: '' },
    { label: 'Avg TAT Days', value: lawyer.avg_tat_days.toFixed(1), unit: ' days' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl min-w-[220px]">
          <p className="font-semibold text-foreground mb-3 text-base">{data.feature}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Category:</span>
              <Badge variant="secondary" className="text-xs">
                {data.category}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Value:</span>
              <span className="font-medium text-foreground">
                {typeof data.value === 'number' ? data.value.toFixed(1) : data.value}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score Impact:</span>
              <span className="font-medium text-foreground">
                {(data.importance * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Performance Level:</span>
              <span className={`text-xs font-medium ${
                data.importance >= 0.8 ? 'text-green-600' : 
                data.importance >= 0.6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {data.importance >= 0.8 ? 'Excellent' : 
                 data.importance >= 0.6 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ x, y, width, height, value }: any) => {
    return (
      <text 
        x={x + width / 2} 
        y={y - 8} 
        fill="hsl(var(--foreground))" 
        textAnchor="middle" 
        dy={-6}
        className="text-xs font-medium"
      >
        {typeof value === 'number' ? value.toFixed(0) : value}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Table
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {lawyer.lawyer_name || lawyer.lawyer_id} ({lawyer.lawyer_id})
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
            <div className="text-4xl font-bold text-primary">
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
                  <div className="text-2xl font-bold text-primary">
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
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
            <div>
              <CardTitle className="text-xl">Performance Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Detailed analysis of key performance indicators contributing to overall lawyer score
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={featureImportance} 
              margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              barCategoryGap="20%"
            >
              <defs>
                {featureImportance.map((item, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={item.color} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={item.color} stopOpacity={0.6}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.4}
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                dataKey="feature" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                angle={-15}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: 'Performance Value', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                label={<CustomLabel />}
              >
                {featureImportance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {featureImportance.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.feature} ({item.category})
                </span>
              </div>
            ))}
          </div>
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
              <span className="font-medium">{lawyer.tat_compliance_percent.toFixed(1)}%</span>
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
                <span className="text-sm font-medium">{lawyer.tat_compliance_percent.toFixed(1)}%</span>
              </div>
              <Progress value={lawyer.tat_compliance_percent} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
