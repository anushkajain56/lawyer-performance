
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
    .filter(lawyer => {
      const searchLower = localSearch.toLowerCase();
      return (
        (lawyer.lawyer_name && lawyer.lawyer_name.toLowerCase().includes(searchLower)) ||
        lawyer.lawyer_id.toLowerCase().includes(searchLower) ||
        lawyer.branch_name.toLowerCase().includes(searchLower) ||
        (lawyer.domain && lawyer.domain.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
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
            placeholder="Search lawyers by name, ID, location, or domain..."
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
                    onClick={() => handleSort('lawyer_name')}
                  >
                    Lawyer Name {sortField === 'lawyer_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
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
                    Location {sortField === 'branch_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('domain')}
                  >
                    Domain {sortField === 'domain' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('allocation_status')}
                  >
                    Status {sortField === 'allocation_status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('lawyer_score')}
                  >
                    Lawyer Score {sortField === 'lawyer_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((lawyer) => (
                  <TableRow 
                    key={lawyer.lawyer_id} 
                    className={`hover:bg-muted/50 ${lawyer.low_performance_flag ? 'bg-red-50 border-red-200' : ''}`}
                  >
                    <TableCell className="font-medium">
                      {lawyer.lawyer_name || 'N/A'}
                    </TableCell>
                    <TableCell>{lawyer.lawyer_id}</TableCell>
                    <TableCell>{lawyer.branch_name}</TableCell>
                    <TableCell>
                      {lawyer.domain ? (
                        <Badge variant="outline">{lawyer.domain}</Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lawyer.allocation_status === 'Allocated' ? 'default' : 'outline'}>
                        {lawyer.allocation_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          {(lawyer.lawyer_score * 100).toFixed(1)}%
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              lawyer.lawyer_score >= 0.8 ? 'bg-green-600' :
                              lawyer.lawyer_score >= 0.6 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${lawyer.lawyer_score * 100}%` }}
                          />
                        </div>
                      </div>
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
