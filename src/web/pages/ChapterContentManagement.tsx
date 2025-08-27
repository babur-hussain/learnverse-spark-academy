
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Layout/Navbar';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import ChapterContentManager from '@/components/Admin/SubjectManager/ChapterContentManager';
import { Button } from '@/components/UI/button';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';

const ChapterContentManagement = () => {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Fetch subject and chapter details
  const { data: subject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, title')
        .eq('id', subjectId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!subjectId,
  });

  const { data: chapter } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, title, description')
        .eq('id', chapterId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!chapterId,
  });

  const breadcrumbItems = [
    { label: 'Admin', href: '/admin' },
    { label: 'Subject Management', href: '/subject-management' },
    { label: subject?.title || 'Subject', href: `/subject-management?tab=chapters&subject=${subjectId}` },
    { label: chapter?.title || 'Chapter' }
  ];

  if (!subjectId || !chapterId) {
    return (
      <AdminRoleGuard>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Invalid Parameters</h1>
              <p className="text-muted-foreground mb-6">Subject ID and Chapter ID are required.</p>
              <Button onClick={() => navigate('/subject-management')}>
                Back to Subject Management
              </Button>
            </div>
          </main>
        </div>
      </AdminRoleGuard>
    );
  }

  return (
    <AdminRoleGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <BreadcrumbNav items={breadcrumbItems} />
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/subject-management?tab=chapters')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chapters
              </Button>
            </div>

            {subject && chapter ? (
              <ChapterContentManager
                chapterId={chapterId}
                chapterTitle={chapter.title}
                subjectId={subjectId}
              />
            ) : (
              <div>Loading chapter details...</div>
            )}
          </div>
        </main>

        {isMobile && <MobileFooter />}
      </div>
    </AdminRoleGuard>
  );
};

export default ChapterContentManagement;
