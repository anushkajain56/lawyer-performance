import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
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
    branch,
    count,
    avgScore: lawyers.filter(l => l.branch_name === branch)
      .reduce((sum, l) => sum + l.lawyer_score, 0) / count,
    avgCompletionRate: lawyers.filter(l => l.branch_name === branch)
      .reduce((sum, l) => sum + l.completion_rate, 0) / count
  }));

  const tatData = [
    { name: 'Green', value: lawyers.filter(l => l.tat_flag === 'Green').length, color: '#10b981' },
    { name: 'Red', value: lawyers.filter(l => l.tat_flag === 'Red').length, color: '#ef4444' },
  ];

  const performanceData = [
    { name: 'Normal', value: lawyers.filter(l => !l.low_performance_flag).length, color: '#3b82f6' },
    { name: 'Low Performance', value: lowPerformance, color: '#ef4444' },
  ];

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
        <Card>
          <CardHeader>
            <CardTitle>Performance by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Lawyer Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TAT Compliance Distribution</CardTitle>
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
