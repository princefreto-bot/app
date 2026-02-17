import { useState, useEffect, useRef } from 'react';
import { Search, X, FileDown, BookOpen, GraduationCap, Target, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStudentPDF } from '../utils/pdfGenerator';
import type { Student } from '../types';

export function StudentsPage() {
  const { students, analytics } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSexe, setSelectedSexe] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.student-item');
      items.forEach((item, index) => {
        const el = item as HTMLElement;
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          el.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 30);
      });
    }
  }, [searchTerm, selectedClass, selectedSexe]);

  useEffect(() => {
    if (selectedStudent && modalRef.current) {
      modalRef.current.style.opacity = '0';
      modalRef.current.style.transform = 'scale(0.95)';
      
      requestAnimationFrame(() => {
        if (modalRef.current) {
          modalRef.current.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
          modalRef.current.style.opacity = '1';
          modalRef.current.style.transform = 'scale(1)';
        }
      });
    }
  }, [selectedStudent]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      `${student.prenoms} ${student.noms}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.classe.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.classe === selectedClass;
    const matchesSexe = selectedSexe === 'all' || student.sexe === selectedSexe;
    return matchesSearch && matchesClass && matchesSexe;
  });

  const classes = analytics?.byClasse.map(c => c.classe) || [];

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Bien': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Moyen': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Besoin de soutien': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.style.transition = 'all 0.2s ease-out';
      modalRef.current.style.opacity = '0';
      modalRef.current.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        setSelectedStudent(null);
      }, 200);
    } else {
      setSelectedStudent(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Élèves</h1>
        <p className="text-white/60">Consultez les profils et recommandations personnalisées</p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="all" className="bg-slate-800">Toutes les classes</option>
            {classes.map(c => (
              <option key={c} value={c} className="bg-slate-800">{c}</option>
            ))}
          </select>

          {/* Sexe Filter */}
          <select
            value={selectedSexe}
            onChange={(e) => setSelectedSexe(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="all" className="bg-slate-800">Tous les genres</option>
            <option value="M" className="bg-slate-800">Garçons</option>
            <option value="F" className="bg-slate-800">Filles</option>
          </select>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-white/50">
          <span>{filteredStudents.length} élève(s) trouvé(s)</span>
        </div>
      </div>

      {/* Students Grid */}
      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="student-item glass-card rounded-2xl p-6 cursor-pointer card-3d hover:border-indigo-500/50 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
                student.sexe === 'M' 
                  ? 'bg-gradient-to-br from-indigo-500 to-blue-600' 
                  : 'bg-gradient-to-br from-purple-500 to-pink-600'
              }`}>
                {student.prenoms[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate group-hover:text-indigo-300 transition-colors">
                  {student.prenoms} {student.noms}
                </h3>
                <p className="text-white/50 text-sm">{student.classe}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${getPerformanceColor(student.performanceLevel)}`}>
                    {student.performanceLevel}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  student.moyenne >= 14 ? 'text-emerald-400' :
                  student.moyenne >= 10 ? 'text-amber-400' :
                  'text-rose-400'
                }`}>
                  {student.moyenne.toFixed(1)}
                </p>
                <p className="text-white/30 text-xs">/ 20</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4 text-white/50 text-sm">
                <span>Rang: #{student.classRank}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* Student Modal */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl"
          >
            {/* Modal Header */}
            <div className="relative p-6 border-b border-white/10">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>

              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold ${
                  selectedStudent.sexe === 'M' 
                    ? 'bg-gradient-to-br from-indigo-500 to-blue-600' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-600'
                }`}>
                  {selectedStudent.prenoms[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedStudent.prenoms} {selectedStudent.noms}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-white/50">{selectedStudent.classe}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/50">{selectedStudent.sexe === 'M' ? 'Garçon' : 'Fille'}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/50">Rang #{selectedStudent.classRank}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Grade Card */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-6 rounded-2xl ${
                  selectedStudent.moyenne >= 14 ? 'bg-emerald-500/20' :
                  selectedStudent.moyenne >= 10 ? 'bg-amber-500/20' :
                  'bg-rose-500/20'
                }`}>
                  <p className="text-white/60 text-sm mb-1">Moyenne Générale</p>
                  <p className={`text-4xl font-bold ${
                    selectedStudent.moyenne >= 14 ? 'text-emerald-400' :
                    selectedStudent.moyenne >= 10 ? 'text-amber-400' :
                    'text-rose-400'
                  }`}>
                    {selectedStudent.moyenne.toFixed(2)}<span className="text-lg">/20</span>
                  </p>
                </div>
                <div className={`p-6 rounded-2xl ${getPerformanceColor(selectedStudent.performanceLevel)}`}>
                  <p className="text-white/60 text-sm mb-1">Niveau</p>
                  <p className="text-2xl font-bold text-white">{selectedStudent.performanceLevel}</p>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  Analyse personnalisée
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {selectedStudent.suggestions.learningAdvice}
                </p>
              </div>

              {/* Study Methods */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  Méthodes d'étude recommandées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedStudent.suggestions.studyMethods.map((method, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white/70 text-sm">{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher Recommendation */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Recommandation pour l'enseignant
                </h3>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-white/70 leading-relaxed">
                    {selectedStudent.suggestions.teacherRecommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => generateStudentPDF(selectedStudent)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all btn-glow"
              >
                <FileDown className="w-5 h-5" />
                Télécharger le rapport PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
