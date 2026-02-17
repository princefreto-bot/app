import { useEffect, useRef, useState } from 'react';
import { Users, GraduationCap, TrendingUp, AlertTriangle, Award, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';

const COLORS = {
  excellent: '#22c55e',
  good: '#3b82f6',
  average: '#eab308',
  needsSupport: '#ef4444',
  male: '#6366f1',
  female: '#a855f7',
};

export function DashboardPage() {
  const { analytics, students } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.stat-card');
      cards.forEach((card, index) => {
        const el = card as HTMLElement;
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }
  }, []);

  if (!analytics) return null;

  const { global, byClasse, bySexe } = analytics;

  const performanceData = [
    { name: 'Excellent', value: global.performanceDistribution.excellent, color: COLORS.excellent },
    { name: 'Bien', value: global.performanceDistribution.good, color: COLORS.good },
    { name: 'Moyen', value: global.performanceDistribution.average, color: COLORS.average },
    { name: 'Soutien', value: global.performanceDistribution.needsSupport, color: COLORS.needsSupport },
  ];

  const classData = byClasse.map(c => ({
    classe: c.classe,
    moyenne: c.averageGrade,
    effectif: c.totalStudents,
  }));

  const genderData = bySexe.map(s => ({
    name: s.sexe,
    value: s.count,
    color: s.sexe === 'Masculin' ? COLORS.male : COLORS.female,
  }));

  const filteredStudents = selectedClass === 'all' 
    ? students 
    : students.filter(s => s.classe === selectedClass);

  const topStudents = [...filteredStudents].sort((a, b) => b.moyenne - a.moyenne).slice(0, 5);
  const strugglingStudents = filteredStudents.filter(s => s.moyenne < 10).slice(0, 5);

  return (
    <div ref={containerRef} className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord</h1>
          <p className="text-white/60">Vue d'ensemble des performances de l'établissement</p>
        </div>
        
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:border-indigo-500"
        >
          <option value="all" className="bg-slate-800">Toutes les classes</option>
          {byClasse.map(c => (
            <option key={c.classe} value={c.classe} className="bg-slate-800">{c.classe}</option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card glass-card rounded-2xl p-6 card-3d">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-indigo-400 text-sm font-medium">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{global.totalStudents}</p>
          <p className="text-white/50 text-sm">Élèves inscrits</p>
        </div>

        <div className="stat-card glass-card rounded-2xl p-6 card-3d">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-emerald-400 text-sm font-medium">Moyenne</span>
          </div>
          <p className="text-3xl font-bold text-white">{global.globalAverage.toFixed(2)}</p>
          <p className="text-white/50 text-sm">Moyenne générale</p>
        </div>

        <div className="stat-card glass-card rounded-2xl p-6 card-3d">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-amber-400 text-sm font-medium">Classes</span>
          </div>
          <p className="text-3xl font-bold text-white">{global.totalClasses}</p>
          <p className="text-white/50 text-sm">Classes actives</p>
        </div>

        <div className="stat-card glass-card rounded-2xl p-6 card-3d">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-rose-400 text-sm font-medium">Alerte</span>
          </div>
          <p className="text-3xl font-bold text-white">{global.performanceDistribution.needsSupport}</p>
          <p className="text-white/50 text-sm">Élèves en difficulté</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <div className="stat-card glass-card rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Distribution des performances
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white'
                  }} 
                />
                <Legend 
                  wrapperStyle={{ color: 'white' }}
                  formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="stat-card glass-card rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Répartition par genre
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white'
                  }} 
                />
                <Legend 
                  formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 rounded-xl bg-indigo-500/10">
              <p className="text-indigo-400 text-2xl font-bold">{global.maleAverage.toFixed(2)}</p>
              <p className="text-white/50 text-xs">Moy. Garçons</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-purple-500/10">
              <p className="text-purple-400 text-2xl font-bold">{global.femaleAverage.toFixed(2)}</p>
              <p className="text-white/50 text-xs">Moy. Filles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Performance Chart */}
      <div className="stat-card glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          Performance par classe
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="classe" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 20]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white'
                }} 
              />
              <Bar dataKey="moyenne" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="stat-card glass-card rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Distribution des notes
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={global.gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Students & Struggling Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Students */}
        <div className="stat-card glass-card rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Meilleurs élèves
          </h3>
          <div className="space-y-3">
            {topStudents.map((student, index) => (
              <div 
                key={student.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-amber-500 text-white' :
                  index === 1 ? 'bg-slate-400 text-white' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-white/10 text-white/50'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{student.prenoms} {student.noms}</p>
                  <p className="text-white/50 text-sm">{student.classe}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold">{student.moyenne.toFixed(2)}</p>
                  <p className="text-white/30 text-xs">/ 20</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Struggling Students */}
        <div className="stat-card glass-card rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Élèves en difficulté
          </h3>
          <div className="space-y-3">
            {strugglingStudents.length > 0 ? strugglingStudents.map((student) => (
              <div 
                key={student.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20"
              >
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{student.prenoms} {student.noms}</p>
                  <p className="text-white/50 text-sm">{student.classe}</p>
                </div>
                <div className="text-right">
                  <p className="text-rose-400 font-bold">{student.moyenne.toFixed(2)}</p>
                  <p className="text-white/30 text-xs">/ 20</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Award className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-white/60">Aucun élève en difficulté</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pivot Table by Class */}
      <div className="stat-card glass-card rounded-2xl p-6 overflow-x-auto">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          Tableau croisé par classe
        </h3>
        <table className="data-table w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-3 text-white/80 font-semibold rounded-tl-xl">Classe</th>
              <th className="text-center p-3 text-white/80 font-semibold">Effectif</th>
              <th className="text-center p-3 text-white/80 font-semibold">Garçons</th>
              <th className="text-center p-3 text-white/80 font-semibold">Filles</th>
              <th className="text-center p-3 text-white/80 font-semibold">Moyenne</th>
              <th className="text-center p-3 text-white/80 font-semibold">Excellent</th>
              <th className="text-center p-3 text-white/80 font-semibold">Bien</th>
              <th className="text-center p-3 text-white/80 font-semibold">Moyen</th>
              <th className="text-center p-3 text-white/80 font-semibold rounded-tr-xl">Soutien</th>
            </tr>
          </thead>
          <tbody>
            {byClasse.map((cls) => (
              <tr key={cls.classe} className="border-b border-white/5">
                <td className="p-3 text-white font-medium">{cls.classe}</td>
                <td className="p-3 text-center text-white/70">{cls.totalStudents}</td>
                <td className="p-3 text-center text-indigo-400">{cls.maleCount}</td>
                <td className="p-3 text-center text-purple-400">{cls.femaleCount}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    cls.averageGrade >= 14 ? 'bg-emerald-500/20 text-emerald-400' :
                    cls.averageGrade >= 10 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {cls.averageGrade.toFixed(2)}
                  </span>
                </td>
                <td className="p-3 text-center text-emerald-400">{cls.excellentCount}</td>
                <td className="p-3 text-center text-blue-400">{cls.goodCount}</td>
                <td className="p-3 text-center text-amber-400">{cls.averageCount}</td>
                <td className="p-3 text-center text-rose-400">{cls.needsSupportCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
