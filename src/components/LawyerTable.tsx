
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
  const [sortField, setSortField] = useState<keyof Lawyer>('predictedScore');
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
      lawyer.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      lawyer.branch.toLowerCase().includes(localSearch.toLowerCase())
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
            placeholder="Search lawyers..."
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
                    onClick={() => handleSort('name')}
                  >
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('branch')}
                  >
                    Branch {sortField === 'branch' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('predictedScore')}
                  >
                    Predicted Score {sortField === 'predictedScore' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('successRate')}
                  >
                    Success Rate {sortField === 'successRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((lawyer) => (
                  <TableRow key={lawyer.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{lawyer.name}</TableCell>
                    <TableCell>{lawyer.branch}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          {(lawyer.predictedScore * 100).toFixed(1)}%
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${lawyer.predictedScore * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{(lawyer.successRate * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant={
                        lawyer.riskLevel === 'Low' ? 'default' : 
                        lawyer.riskLevel === 'Medium' ? 'secondary' : 'destructive'
                      }>
                        {lawyer.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lawyer.allocated ? 'outline' : 'default'}>
                        {lawyer.allocated ? 'Allocated' : 'Available'}
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
