
import { useState, useEffect } from "react";
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
  useEffect(() => {
    if (lawyers.length > 0) {
      setFilteredLawyers(lawyers);
    }
  }, [lawyers]);

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
    
    if (filters.domain && filters.domain !== 'all') {
      filtered = filtered.filter(lawyer => lawyer.domain === filters.domain);
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
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(lawyer => 
        (lawyer.lawyer_name && lawyer.lawyer_name.toLowerCase().includes(searchLower)) ||
        lawyer.lawyer_id.toLowerCase().includes(searchLower) ||
        lawyer.branch_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLawyers(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border shadow-2xl">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-primary/5 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Loading Dashboard</h3>
          <p className="text-muted-foreground">Fetching lawyer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5">
        <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-destructive/20 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <div className="w-8 h-8 text-destructive">⚠</div>
          </div>
          <h3 className="text-xl font-semibold text-destructive mb-2">Connection Error</h3>
          <p className="text-muted-foreground mb-6">Error loading data: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/10">
        <AppSidebar 
          onViewChange={setActiveView} 
          activeView={activeView}
          onFilterChange={handleFilterChange}
          lawyers={lawyers}
        />
        <SidebarInset className="flex-1">
          <main className="p-6 h-full">
            <div className="animate-fade-in">
              {activeView === 'overview' && (
                <DashboardOverview lawyers={filteredLawyers} />
              )}
              
              {activeView === 'table' && !selectedLawyer && (
                <LawyerTable 
                  lawyers={filteredLawyers} 
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
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
