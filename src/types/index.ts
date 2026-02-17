export interface Student {
  id: string;
  classe: string;
  noms: string;
  prenoms: string;
  sexe: 'M' | 'F';
  moyenne: number;
  performanceLevel: PerformanceLevel;
  suggestions: StudentSuggestions;
  rank?: number;
  classRank?: number;
}

export type PerformanceLevel = 'Excellent' | 'Bien' | 'Moyen' | 'Besoin de soutien';

export interface StudentSuggestions {
  performanceLevel: PerformanceLevel;
  learningAdvice: string;
  studyMethods: string[];
  teacherRecommendation: string;
}

export interface ClassStats {
  classe: string;
  totalStudents: number;
  averageGrade: number;
  maleCount: number;
  femaleCount: number;
  excellentCount: number;
  goodCount: number;
  averageCount: number;
  needsSupportCount: number;
  topStudent?: Student;
  strugglingStudents: Student[];
}

export interface GlobalStats {
  totalStudents: number;
  totalClasses: number;
  globalAverage: number;
  maleCount: number;
  femaleCount: number;
  maleAverage: number;
  femaleAverage: number;
  performanceDistribution: {
    excellent: number;
    good: number;
    average: number;
    needsSupport: number;
  };
  gradeDistribution: {
    range: string;
    count: number;
  }[];
}

export interface PivotData {
  byClasse: ClassStats[];
  bySexe: {
    sexe: string;
    count: number;
    average: number;
  }[];
  global: GlobalStats;
}

export type Page = 'upload' | 'dashboard' | 'students' | 'reports';
