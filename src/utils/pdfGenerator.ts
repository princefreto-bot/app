import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Student, ClassStats, GlobalStats } from '../types';

const COLORS = {
  primary: [79, 70, 229] as [number, number, number],
  secondary: [147, 51, 234] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [249, 115, 22] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
};

function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Gradient header simulation
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, 22);
  
  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 15, 32);
  }
  
  // Date
  doc.setFontSize(9);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 15, 22, { align: 'right' });
  
  doc.setTextColor(...COLORS.text);
}

function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `EduAnalytics Pro - Page ${i}/${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
}

function getPerformanceColor(level: string): [number, number, number] {
  switch (level) {
    case 'Excellent': return COLORS.success;
    case 'Bien': return [59, 130, 246];
    case 'Moyen': return [234, 179, 8];
    case 'Besoin de soutien': return COLORS.danger;
    default: return COLORS.muted;
  }
}

export function generateStudentPDF(student: Student): void {
  const doc = new jsPDF();
  
  addHeader(doc, 'Rapport Individuel', `${student.prenoms} ${student.noms}`);
  
  let y = 55;
  
  // Student info card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 180, 45, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Informations de l\'élève', 25, y + 12);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom complet: ${student.prenoms} ${student.noms}`, 25, y + 24);
  doc.text(`Classe: ${student.classe}`, 25, y + 32);
  doc.text(`Sexe: ${student.sexe === 'M' ? 'Masculin' : 'Féminin'}`, 120, y + 24);
  doc.text(`Rang dans la classe: ${student.classRank || 'N/A'}`, 120, y + 32);
  
  y += 55;
  
  // Grade section
  doc.setFillColor(...getPerformanceColor(student.performanceLevel));
  doc.roundedRect(15, y, 85, 40, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Moyenne Générale', 20, y + 12);
  doc.setFontSize(28);
  doc.text(`${student.moyenne.toFixed(2)}/20`, 20, y + 32);
  
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, y, 85, 40, 3, 3, 'F');
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(12);
  doc.text('Niveau de Performance', 115, y + 12);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...getPerformanceColor(student.performanceLevel));
  doc.text(student.performanceLevel, 115, y + 28);
  
  y += 55;
  
  // AI Suggestions section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Analyse Pédagogique IA', 15, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  
  const splitAdvice = doc.splitTextToSize(student.suggestions.learningAdvice, 175);
  doc.text(splitAdvice, 15, y);
  y += splitAdvice.length * 5 + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Méthodes d\'étude recommandées:', 15, y);
  y += 7;
  
  doc.setFont('helvetica', 'normal');
  student.suggestions.studyMethods.forEach((method) => {
    doc.text(`• ${method}`, 20, y);
    y += 6;
  });
  
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Recommandation pour l\'enseignant:', 15, y);
  y += 7;
  
  doc.setFont('helvetica', 'normal');
  const splitReco = doc.splitTextToSize(student.suggestions.teacherRecommendation, 175);
  doc.text(splitReco, 15, y);
  
  addFooter(doc);
  doc.save(`rapport_${student.noms}_${student.prenoms}.pdf`);
}

