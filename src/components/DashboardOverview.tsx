
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line, LineChart } from "recharts";
import { Lawyer } from "@/types/lawyer";

interface DashboardOverviewProps {
  lawyers: Lawyer[];
}

export function DashboardOverview({ lawyers }: DashboardOverviewProps) {
  const avgLawyerScore = lawyers.reduce((sum, lawyer) => sum + lawyer.lawyer_score, 0) / lawyers.length;
  const highPerformers = lawyers.filter(l => l.lawyer_score >= 0.8).length;
  const allocated = lawyers.filter(l => l.allocation_status === 'Allocated').length;
  const lowPerformance = lawyers.filter(l => l.low_performance_flag).length;
  const avgCompletionRate = lawyers.reduce((sum, lawyer) => sum + lawyer.completion_rate, 0) / lawyers.length;

  const branchData = lawyers.reduce((acc, lawyer) => {
    acc[lawyer.branch_name] = (acc[lawyer.branch_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(branchData).map(([branch, count]) => ({
    branch: branch.length > 15 ? branch.substring(0, 15) + '...' : branch,
    fullBranch: branch,
    count,
    avgScore: Math.round((lawyers.filter(l => l.branch_name === branch)
      .reduce((sum, l) => sum + l.lawyer_score, 0) / count) * 100),
    avgCompletionRate: Math.round((lawyers.filter(l => l.branch_name === branch)
      .reduce((sum, l) => sum + l.completion_rate, 0) / count) * 100),
    highPerformers: lawyers.filter(l => l.branch_name === branch && l.lawyer_score >= 0.8).length
  })).sort((a, b) => b.avgScore - a.avgScore);

  const tatData = [
    { name: 'Green', value: lawyers.filter(l => l.tat_flag === 'Green').length, color: '#10b981' },
    { name: 'Red', value: lawyers.filter(l => l.tat_flag === 'Red').length, color: '#ef4444' },
  ];

  const performanceData = [
    { name: 'Normal', value: lawyers.filter(l => !l.low_performance_flag).length, color: '#3b82f6' },
    { name: 'Low Performance', value: lowPerformance, color: '#ef4444' },
  ];

  const renderTatLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
              <span className="font-medium">{entry.value}:</span> {' '}
              {entry.value === 'Green' ? 'Meeting TAT deadlines' : 'Missing TAT deadlines'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="font-semibold text-foreground mb-3">{data.fullBranch}</p>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-2"></span>
              Performance Score (%): <span className="font-medium text-foreground ml-1">{data.avgScore}%</span>
            </p>
            <p className="text-muted-foreground flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mr-2"></span>
              Completion Rate (%): <span className="font-medium text-foreground ml-1">{data.avgCompletionRate}%</span>
            </p>
            <p className="text-muted-foreground mt-3">
              Total Lawyers: <span className="font-medium text-foreground">{data.count}</span>
            </p>
            <p className="text-muted-foreground">
              High Performers: <span className="font-medium text-foreground">{data.highPerformers}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lawyer Performance Dashboard</h1>
        <p className="text-muted-foreground">Real-time performance metrics and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Lawyer Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgLawyerScore * 100).toFixed(1)}%</div>
            <Progress value={avgLawyerScore * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPerformers}</div>
            <p className="text-xs text-muted-foreground">
              {((highPerformers / lawyers.length) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocated}</div>
            <p className="text-xs text-muted-foreground">
              {lawyers.length - allocated} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgCompletionRate * 100).toFixed(1)}%</div>
            <Progress value={avgCompletionRate * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              Performance by Branch
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Comprehensive branch performance analysis with lawyer scores and completion rates
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData} margin={{ top: 20, right: 40, left: 40, bottom: 60 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="branch" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  label={{ 
                    value: 'Performance Score (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                    offset: 10
                  }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  label={{ 
                    value: 'Completion Rate (%)', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { textAnchor: 'middle' },
                    offset: 10
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  yAxisId="left"
                  dataKey="avgScore" 
                  fill="url(#scoreGradient)" 
                  name="Avg Lawyer Score"
                  radius={[4, 4, 0, 0]}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgCompletionRate" 
                  stroke="url(#completionGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TAT Compliance Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Turn Around Time (TAT) compliance status across all lawyers
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tatData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {tatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend content={renderTatLegend} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lawyers
              .sort((a, b) => b.lawyer_score - a.lawyer_score)
              .slice(0, 5)
              .map(lawyer => (
                <div key={lawyer.lawyer_id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lawyer.lawyer_id}</p>
                    <p className="text-sm text-muted-foreground">{lawyer.branch_name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={lawyer.tat_flag === 'Green' ? 'default' : 'destructive'}>
                      {lawyer.tat_flag} TAT
                    </Badge>
                    {lawyer.low_performance_flag && (
                      <Badge variant="destructive">Low Perf</Badge>
                    )}
                    <span className="font-bold">{(lawyer.lawyer_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
