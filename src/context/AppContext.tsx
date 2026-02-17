import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Student, PivotData, Page } from '../types';
import { calculateAnalytics } from '../utils/analytics';

interface AppState {
  students: Student[];
  analytics: PivotData | null;
  currentPage: Page;
  isLoading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  setStudents: (students: Student[]) => void;
  setCurrentPage: (page: Page) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refresh: () => void;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    students: [],
    analytics: null,
    currentPage: 'upload',
    isLoading: false,
    error: null,
  });

  const setStudents = useCallback((students: Student[]) => {
    const analytics = students.length > 0 ? calculateAnalytics(students) : null;
    setState(prev => ({
      ...prev,
      students,
      analytics,
      currentPage: students.length > 0 ? 'dashboard' : prev.currentPage,
      error: null,
    }));
  }, []);

  const setCurrentPage = useCallback((page: Page) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const refresh = useCallback(() => {
    if (state.students.length > 0) {
      const analytics = calculateAnalytics(state.students);
      setState(prev => ({ ...prev, analytics }));
    }
  }, [state.students]);

  const clearData = useCallback(() => {
    setState({
      students: [],
      analytics: null,
      currentPage: 'upload',
      isLoading: false,
      error: null,
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setStudents,
        setCurrentPage,
        setLoading,
        setError,
        refresh,
        clearData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