export function generateClassPDF(classStats: ClassStats, students: Student[]): void {
  const doc = new jsPDF();
  const classStudents = students.filter(s => s.classe === classStats.classe);
  
  addHeader(doc, `Rapport de Classe`, `Classe: ${classStats.classe}`);
  
  let y = 55;
  
  // Summary cards
  const cardWidth = 42;
  const cards = [
    { label: 'Effectif', value: classStats.totalStudents.toString(), color: COLORS.primary },
    { label: 'Moyenne', value: classStats.averageGrade.toFixed(2), color: COLORS.success },
    { label: 'Garçons', value: classStats.maleCount.toString(), color: [59, 130, 246] as [number, number, number] },
    { label: 'Filles', value: classStats.femaleCount.toString(), color: COLORS.secondary },
  ];
  
  cards.forEach((card, i) => {
    doc.setFillColor(...card.color);
    doc.roundedRect(15 + i * (cardWidth + 4), y, cardWidth, 30, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(card.label, 20 + i * (cardWidth + 4), y + 10);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, 20 + i * (cardWidth + 4), y + 24);
    doc.setFont('helvetica', 'normal');
  });
  
  y += 45;
  
  // Performance distribution
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Distribution des performances', 15, y);
  y += 8;
  
  const perfData = [
    { level: 'Excellent', count: classStats.excellentCount, color: COLORS.success },
    { level: 'Bien', count: classStats.goodCount, color: [59, 130, 246] as [number, number, number] },
    { level: 'Moyen', count: classStats.averageCount, color: [234, 179, 8] as [number, number, number] },
    { level: 'Besoin de soutien', count: classStats.needsSupportCount, color: COLORS.danger },
  ];
  
  const totalWidth = 175;
  let xOffset = 15;
  perfData.forEach((perf) => {
    const width = (perf.count / classStats.totalStudents) * totalWidth;
    if (width > 0) {
      doc.setFillColor(...perf.color);
      doc.rect(xOffset, y, width, 12, 'F');
      xOffset += width;
    }
  });
  
  y += 20;
  
  // Legend
  perfData.forEach((perf, i) => {
    const x = 15 + (i % 2) * 90;
    const yOffset = y + Math.floor(i / 2) * 8;
    doc.setFillColor(...perf.color);
    doc.circle(x + 3, yOffset - 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.text(`${perf.level}: ${perf.count}`, x + 8, yOffset);
  });
  
  y += 25;
  
  // Students table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Liste des élèves', 15, y);
  y += 5;
  
  const sortedStudents = [...classStudents].sort((a, b) => b.moyenne - a.moyenne);
  
  autoTable(doc, {
    startY: y,
    head: [['Rang', 'Nom', 'Prénom', 'Sexe', 'Moyenne', 'Niveau']],
    body: sortedStudents.map((s, i) => [
      (i + 1).toString(),
      s.noms,
      s.prenoms,
      s.sexe,
      s.moyenne.toFixed(2),
      s.performanceLevel
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 15 },
      4: { cellWidth: 20 },
    },
  });
  
  addFooter(doc);
  doc.save(`rapport_classe_${classStats.classe}.pdf`);
}

export function generateGlobalPDF(globalStats: GlobalStats, classStats: ClassStats[], students: Student[]): void {
  const doc = new jsPDF();
  
  addHeader(doc, 'Rapport Global', 'Synthèse de l\'établissement');
  
  let y = 55;
  
  // Key metrics
  const cardWidth = 42;
  const cards = [
    { label: 'Total Élèves', value: globalStats.totalStudents.toString(), color: COLORS.primary },
    { label: 'Classes', value: globalStats.totalClasses.toString(), color: COLORS.secondary },
    { label: 'Moyenne', value: globalStats.globalAverage.toFixed(2), color: COLORS.success },
    { label: 'Réussite', value: `${Math.round(((globalStats.performanceDistribution.excellent + globalStats.performanceDistribution.good + globalStats.performanceDistribution.average) / globalStats.totalStudents) * 100)}%`, color: [34, 197, 94] as [number, number, number] },
  ];
  
  cards.forEach((card, i) => {
    doc.setFillColor(...card.color);
    doc.roundedRect(15 + i * (cardWidth + 4), y, cardWidth, 30, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(card.label, 20 + i * (cardWidth + 4), y + 10);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, 20 + i * (cardWidth + 4), y + 24);
    doc.setFont('helvetica', 'normal');
  });
  
  y += 45;
  
  // Gender stats
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Répartition par sexe', 15, y);
  y += 10;
  
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(15, y, 85, 25, 3, 3, 'F');
  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(105, y, 85, 25, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Garçons: ${globalStats.maleCount}`, 20, y + 10);
  doc.text(`Moy: ${globalStats.maleAverage.toFixed(2)}`, 20, y + 18);
  doc.text(`Filles: ${globalStats.femaleCount}`, 110, y + 10);
  doc.text(`Moy: ${globalStats.femaleAverage.toFixed(2)}`, 110, y + 18);
  
  y += 40;
  
  // Class summary table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Synthèse par classe', 15, y);
  y += 5;
  
  autoTable(doc, {
    startY: y,
    head: [['Classe', 'Effectif', 'Moyenne', 'Excellent', 'Bien', 'Moyen', 'Soutien']],
    body: classStats.map(c => [
      c.classe,
      c.totalStudents.toString(),
      c.averageGrade.toFixed(2),
      c.excellentCount.toString(),
      c.goodCount.toString(),
      c.averageCount.toString(),
      c.needsSupportCount.toString()
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
  });
  
  // Top students page
  doc.addPage();
  addHeader(doc, 'Meilleurs Élèves', 'Top 10 de l\'établissement');
  
  const topStudents = [...students].sort((a, b) => b.moyenne - a.moyenne).slice(0, 10);
  
  autoTable(doc, {
    startY: 55,
    head: [['Rang', 'Nom', 'Prénom', 'Classe', 'Moyenne']],
    body: topStudents.map((s, i) => [
      (i + 1).toString(),
      s.noms,
      s.prenoms,
      s.classe,
      s.moyenne.toFixed(2)
    ]),
    theme: 'striped',
    headStyles: { fillColor: COLORS.success, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
  });
  
  // Struggling students
  const strugglingStudents = students.filter(s => s.moyenne < 10).sort((a, b) => a.moyenne - b.moyenne).slice(0, 10);
  
  if (strugglingStudents.length > 0) {
    doc.addPage();
    addHeader(doc, 'Élèves en Difficulté', 'Nécessitant un soutien particulier');
    
    autoTable(doc, {
      startY: 55,
      head: [['Nom', 'Prénom', 'Classe', 'Moyenne', 'Niveau']],
      body: strugglingStudents.map(s => [
        s.noms,
        s.prenoms,
        s.classe,
        s.moyenne.toFixed(2),
        s.performanceLevel
      ]),
      theme: 'striped',
      headStyles: { fillColor: COLORS.danger, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
    });
  }
  
  addFooter(doc);
  doc.save('rapport_global_etablissement.pdf');
}
