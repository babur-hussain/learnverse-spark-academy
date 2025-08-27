import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ComingSoonInline } from '@/components/ErrorPage';

// Mock data for study groups
const mockStudyGroups = [
  { 
    id: '1', 
    name: 'Calculus Study Group', 
    description: 'For students preparing for the calculus exam' 
  },
  { 
    id: '2', 
    name: 'Physics Lab Group', 
    description: 'Preparing for physics lab experiments' 
  },
  { 
    id: '3', 
    name: 'Data Structures Group', 
    description: 'For students working on data structures assignments' 
  },
];

const StudyGroups = () => {
  const [groups, setGroups] = useState(mockStudyGroups);
  const { toast } = useToast();

  useEffect(() => {
    // We'll use mock data for now until Supabase types are updated
    setGroups(mockStudyGroups);
    
    // Commented out until Supabase schema is updated
    // const fetchStudyGroups = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('study_groups')
    //       .select('*');
    //
    //     if (error) throw error;
    //     setGroups(data);
    //   } catch (error) {
    //     toast({
    //       title: 'Error',
    //       description: 'Failed to load study groups',
    //       variant: 'destructive'
    //     });
    //   }
    // };
    // 
    // fetchStudyGroups();
  }, []);

  const createStudyGroup = () => {
    toast({
      title: '',
      description: <ComingSoonInline message="Study group creation feature will be available shortly." />,
      duration: 4000
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Study Groups</CardTitle>
        <Button onClick={createStudyGroup}>
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No study groups found. Create one to get started!
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div key={group.id} className="border rounded p-4">
                <h3 className="font-semibold">{group.name}</h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyGroups;
