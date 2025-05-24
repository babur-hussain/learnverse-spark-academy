
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useGuardian } from '@/contexts/GuardianContext';
import { AuthGuard } from '@/components/Layout/AuthGuard';
import TeacherCommunication from '@/components/Guardian/TeacherCommunication';

const TeacherCommunications = () => {
  const { currentStudent } = useGuardian();

  return (
    <AuthGuard>
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Teacher Communications</h1>
          
          {currentStudent ? (
            <TeacherCommunication />
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Please select a student to view teacher communications</p>
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  );
};

export default TeacherCommunications;
