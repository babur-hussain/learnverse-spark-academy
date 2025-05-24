import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import AuthGuard from '@/components/Layout/AuthGuard';
import AdminRoleGuard from '@/components/Layout/AdminRoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Video, 
  Users, 
  Settings, 
  Tags,
  BookMarked,
  BookOpenCheck,
  Goal,
  FileEdit,
  Book
} from 'lucide-react';

const AdminPage = () => {
  const isMobile = useIsMobile();

  const adminTools = [
    {
      title: "Course Management",
      description: "Create and manage courses",
      icon: <BookOpen className="h-6 w-6" />,
      link: "/course-management"
    },
    {
      title: "Subject Management",
      description: "Manage subjects, chapters and resources",
      icon: <Book className="h-6 w-6" />,
      link: "/subject-management"
    },
    {
      title: "Video Management",
      description: "Upload and organize video content",
      icon: <Video className="h-6 w-6" />,
      link: "/video-management"
    },
    {
      title: "Test Management",
      description: "Create tests and quizzes",
      icon: <BookOpenCheck className="h-6 w-6" />,
      link: "/test-management"
    },
    {
      title: "Simple Content",
      description: "Manage website content easily",
      icon: <FileEdit className="h-6 w-6" />,
      link: "/simple-content"
    },
    {
      title: "Access Control",
      description: "Manage user roles and permissions",
      icon: <Users className="h-6 w-6" />,
      link: "/admin/access"
    },
    {
      title: "Category Management",
      description: "Organize content categories",
      icon: <Tags className="h-6 w-6" />,
      link: "/admin/categories"
    },
    {
      title: "Learning Goals",
      description: "Define learning objectives",
      icon: <Goal className="h-6 w-6" />,
      link: "/admin/goals"
    },
    {
      title: "Notes Management",
      description: "Manage study notes and materials",
      icon: <BookMarked className="h-6 w-6" />,
      link: "/admin/notes"
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: <Settings className="h-6 w-6" />,
      link: "/admin/settings"
    }
  ];

  return (
    <AuthGuard>
      <AdminRoleGuard>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Navbar />
          
          <main className="flex-1 container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminTools.map((tool, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      {tool.icon}
                      {tool.title}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={tool.link}>
                        Access {tool.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
          
          {isMobile ? (
            <MobileFooter />
          ) : (
            <footer className="py-8 bg-gray-100 dark:bg-gray-800">
              <div className="mx-auto px-4 text-center">
                <p className="text-muted-foreground">© 2025 LearnVerse: Spark Academy. All rights reserved.</p>
              </div>
            </footer>
          )}
        </div>
      </AdminRoleGuard>
    </AuthGuard>
  );
};

export default AdminPage;
