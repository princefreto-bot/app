import type { Student, ClassStats, GlobalStats, PivotData } from '../types';

export function calculateAnalytics(students: Student[]): PivotData {
  // Group by class
  const classeGroups = new Map<string, Student[]>();
  students.forEach(s => {
    if (!classeGroups.has(s.classe)) {
      classeGroups.set(s.classe, []);
    }
    classeGroups.get(s.classe)!.push(s);
  });

  // Calculate class stats
  const byClasse: ClassStats[] = Array.from(classeGroups.entries()).map(([classe, classStudents]) => {
    const sorted = [...classStudents].sort((a, b) => b.moyenne - a.moyenne);
    const totalStudents = classStudents.length;
    const averageGrade = classStudents.reduce((sum, s) => sum + s.moyenne, 0) / totalStudents;
    const maleStudents = classStudents.filter(s => s.sexe === 'M');
    const femaleStudents = classStudents.filter(s => s.sexe === 'F');

    return {
      classe,
      totalStudents,
      averageGrade: Math.round(averageGrade * 100) / 100,
      maleCount: maleStudents.length,
      femaleCount: femaleStudents.length,
      excellentCount: classStudents.filter(s => s.performanceLevel === 'Excellent').length,
      goodCount: classStudents.filter(s => s.performanceLevel === 'Bien').length,
      averageCount: classStudents.filter(s => s.performanceLevel === 'Moyen').length,
      needsSupportCount: classStudents.filter(s => s.performanceLevel === 'Besoin de soutien').length,
      topStudent: sorted[0],
      strugglingStudents: classStudents.filter(s => s.moyenne < 10).slice(0, 5)
    };
  }).sort((a, b) => a.classe.localeCompare(b.classe));

  // Calculate by sexe
  const maleStudents = students.filter(s => s.sexe === 'M');
  const femaleStudents = students.filter(s => s.sexe === 'F');

  const bySexe = [
    {
      sexe: 'Masculin',
      count: maleStudents.length,
      average: maleStudents.length > 0 
        ? Math.round((maleStudents.reduce((sum, s) => sum + s.moyenne, 0) / maleStudents.length) * 100) / 100
        : 0
    },
    {
      sexe: 'Féminin',
      count: femaleStudents.length,
      average: femaleStudents.length > 0
        ? Math.round((femaleStudents.reduce((sum, s) => sum + s.moyenne, 0) / femaleStudents.length) * 100) / 100
        : 0
    }
  ];

  // Calculate grade distribution
  const gradeRanges = [
    { range: '0-5', min: 0, max: 5 },
    { range: '5-8', min: 5, max: 8 },
    { range: '8-10', min: 8, max: 10 },
    { range: '10-12', min: 10, max: 12 },
    { range: '12-14', min: 12, max: 14 },
    { range: '14-16', min: 14, max: 16 },
    { range: '16-18', min: 16, max: 18 },
    { range: '18-20', min: 18, max: 20 }
  ];

  const gradeDistribution = gradeRanges.map(({ range, min, max }) => ({
    range,
    count: students.filter(s => s.moyenne >= min && s.moyenne < max).length
  }));

  // Global stats
  const global: GlobalStats = {
    totalStudents: students.length,
    totalClasses: classeGroups.size,
    globalAverage: Math.round((students.reduce((sum, s) => sum + s.moyenne, 0) / students.length) * 100) / 100,
    maleCount: maleStudents.length,
    femaleCount: femaleStudents.length,
    maleAverage: bySexe[0].average,
    femaleAverage: bySexe[1].average,
    performanceDistribution: {
      excellent: students.filter(s => s.performanceLevel === 'Excellent').length,
      good: students.filter(s => s.performanceLevel === 'Bien').length,
      average: students.filter(s => s.performanceLevel === 'Moyen').length,
      needsSupport: students.filter(s => s.performanceLevel === 'Besoin de soutien').length
    },
    gradeDistribution
  };

  return { byClasse, bySexe, global };
}
