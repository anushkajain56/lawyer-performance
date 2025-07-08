
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LawyerTable } from "@/components/LawyerTable";
import { LawyerDetails } from "@/components/LawyerDetails";
import { FileUpload } from "@/components/FileUpload";
import { DashboardOverview } from "@/components/DashboardOverview";
import { useLawyers } from "@/hooks/useLawyers";
import { Lawyer } from "@/types/lawyer";

export default function Dashboard() {
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'table' | 'upload'>('overview');

  const { data: lawyers = [], isLoading, error } = useLawyers();

  // Initialize filtered lawyers when data loads
  useState(() => {
    if (lawyers.length > 0 && filteredLawyers.length === 0) {
      setFilteredLawyers(lawyers);
    }
  });

  const handleLawyerSelect = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
  };

  const handleFileUpload = (newLawyers: Lawyer[]) => {
    // The mutation will handle updating the data
    // The query will automatically refetch after successful upload
  };

  const handleFilterChange = (filters: any) => {
    let filtered = lawyers;
    
    if (filters.branch_name && filters.branch_name !== 'all') {
      filtered = filtered.filter(lawyer => lawyer.branch_name === filters.branch_name);
    }
    
    if (filters.tat_flag && filters.tat_flag !== 'all') {
      filtered = filtered.filter(lawyer => lawyer.tat_flag === filters.tat_flag);
    }
    
    if (filters.allocation_status && filters.allocation_status !== 'all') {
      filtered = filtered.filter(lawyer => lawyer.allocation_status === filters.allocation_status);
    }
    
    if (filters.low_performance_flag) {
      filtered = filtered.filter(lawyer => lawyer.low_performance_flag);
    }
    
    if (filters.lawyer_score_range) {
      filtered = filtered.filter(lawyer => 
        lawyer.lawyer_score >= filters.lawyer_score_range[0] && 
        lawyer.lawyer_score <= filters.lawyer_score_range[1]
      );
    }
    
    if (filters.completion_rate_range) {
      filtered = filtered.filter(lawyer => 
        lawyer.completion_rate >= filters.completion_rate_range[0] && 
        lawyer.completion_rate <= filters.completion_rate_range[1]
      );
    }
    
    if (filters.searchTerm) {
      filtered = filtered.filter(lawyer => 
        lawyer.lawyer_id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        lawyer.branch_name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredLawyers(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lawyer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          onViewChange={setActiveView} 
          activeView={activeView}
          onFilterChange={handleFilterChange}
        />
        <SidebarInset className="flex-1">
          <main className="p-6 h-full">
            {activeView === 'overview' && (
              <DashboardOverview lawyers={filteredLawyers.length > 0 ? filteredLawyers : lawyers} />
            )}
            
            {activeView === 'table' && !selectedLawyer && (
              <LawyerTable 
                lawyers={filteredLawyers.length > 0 ? filteredLawyers : lawyers} 
                onLawyerSelect={handleLawyerSelect}
              />
            )}
            
            {activeView === 'table' && selectedLawyer && (
              <LawyerDetails 
                lawyer={selectedLawyer} 
                onBack={() => setSelectedLawyer(null)}
              />
            )}
            
            {activeView === 'upload' && (
              <FileUpload onFileUpload={handleFileUpload} />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
