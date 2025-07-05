
import { Lawyer } from "@/types/lawyer";

export const mockLawyers: Lawyer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    branch: "Corporate",
    experience: 8,
    casesCompleted: 145,
    successRate: 0.87,
    avgCaseValue: 250000,
    clientSatisfaction: 4.8,
    certifications: 3,
    hoursWorked: 2100,
    predictedScore: 0.89,
    riskLevel: "Low",
    allocated: true,
    lastUpdated: "2024-01-15"
  },
  {
    id: "2",
    name: "Michael Chen",
    branch: "Criminal",
    experience: 12,
    casesCompleted: 203,
    successRate: 0.82,
    avgCaseValue: 75000,
    clientSatisfaction: 4.6,
    certifications: 5,
    hoursWorked: 2300,
    predictedScore: 0.85,
    riskLevel: "Low",
    allocated: false,
    lastUpdated: "2024-01-14"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    branch: "Family",
    experience: 5,
    casesCompleted: 89,
    successRate: 0.78,
    avgCaseValue: 45000,
    clientSatisfaction: 4.4,
    certifications: 2,
    hoursWorked: 1800,
    predictedScore: 0.72,
    riskLevel: "Medium",
    allocated: true,
    lastUpdated: "2024-01-13"
  },
  {
    id: "4",
    name: "David Thompson",
    branch: "Corporate",
    experience: 15,
    casesCompleted: 267,
    successRate: 0.91,
    avgCaseValue: 320000,
    clientSatisfaction: 4.9,
    certifications: 7,
    hoursWorked: 2400,
    predictedScore: 0.94,
    riskLevel: "Low",
    allocated: false,
    lastUpdated: "2024-01-12"
  },
  {
    id: "5",
    name: "Lisa Park",
    branch: "Immigration",
    experience: 6,
    casesCompleted: 124,
    successRate: 0.75,
    avgCaseValue: 15000,
    clientSatisfaction: 4.2,
    certifications: 2,
    hoursWorked: 1900,
    predictedScore: 0.68,
    riskLevel: "High",
    allocated: true,
    lastUpdated: "2024-01-11"
  },
  {
    id: "6",
    name: "Robert Williams",
    branch: "Criminal",
    experience: 10,
    casesCompleted: 178,
    successRate: 0.84,
    avgCaseValue: 95000,
    clientSatisfaction: 4.7,
    certifications: 4,
    hoursWorked: 2200,
    predictedScore: 0.81,
    riskLevel: "Low",
    allocated: false,
    lastUpdated: "2024-01-10"
  }
];

export const branches = ["Corporate", "Criminal", "Family", "Immigration", "Intellectual Property"];
