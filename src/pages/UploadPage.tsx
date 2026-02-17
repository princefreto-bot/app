import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseExcelFile } from '../utils/excelParser';

export function UploadPage() {
  const { setStudents, setLoading, isLoading, error, setError } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.style.opacity = '0';
      dropZone.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        dropZone.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        dropZone.style.opacity = '1';
        dropZone.style.transform = 'translateY(0)';
      }, 100);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setError('Veuillez sélectionner un fichier Excel (.xlsx)');
      return;
    }

    setLoading(true);
    setError(null);
    setFileName(file.name);

    const result = await parseExcelFile(file);

    if (result.success && result.students) {
      setUploadSuccess(true);
      
      setTimeout(() => {
        setStudents(result.students!);
        setLoading(false);
      }, 1500);
    } else {
      setError(result.error || 'Erreur lors du traitement du fichier');
      setLoading(false);
    }
  }, [setStudents, setLoading, setError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Analyse IA des performances scolaires</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 glow-text">
            Importez vos données
          </h1>
          <p className="text-white/60 text-lg">
            Téléchargez votre fichier Excel pour générer des analyses et recommandations personnalisées
          </p>
        </div>

        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative glass-card rounded-3xl p-12 cursor-pointer transition-all duration-500 card-3d ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-105'
              : uploadSuccess
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'hover:border-indigo-500/50 hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="text-center">
            {isLoading ? (
              <div className="space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                  <FileSpreadsheet className="absolute inset-0 m-auto w-10 h-10 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Analyse en cours...</p>
                  <p className="text-white/50 text-sm">{fileName}</p>
                </div>
              </div>
            ) : uploadSuccess ? (
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center glow-success">
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Import réussi !</p>
                  <p className="text-white/50 text-sm">Redirection vers le tableau de bord...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDragging 
                    ? 'bg-indigo-500/30 scale-110' 
                    : 'bg-white/5'
                }`}>
                  <Upload className={`w-12 h-12 transition-all duration-300 ${
                    isDragging ? 'text-indigo-400' : 'text-white/50'
                  }`} />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg mb-2">
                    Glissez-déposez votre fichier Excel
                  </p>
                  <p className="text-white/50 text-sm">
                    ou cliquez pour parcourir
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Format accepté: .xlsx</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Erreur de validation</p>
              <p className="text-red-300/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* File Format Info */}
        <div className="mt-8 glass-panel rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Format requis
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-white/70">Feuille nommée: <code className="text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded">college</code></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-white/70">Colonnes: <code className="text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded">Classe, Noms, Prenoms, Sexe, Moyenne</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
