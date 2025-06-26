import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card } from '@/components/UI/card';
import SubjectsManager from './SubjectsManager';
import ChaptersManager from './ChaptersManager';
import NotesManager from './NotesManager';
import TagsManager from './TagsManager';
import AccessManager from './AccessManager';
import GoalsManager from './GoalsManager';
import { BookOpen, FileText, FolderTree, Tag, Users, Target, Video, Grid3X3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryManager } from './CategoryManager';
<<<<<<< HEAD
=======
import ClassesManager from './ClassesManager';
>>>>>>> main

const AdminNotesPanel = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Management System</h1>
      
      <Card className="p-6">
        <Tabs defaultValue="subjects">
<<<<<<< HEAD
          <TabsList className="mb-6 grid grid-cols-8 w-full max-w-4xl">
=======
          <TabsList className="mb-6 grid grid-cols-9 w-full max-w-5xl">
>>>>>>> main
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Subjects</span>
            </TabsTrigger>
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              <span>Chapters</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Notes</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Tags</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Access</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Goals</span>
            </TabsTrigger>
            <TabsTrigger value="video-management" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <Link to="/admin/videos">Video Mgmt</Link>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
<<<<<<< HEAD
=======
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Classes</span>
            </TabsTrigger>
>>>>>>> main
          </TabsList>

          <TabsContent value="subjects">
            <SubjectsManager onSelectSubject={setSelectedSubject} />
          </TabsContent>

          <TabsContent value="chapters">
            <ChaptersManager 
              selectedSubject={selectedSubject} 
              onSelectChapter={setSelectedChapter} 
              onSelectSubject={setSelectedSubject}
            />
          </TabsContent>

          <TabsContent value="notes">
            <NotesManager 
              selectedSubject={selectedSubject}
              selectedChapter={selectedChapter}
              onSelectSubject={setSelectedSubject}
              onSelectChapter={setSelectedChapter}
            />
          </TabsContent>

          <TabsContent value="tags">
            <TagsManager />
          </TabsContent>

          <TabsContent value="access">
            <AccessManager />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsManager />
          </TabsContent>

          <TabsContent value="video-management" className="text-center p-4">
            <div className="flex flex-col items-center justify-center">
              <p className="mb-4">Redirect to Video Management Page</p>
              <Link 
                to="/admin/videos" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Go to Video Management
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>
<<<<<<< HEAD
=======

          <TabsContent value="classes">
            <ClassesManager />
          </TabsContent>
>>>>>>> main
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminNotesPanel;
