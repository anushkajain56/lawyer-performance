
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Lawyer } from "@/types/lawyer";

interface DashboardOverviewProps {
  lawyers: Lawyer[];
}

export function DashboardOverview({ lawyers }: DashboardOverviewProps) {
  const avgScore = lawyers.reduce((sum, lawyer) => sum + lawyer.predictedScore, 0) / lawyers.length;
  const highPerformers = lawyers.filter(l => l.predictedScore >= 0.8).length;
  const allocated = lawyers.filter(l => l.allocated).length;
  const lowRisk = lawyers.filter(l => l.riskLevel === 'Low').length;

  const branchData = lawyers.reduce((acc, lawyer) => {
    acc[lawyer.branch] = (acc[lawyer.branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(branchData).map(([branch, count]) => ({
    branch,
    count,
    avgScore: lawyers.filter(l => l.branch === branch)
      .reduce((sum, l) => sum + l.predictedScore, 0) / count
  }));

  const riskData = [
    { name: 'Low', value: lawyers.filter(l => l.riskLevel === 'Low').length, color: '#10b981' },
    { name: 'Medium', value: lawyers.filter(l => l.riskLevel === 'Medium').length, color: '#f59e0b' },
    { name: 'High', value: lawyers.filter(l => l.riskLevel === 'High').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lawyer Performance Dashboard</h1>
        <p className="text-muted-foreground">AI-powered insights and predictions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgScore * 100).toFixed(1)}%</div>
            <Progress value={avgScore * 100} className="mt-2" />
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
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowRisk}</div>
            <p className="text-xs text-muted-foreground">
              {((lowRisk / lawyers.length) * 100).toFixed(1)}% of total
            </p>
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
                <Bar dataKey="avgScore" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {riskData.map((entry, index) => (
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
              .sort((a, b) => b.predictedScore - a.predictedScore)
              .slice(0, 5)
              .map(lawyer => (
                <div key={lawyer.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lawyer.name}</p>
                    <p className="text-sm text-muted-foreground">{lawyer.branch}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={lawyer.riskLevel === 'Low' ? 'default' : 
                                 lawyer.riskLevel === 'Medium' ? 'secondary' : 'destructive'}>
                      {lawyer.riskLevel}
                    </Badge>
                    <span className="font-bold">{(lawyer.predictedScore * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
