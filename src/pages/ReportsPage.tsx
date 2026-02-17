import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Users, GraduationCap, Building, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStudentPDF, generateClassPDF, generateGlobalPDF } from '../utils/pdfGenerator';

export function ReportsPage() {
  const { students, analytics } = useApp();
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.report-card');
      cards.forEach((card, index) => {
        const el = card as HTMLElement;
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 150);
      });
    }
  }, []);

  const handleGenerateStudentReport = () => {
    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    setGeneratingReport('student');
    setTimeout(() => {
      generateStudentPDF(student);
      setGeneratingReport(null);
    }, 1000);
  };

  const handleGenerateClassReport = () => {
    if (!analytics) return;
    const classStats = analytics.byClasse.find(c => c.classe === selectedClass);
    if (!classStats) return;

    setGeneratingReport('class');
    setTimeout(() => {
      generateClassPDF(classStats, students);
      setGeneratingReport(null);
    }, 1000);
  };

  const handleGenerateGlobalReport = () => {
    if (!analytics) return;

    setGeneratingReport('global');
    setTimeout(() => {
      generateGlobalPDF(analytics.global, analytics.byClasse, students);
      setGeneratingReport(null);
    }, 1000);
  };

  const classes = analytics?.byClasse.map(c => c.classe) || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Rapports</h1>
        <p className="text-white/60">Générez et exportez des rapports PDF professionnels</p>
      </div>

      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Individual Student Report */}
        <div className="report-card glass-card rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rapport Individuel</h3>
            <p className="text-white/50 text-sm mb-6">
              Générez un rapport détaillé pour un élève spécifique avec son analyse personnalisée et ses recommandations.
            </p>

            <div className="space-y-4">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="" className="bg-slate-800">Sélectionner un élève</option>
                {students.map(student => (
                  <option key={student.id} value={student.id} className="bg-slate-800">
                    {student.prenoms} {student.noms} ({student.classe})
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerateStudentReport}
                disabled={!selectedStudent || generatingReport === 'student'}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all btn-glow ${
                  selectedStudent && generatingReport !== 'student'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {generatingReport === 'student' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Générer le rapport</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/40 text-xs">Contenu du rapport :</p>
              <ul className="mt-2 space-y-1 text-white/60 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Informations personnelles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Notes et classement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Analyse IA personnalisée
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Recommandations pédagogiques
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Class Report */}
        <div className="report-card glass-card rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rapport de Classe</h3>
            <p className="text-white/50 text-sm mb-6">
              Synthèse complète d'une classe avec les statistiques, la liste des élèves et les performances.
            </p>

            <div className="space-y-4">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:outline-none focus:border-emerald-500 transition-all"
              >
                <option value="" className="bg-slate-800">Sélectionner une classe</option>
                {classes.map(cls => (
                  <option key={cls} value={cls} className="bg-slate-800">{cls}</option>
                ))}
              </select>

              <button
                onClick={handleGenerateClassReport}
                disabled={!selectedClass || generatingReport === 'class'}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all btn-glow ${
                  selectedClass && generatingReport !== 'class'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {generatingReport === 'class' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Générer le rapport</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/40 text-xs">Contenu du rapport :</p>
              <ul className="mt-2 space-y-1 text-white/60 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Statistiques de la classe
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Distribution des performances
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Liste des élèves classée
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Répartition par genre
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Global Report */}
        <div className="report-card glass-card rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600" />
          <div className="p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rapport Global</h3>
            <p className="text-white/50 text-sm mb-6">
              Rapport complet de l'établissement avec toutes les statistiques et analyses.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Total élèves</span>
                  <span className="text-white font-semibold">{analytics?.global.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Classes</span>
                  <span className="text-white font-semibold">{analytics?.global.totalClasses}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Moyenne générale</span>
                  <span className="text-amber-400 font-semibold">{analytics?.global.globalAverage.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleGenerateGlobalReport}
                disabled={generatingReport === 'global'}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all btn-glow ${
                  generatingReport !== 'global'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/30'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {generatingReport === 'global' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Générer le rapport</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/40 text-xs">Contenu du rapport :</p>
              <ul className="mt-2 space-y-1 text-white/60 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Vue d'ensemble établissement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Synthèse par classe
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Top 10 meilleurs élèves
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Élèves en difficulté
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Export Section */}
      <div className="mt-12 glass-card rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Export rapide</h3>
            <p className="text-white/50 text-sm">Générez tous les rapports en un clic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <p className="text-3xl font-bold text-indigo-400">{students.length}</p>
            <p className="text-white/50 text-sm">Rapports individuels disponibles</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <p className="text-3xl font-bold text-emerald-400">{classes.length}</p>
            <p className="text-white/50 text-sm">Rapports de classe disponibles</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <p className="text-3xl font-bold text-amber-400">1</p>
            <p className="text-white/50 text-sm">Rapport global</p>
          </div>
        </div>
      </div>
    </div>
  );
}
