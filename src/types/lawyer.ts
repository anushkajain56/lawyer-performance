
export interface Lawyer {
  id: string;
  name: string;
  branch: string;
  experience: number;
  casesCompleted: number;
  successRate: number;
  avgCaseValue: number;
  clientSatisfaction: number;
  certifications: number;
  hoursWorked: number;
  predictedScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  allocated: boolean;
  lastUpdated: string;
}

export interface FilterState {
  branch: string;
  lowPerformance: boolean;
  searchTerm: string;
}
