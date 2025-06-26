<<<<<<< HEAD
=======

>>>>>>> main
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import Navbar from '@/components/Layout/Navbar';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import SubjectsList from '@/components/Admin/SubjectManager/SubjectsList';
import ChaptersList from '@/components/Admin/SubjectManager/ChaptersList';
<<<<<<< HEAD
=======
import ResourcesList from '@/components/Admin/SubjectManager/ResourcesList';
>>>>>>> main
import { FeaturedSubjectsList } from '@/components/Admin/SubjectManager/FeaturedSubjectsList';

const SubjectManagement = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
<<<<<<< HEAD
=======
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
>>>>>>> main
  const isMobile = useIsMobile();

  return (
    <AdminRoleGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Subject Management</h1>

          <Tabs defaultValue="subjects" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="featured">Featured Subjects</TabsTrigger>
              <TabsTrigger value="chapters" disabled={!selectedSubjectId}>Chapters</TabsTrigger>
<<<<<<< HEAD
=======
              <TabsTrigger value="resources">Resources</TabsTrigger>
>>>>>>> main
            </TabsList>
            
            <TabsContent value="subjects" className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <SubjectsList 
                onSelectSubject={setSelectedSubjectId}
                selectedSubjectId={selectedSubjectId}
              />
            </TabsContent>
            
            <TabsContent value="featured" className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <FeaturedSubjectsList />
            </TabsContent>
            
            <TabsContent value="chapters" className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              {selectedSubjectId ? (
<<<<<<< HEAD
                <ChaptersList subjectId={selectedSubjectId} />
=======
                <ChaptersList 
                  subjectId={selectedSubjectId} 
                  onSelectChapter={setSelectedChapterId}
                />
>>>>>>> main
              ) : (
                <div className="text-center py-6">
                  Please select a subject first
                </div>
              )}
            </TabsContent>
<<<<<<< HEAD
=======

            <TabsContent value="resources" className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <ResourcesList 
                subjectId={selectedSubjectId}
                chapterId={selectedChapterId}
              />
            </TabsContent>
>>>>>>> main
          </Tabs>
        </main>

        {isMobile && <MobileFooter />}
      </div>
    </AdminRoleGuard>
  );
};

export default SubjectManagement;
