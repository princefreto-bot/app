import * as XLSX from 'xlsx';
import type { Student, PerformanceLevel, StudentSuggestions } from '../types';

const REQUIRED_COLUMNS = ['Classe', 'Noms', 'Prenoms', 'Sexe', 'Moyenne'];
const SHEET_NAME = 'college';

export interface ParseResult {
  success: boolean;
  students?: Student[];
  error?: string;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function getPerformanceLevel(moyenne: number): PerformanceLevel {
  if (moyenne >= 16) return 'Excellent';
  if (moyenne >= 14) return 'Bien';
  if (moyenne >= 10) return 'Moyen';
  return 'Besoin de soutien';
}

function generateSuggestions(moyenne: number, sexe: 'M' | 'F'): StudentSuggestions {
  const level = getPerformanceLevel(moyenne);
  const pronoun = sexe === 'M' ? 'il' : 'elle';
  const possessive = sexe === 'M' ? 'son' : 'sa';
  
  const suggestions: Record<PerformanceLevel, StudentSuggestions> = {
    'Excellent': {
      performanceLevel: 'Excellent',
      learningAdvice: `Cet(te) élève démontre une maîtrise exceptionnelle. ${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} peut approfondir ${possessive} apprentissage avec des projets avancés.`,
      studyMethods: [
        'Mentorat de pairs moins avancés',
        'Projets de recherche autonomes',
        'Participation à des olympiades académiques',
        'Lectures complémentaires avancées'
      ],
      teacherRecommendation: `Encourager la participation à des compétitions académiques et proposer des défis intellectuels supplémentaires.`
    },
    'Bien': {
      performanceLevel: 'Bien',
      learningAdvice: `Bon niveau général. ${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} peut viser l'excellence avec un peu plus d'effort ciblé.`,
      studyMethods: [
        'Révisions régulières et structurées',
        'Exercices de perfectionnement',
        'Groupes d\'étude collaboratifs',
        'Fiches de synthèse personnalisées'
      ],
      teacherRecommendation: `Identifier les points à améliorer et proposer des exercices ciblés pour atteindre l'excellence.`
    },
    'Moyen': {
      performanceLevel: 'Moyen',
      learningAdvice: `Niveau suffisant mais perfectible. Un travail régulier permettrait d'améliorer significativement les résultats.`,
      studyMethods: [
        'Planning de révision quotidien',
        'Soutien scolaire recommandé',
        'Exercices de renforcement',
        'Aide aux devoirs structurée'
      ],
      teacherRecommendation: `Mettre en place un suivi rapproché et proposer des sessions de rattrapage régulières.`
    },
    'Besoin de soutien': {
      performanceLevel: 'Besoin de soutien',
      learningAdvice: `Cet(te) élève nécessite une attention particulière et un accompagnement renforcé pour surmonter ses difficultés.`,
      studyMethods: [
        'Cours particuliers recommandés',
        'Séances de remédiation intensive',
        'Accompagnement psychopédagogique',
        'Objectifs à court terme et récompenses'
      ],
      teacherRecommendation: `Convoquer les parents pour un plan d'action concerté. Envisager un programme de soutien personnalisé.`
    }
  };
  
  return suggestions[level];
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Check if sheet exists (case insensitive)
        const sheetName = workbook.SheetNames.find(
          name => name.toLowerCase() === SHEET_NAME.toLowerCase()
        );
        
        if (!sheetName) {
          resolve({
            success: false,
            error: `Feuille "${SHEET_NAME}" non trouvée. Feuilles disponibles: ${workbook.SheetNames.join(', ')}`
          });
          return;
        }
        
        const sheet = workbook.Sheets[sheetName];
        
        // Read as array with raw headers from row 1
        const jsonData = XLSX.utils.sheet_to_json(sheet, { 
          header: 1,
          defval: '',
          blankrows: false
        }) as unknown[][];
        
        if (jsonData.length < 2) {
          resolve({
            success: false,
            error: 'Le fichier ne contient pas de données (minimum: en-têtes + 1 ligne).'
          });
          return;
        }
        
        // Row 1 (index 0) contains headers: A=Classe, B=Noms, C=Prenoms, D=Sexe, E=Moyenne
        const headers = jsonData[0] as string[];
        
        // Clean and normalize headers
        const normalizedHeaders = headers.map(h => 
          h?.toString().trim().toLowerCase() || ''
        );
        
        // Expected columns in order A, B, C, D, E
        const expectedColumns = ['classe', 'noms', 'prenoms', 'sexe', 'moyenne'];
        
        // Try to find columns by position first (A=0, B=1, C=2, D=3, E=4)
        // This is the primary method since user confirmed this structure
        let columnIndices: Record<string, number> = {
          'Classe': 0,  // Column A
          'Noms': 1,    // Column B
          'Prenoms': 2, // Column C
          'Sexe': 3,    // Column D
          'Moyenne': 4  // Column E
        };
        
        // Verify headers match expected (with tolerance for slight variations)
        const headerCheck = expectedColumns.every((col, idx) => {
          const header = normalizedHeaders[idx] || '';
          // Check if header contains or matches the expected column name
          return header.includes(col) || col.includes(header) || header === col;
        });
        
        // If headers don't match by position, try to find them by name
        if (!headerCheck && normalizedHeaders.length > 0) {
          const foundIndices: Record<string, number> = {};
          
          REQUIRED_COLUMNS.forEach(col => {
            const idx = normalizedHeaders.findIndex(h => {
              const normalized = h.toLowerCase().trim();
              const colLower = col.toLowerCase();
              return normalized === colLower || 
                     normalized.includes(colLower) || 
                     colLower.includes(normalized);
            });
            if (idx !== -1) {
              foundIndices[col] = idx;
            }
          });
          
          // Check if all columns were found
          const missingColumns = REQUIRED_COLUMNS.filter(col => foundIndices[col] === undefined);
          
          if (missingColumns.length > 0) {
            resolve({
              success: false,
              error: `Colonnes manquantes ou non reconnues: ${missingColumns.join(', ')}. ` +
                     `En-têtes trouvés: ${headers.filter(h => h).join(', ')}. ` +
                     `Format attendu: Classe (A1), Noms (B1), Prenoms (C1), Sexe (D1), Moyenne (E1)`
            });
            return;
          }
          
          columnIndices = foundIndices;
        }
        
        // Parse students starting from row 2 (index 1)
        const students: Student[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as (string | number)[];
          
          // Skip empty rows
          if (!row || row.length === 0 || row.every(cell => cell === '' || cell === null || cell === undefined)) {
            continue;
          }
          
          // Extract values by column index
          const classeRaw = row[columnIndices['Classe']];
          const nomsRaw = row[columnIndices['Noms']];
          const prenomsRaw = row[columnIndices['Prenoms']];
          const sexeRaw = row[columnIndices['Sexe']];
          const moyenneRaw = row[columnIndices['Moyenne']];
          
          // Convert to strings/numbers
          const classe = classeRaw?.toString().trim() || '';
          const noms = nomsRaw?.toString().trim() || '';
          const prenoms = prenomsRaw?.toString().trim() || '';
          const sexeStr = sexeRaw?.toString().trim().toUpperCase() || 'M';
          const sexe: 'M' | 'F' = sexeStr === 'F' || sexeStr === 'FEMININ' || sexeStr === 'FÉMININ' ? 'F' : 'M';
          
          // Parse moyenne - handle both number and string formats
          let moyenne = 0;
          if (typeof moyenneRaw === 'number') {
            moyenne = moyenneRaw;
          } else if (moyenneRaw) {
            // Handle French decimal format (comma) and standard format (dot)
            const moyenneStr = moyenneRaw.toString().replace(',', '.');
            moyenne = parseFloat(moyenneStr) || 0;
          }
          
          // Validate: must have at least noms OR prenoms to be a valid student
          if (noms || prenoms) {
            const student: Student = {
              id: generateId(),
              classe: classe || 'Non spécifiée',
              noms: noms || 'N/A',
              prenoms: prenoms || 'N/A',
              sexe,
              moyenne: Math.round(moyenne * 100) / 100,
              performanceLevel: getPerformanceLevel(moyenne),
              suggestions: generateSuggestions(moyenne, sexe)
            };
            students.push(student);
          }
        }
        
        if (students.length === 0) {
          resolve({
            success: false,
            error: 'Aucun élève valide trouvé. Vérifiez que les données commencent à la ligne 2 ' +
                   'avec les colonnes: Classe (A), Noms (B), Prenoms (C), Sexe (D), Moyenne (E).'
          });
          return;
        }
        
        // Calculate rankings per class
        const classeGroups = new Map<string, Student[]>();
        students.forEach(s => {
          if (!classeGroups.has(s.classe)) {
            classeGroups.set(s.classe, []);
          }
          classeGroups.get(s.classe)!.push(s);
        });
        
        // Global ranking (all students)
        const sortedGlobal = [...students].sort((a, b) => b.moyenne - a.moyenne);
        sortedGlobal.forEach((s, i) => {
          const original = students.find(st => st.id === s.id);
          if (original) original.rank = i + 1;
        });
        
        // Class ranking (per class)
        classeGroups.forEach((classStudents) => {
          const sorted = [...classStudents].sort((a, b) => b.moyenne - a.moyenne);
          sorted.forEach((s, i) => {
            const original = students.find(st => st.id === s.id);
            if (original) original.classRank = i + 1;
          });
        });
        
        console.log(`✅ Import réussi: ${students.length} élèves dans ${classeGroups.size} classes`);
        
        resolve({ success: true, students });
      } catch (error) {
        console.error('Erreur parsing Excel:', error);
        resolve({
          success: false,
          error: `Erreur de lecture: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Erreur de lecture du fichier.'
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
}
