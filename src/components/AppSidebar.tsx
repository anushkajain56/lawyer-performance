
import { useState } from "react";
import { ChevronDown, Upload, Table, Filter } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { branches } from "@/data/mockData";

interface AppSidebarProps {
  onViewChange: (view: 'overview' | 'table' | 'upload') => void;
  activeView: string;
  onFilterChange: (filters: any) => void;
}

export function AppSidebar({ onViewChange, activeView, onFilterChange }: AppSidebarProps) {
  const [filters, setFilters] = useState({
    branch_name: 'all',
    low_performance_flag: false,
    searchTerm: '',
    tat_flag: 'all',
    allocation_status: 'all',
    lawyer_score_range: [0, 1],
    completion_rate_range: [0, 1]
  });

  const handleFilterUpdate = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const menuItems = [
    { title: "Dashboard", icon: ChevronDown, view: 'overview' as const },
    { title: "Lawyer Table", icon: Table, view: 'table' as const },
    { title: "Upload Data", icon: Upload, view: 'upload' as const },
  ];

  return (
    <Sidebar className="w-80 bg-background border-r">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold">Lawyer Performance AI</h2>
        <p className="text-sm text-muted-foreground">Performance Analytics</p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.view)}
                    isActive={activeView === item.view}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-6 p-4">
            <div>
              <Label htmlFor="search">Search Lawyers</Label>
              <Input
                id="search"
                placeholder="Lawyer ID or branch..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterUpdate('searchTerm', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select 
                value={filters.branch_name} 
                onValueChange={(value) => handleFilterUpdate('branch_name', value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tatFlag">TAT Flag</Label>
              <Select 
                value={filters.tat_flag} 
                onValueChange={(value) => handleFilterUpdate('tat_flag', value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select TAT status" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All TAT Status</SelectItem>
                  <SelectItem value="Green">Green</SelectItem>
                  <SelectItem value="Red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="allocationStatus">Allocation Status</Label>
              <Select 
                value={filters.allocation_status} 
                onValueChange={(value) => handleFilterUpdate('allocation_status', value)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select allocation status" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Allocated">Allocated</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lawyerScore">Lawyer Score Range</Label>
              <div className="px-2 py-4">
                <Slider
                  id="lawyerScore"
                  min={0}
                  max={1}
                  step={0.01}
                  value={filters.lawyer_score_range}
                  onValueChange={(value) => handleFilterUpdate('lawyer_score_range', value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{(filters.lawyer_score_range[0] * 100).toFixed(0)}%</span>
                  <span>{(filters.lawyer_score_range[1] * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="completionRate">Completion Rate Range</Label>
              <div className="px-2 py-4">
                <Slider
                  id="completionRate"
                  min={0}
                  max={1}
                  step={0.01}
                  value={filters.completion_rate_range}
                  onValueChange={(value) => handleFilterUpdate('completion_rate_range', value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{(filters.completion_rate_range[0] * 100).toFixed(0)}%</span>
                  <span>{(filters.completion_rate_range[1] * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowPerf"
                checked={filters.low_performance_flag}
                onCheckedChange={(checked) => handleFilterUpdate('low_performance_flag', checked)}
              />
              <Label htmlFor="lowPerf">Show Low Performance Only</Label>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
