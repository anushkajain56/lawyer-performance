
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lawyer } from "@/types/lawyer";

interface LawyerTableProps {
  lawyers: Lawyer[];
  onLawyerSelect: (lawyer: Lawyer) => void;
}

export function LawyerTable({ lawyers, onLawyerSelect }: LawyerTableProps) {
  const [sortField, setSortField] = useState<keyof Lawyer>('lawyer_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [localSearch, setLocalSearch] = useState('');

  const handleSort = (field: keyof Lawyer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSorted = lawyers
    .filter(lawyer => 
      lawyer.lawyer_id.toLowerCase().includes(localSearch.toLowerCase()) ||
      lawyer.branch_name.toLowerCase().includes(localSearch.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lawyer Performance Table</h1>
          <p className="text-muted-foreground">Click on any lawyer to view detailed metrics</p>
        </div>
        <div className="w-72">
          <Input
            placeholder="Search lawyers by ID or branch..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Lawyers ({filteredAndSorted.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('lawyer_id')}
                  >
                    Lawyer ID {sortField === 'lawyer_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('branch_name')}
                  >
                    Branch {sortField === 'branch_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('lawyer_score')}
                  >
                    Lawyer Score {sortField === 'lawyer_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('completion_rate')}
                  >
                    Completion Rate {sortField === 'completion_rate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>TAT Flag</TableHead>
                  <TableHead>Performance Flag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((lawyer) => (
                  <TableRow 
                    key={lawyer.lawyer_id} 
                    className={`hover:bg-muted/50 ${lawyer.low_performance_flag ? 'bg-red-50 border-red-200' : ''}`}
                  >
                    <TableCell className="font-medium">{lawyer.lawyer_id}</TableCell>
                    <TableCell>{lawyer.branch_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          {(lawyer.lawyer_score * 100).toFixed(1)}%
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${lawyer.lawyer_score * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{(lawyer.completion_rate * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant={lawyer.tat_flag === 'Green' ? 'default' : 'destructive'}>
                        {lawyer.tat_flag}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lawyer.low_performance_flag && (
                        <Badge variant="destructive">Low Performance</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lawyer.allocation_status === 'Allocated' ? 'outline' : 'default'}>
                        {lawyer.allocation_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLawyerSelect(lawyer)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
