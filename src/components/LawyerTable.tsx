import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Lawyer } from "@/types/lawyer";
import { useClearLawyers } from "@/hooks/useLawyers";

interface LawyerTableProps {
  lawyers: Lawyer[];
  onLawyerSelect: (lawyer: Lawyer) => void;
}

export function LawyerTable({ lawyers, onLawyerSelect }: LawyerTableProps) {
  const [sortField, setSortField] = useState<keyof Lawyer>('lawyer_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [localSearch, setLocalSearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearLawyersMutation = useClearLawyers();

  const handleSort = (field: keyof Lawyer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleClearTable = () => {
    if (showClearConfirm) {
      clearLawyersMutation.mutate();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const filteredAndSorted = lawyers
    .filter(lawyer => {
      const searchLower = localSearch.toLowerCase();
      return (
        (lawyer.lawyer_name && lawyer.lawyer_name.toLowerCase().includes(searchLower)) ||
        lawyer.lawyer_id.toLowerCase().includes(searchLower) ||
        lawyer.branch_name.toLowerCase().includes(searchLower) ||
        (lawyer.expertise_domains && lawyer.expertise_domains.toLowerCase().includes(searchLower))
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

  // Helper function to format expertise domains
  const formatExpertiseDomains = (domains: string | undefined) => {
    if (!domains || domains.trim() === '' || domains === 'undefined') {
      return <span className="text-muted-foreground">Not specified</span>;
    }
    
    // Split by comma and create badges for each domain
    const domainList = domains.split(',').map(domain => domain.trim()).filter(domain => domain && domain !== 'undefined');
    
    if (domainList.length === 0) {
      return <span className="text-muted-foreground">Not specified</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {domainList.map((domain, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {domain}
          </Badge>
        ))}
      </div>
    );
  };

  // Helper function to format lawyer name
  const formatLawyerName = (name: string | undefined) => {
    if (!name || name.trim() === '' || name === 'undefined') {
      return <span className="text-muted-foreground">Unknown Lawyer</span>;
    }
    return name;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lawyer Performance Table</h1>
          <p className="text-muted-foreground">Click on any lawyer to view detailed metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-72">
            <Input
              placeholder="Search lawyers by name, ID, location, or expertise..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          {lawyers.length > 0 && (
            <Button
              variant={showClearConfirm ? "destructive" : "outline"}
              onClick={handleClearTable}
              disabled={clearLawyersMutation.isPending}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {clearLawyersMutation.isPending
                ? "Clearing..."
                : showClearConfirm
                ? "Confirm Clear"
                : "Clear All"
              }
            </Button>
          )}
        </div>
      </div>

      {showClearConfirm && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive font-medium">
            Are you sure you want to clear all lawyer data? This action cannot be undone.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Click "Confirm Clear" again to proceed, or wait 3 seconds to cancel.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Lawyers ({filteredAndSorted.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No lawyer data available.</p>
              <p className="text-sm mt-1">Upload a CSV file to get started.</p>
            </div>
          ) : (
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
                      onClick={() => handleSort('expertise_domains')}
                    >
                      Expertise Domains {sortField === 'expertise_domains' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {formatLawyerName(lawyer.lawyer_name)}
                      </TableCell>
                      <TableCell>{lawyer.lawyer_id}</TableCell>
                      <TableCell>{lawyer.branch_name}</TableCell>
                      <TableCell>
                        {formatExpertiseDomains(lawyer.expertise_domains)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
