
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
import { branches } from "@/data/mockData";

interface AppSidebarProps {
  onViewChange: (view: 'overview' | 'table' | 'upload') => void;
  activeView: string;
  onFilterChange: (filters: any) => void;
}

export function AppSidebar({ onViewChange, activeView, onFilterChange }: AppSidebarProps) {
  const [filters, setFilters] = useState({
    branch: 'all',
    lowPerformance: false,
    searchTerm: ''
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
    <Sidebar className="w-80">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Lawyer Performance AI</h2>
        <p className="text-sm text-muted-foreground">Predict & Allocate</p>
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
          <SidebarGroupContent className="space-y-4 p-4">
            <div>
              <Label htmlFor="search">Search Lawyers</Label>
              <Input
                id="search"
                placeholder="Name or branch..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterUpdate('searchTerm', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select 
                value={filters.branch} 
                onValueChange={(value) => handleFilterUpdate('branch', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowPerf"
                checked={filters.lowPerformance}
                onCheckedChange={(checked) => handleFilterUpdate('lowPerformance', checked)}
              />
              <Label htmlFor="lowPerf">Show Low Performance Only</Label>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
