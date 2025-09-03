import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Plus, FileText, FileImage, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ComingSoonInline } from '@/components/ErrorPage';

// Mock data for shared resources
const mockResources = [
  { 
    id: '1', 
    title: 'Calculus Cheat Sheet', 
    resource_type: 'note',
    user: { name: 'Alex Johnson' }
  },
  { 
    id: '2', 
    title: 'Physics Formulas', 
    resource_type: 'pdf',
    user: { name: 'Maria Garcia' }
  },
  { 
    id: '3', 
    title: 'Data Structures Flashcards', 
    resource_type: 'flashcards',
    user: { name: 'Tami Wong' }
  },
];

const SharedResources = () => {
  const [resources, setResources] = useState(mockResources);
  const { toast } = useToast();

  useEffect(() => {
    // We'll use mock data for now until Supabase types are updated
    setResources(mockResources);
    
    // Commented out until Supabase schema is updated
    // const fetchSharedResources = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('shared_resources')
    //       .select('*');
    //
    //     if (error) throw error;
    //     setResources(data);
    //   } catch (error) {
    //     toast({
    //       title: 'Error',
    //       description: 'Failed to load shared resources',
    //       variant: 'destructive'
    //     });
    //   }
    // };
    // 
    // fetchSharedResources();
  }, []);

  const uploadResource = () => {
    toast({
      title: '',
      description: <ComingSoonInline message="Resource upload feature will be available shortly." />,
      duration: 4000
    });
  };

  // Function to get appropriate icon based on resource type
  const getResourceIcon = (type) => {
    switch (type) {
      case 'note':
        return <FileText className="mr-2 text-blue-500" />;
      case 'flashcards':
        return <FileImage className="mr-2 text-green-500" />;
      default:
        return <File className="mr-2 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Shared Resources</CardTitle>
        <Button onClick={uploadResource}>
          <Plus className="mr-2 h-4 w-4" /> Upload Resource
        </Button>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No shared resources found. Upload your first resource!
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div key={resource.id} className="border rounded p-4 flex items-start">
                {getResourceIcon(resource.resource_type)}
                <div>
                  <h3 className="font-semibold">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{resource.resource_type}</p>
                  <p className="text-xs text-muted-foreground">Shared by: {resource.user?.name || 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedResources;
