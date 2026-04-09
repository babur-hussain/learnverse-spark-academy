
import React from 'react';
import { useGuardian } from '@/contexts/GuardianContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/UI/avatar';
import { Button } from '@/components/UI/button';
import { Card } from '@/components/UI/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { ScrollArea } from '@/components/UI/scroll-area';
import { Badge } from '@/components/UI/badge';

const StudentSelect: React.FC = () => {
  const { linkedStudents, currentStudent, setCurrentStudent } = useGuardian();
  
  if (linkedStudents.length === 0) {
    return null;
  }
  
  if (linkedStudents.length === 1) {
    return (
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-10 w-10 border border-primary/10">
          {currentStudent?.student?.avatar_url ? (
            <AvatarImage src={currentStudent.student.avatar_url} alt={currentStudent.student?.full_name || 'Student'} />
          ) : (
            <AvatarFallback>
              {currentStudent?.student?.full_name?.charAt(0) || 'S'}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium">{currentStudent?.student?.full_name}</div>
          <div className="text-xs text-muted-foreground">
            {currentStudent?.relationship_type || 'Student'}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="mb-6">
      <ScrollArea className="w-full">
        <Tabs defaultValue={currentStudent?.student_id} onValueChange={(value) => {
          const student = linkedStudents.find(s => s.student_id === value);
          if (student) {
            setCurrentStudent(student);
          }
        }}>
          <TabsList className="flex w-full overflow-auto py-2">
            {linkedStudents.map(student => (
              <TabsTrigger 
                key={student.student_id} 
                value={student.student_id}
                className="flex flex-col items-center py-2 px-4"
              >
                <Avatar className="h-12 w-12 mb-2">
                  {student.student?.avatar_url ? (
                    <AvatarImage src={student.student.avatar_url} alt={student.student?.full_name || 'Student'} />
                  ) : (
                    <AvatarFallback>
                      {student.student?.full_name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-sm font-medium whitespace-nowrap">
                  {student.student?.full_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {student.relationship_type}
                </div>
                {student.verification_status !== 'verified' && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {student.verification_status}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </ScrollArea>
    </Card>
  );
};

export default StudentSelect;
