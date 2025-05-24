
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GuardianService } from '@/services/GuardianService';
import type { 
  Guardian, 
  StudentLink, 
  GuardianAlert,
  StudentPerformanceSummary 
} from '@/types/guardian';
import { useToast } from '@/hooks/use-toast';

interface GuardianContextType {
  guardian: Guardian | null;
  isLoading: boolean;
  linkedStudents: StudentLink[];
  currentStudent: StudentLink | null;
  unreadAlertsCount: number;
  alerts: GuardianAlert[];
  performanceSummary: StudentPerformanceSummary | null;
  setCurrentStudent: (student: StudentLink) => void;
  refreshData: () => Promise<void>;
  isGuardian: boolean;
}

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

export const GuardianProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [linkedStudents, setLinkedStudents] = useState<StudentLink[]>([]);
  const [currentStudent, setCurrentStudent] = useState<StudentLink | null>(null);
  const [alerts, setAlerts] = useState<GuardianAlert[]>([]);
  const [performanceSummary, setPerformanceSummary] = useState<StudentPerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const isGuardian = !!guardian;
  
  const unreadAlertsCount = alerts.filter(alert => !alert.read_at).length;
  
  const loadGuardianData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Load guardian profile - if not found, that's ok (it might not be created yet)
      const guardianData = await GuardianService.getGuardianProfile().catch(err => {
        // Just log the error but continue - the guardian might not exist yet
        console.error('Error fetching guardian profile:', err);
        return null;
      });
      
      setGuardian(guardianData);
      
      if (!guardianData) return;
      
      // Only continue with other data fetching if we found a guardian
      try {
        // Load linked students
        const students = await GuardianService.getLinkedStudents();
        setLinkedStudents(students);
        
        // Set current student to primary or first in list
        const primaryStudent = students.find(s => s.is_primary) || students[0] || null;
        setCurrentStudent(primaryStudent);
        
        if (primaryStudent?.student_id) {
          // Load alerts for current student
          const alertsData = await GuardianService.getAlerts(primaryStudent.student_id).catch(err => {
            console.error('Error fetching alerts:', err);
            return [];
          });
          
          setAlerts(alertsData);
          
          // Load performance summary for current student
          const summary = await GuardianService.getStudentPerformanceSummary(primaryStudent.student_id).catch(err => {
            console.error('Error fetching performance summary:', err);
            return null;
          });
          
          setPerformanceSummary(summary);
        }
      } catch (dataError) {
        console.error('Error loading related guardian data:', dataError);
      }
    } catch (error) {
      console.error('Error in loadGuardianData:', error);
      setLoadError('Failed to load guardian data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetCurrentStudent = async (student: StudentLink) => {
    setCurrentStudent(student);
    
    if (student?.student_id) {
      try {
        // Load alerts for new current student
        const alertsData = await GuardianService.getAlerts(student.student_id).catch(err => {
          console.error('Error fetching alerts for student:', err);
          return [];
        });
        
        setAlerts(alertsData);
        
        // Load performance summary for new current student
        const summary = await GuardianService.getStudentPerformanceSummary(student.student_id).catch(err => {
          console.error('Error fetching performance summary for student:', err);
          return null;
        });
        
        setPerformanceSummary(summary);
      } catch (error) {
        console.error('Error in handleSetCurrentStudent:', error);
        toast({
          title: "Error loading student data",
          description: "Could not load the selected student's information",
          variant: "destructive",
        });
      }
    }
  };
  
  const refreshData = async () => {
    await loadGuardianData();
  };
  
  useEffect(() => {
    if (user) {
      loadGuardianData();
    } else {
      setGuardian(null);
      setLinkedStudents([]);
      setCurrentStudent(null);
      setAlerts([]);
      setPerformanceSummary(null);
    }
  }, [user]);
  
  const value = {
    guardian,
    isLoading,
    linkedStudents,
    currentStudent,
    alerts,
    unreadAlertsCount,
    performanceSummary,
    setCurrentStudent: handleSetCurrentStudent,
    refreshData,
    isGuardian,
  };
  
  return (
    <GuardianContext.Provider value={value}>
      {loadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md">
          <p className="text-red-700 dark:text-red-400">{loadError}</p>
          <button 
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
            onClick={() => loadGuardianData()}
          >
            Try again
          </button>
        </div>
      )}
      {children}
    </GuardianContext.Provider>
  );
};

export const useGuardian = (): GuardianContextType => {
  const context = useContext(GuardianContext);
  if (context === undefined) {
    throw new Error('useGuardian must be used within a GuardianProvider');
  }
  return context;
};
