import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Folder as FolderIcon, File as FileIcon, FileText, FileImage, FileVideo, BookOpen } from 'lucide-react';
import PDFLink from '@/components/UI/PDFLink';
import Navbar from '@/components/Layout/Navbar';
import { Dialog, DialogContent } from '@/components/UI/dialog';

interface Course {
  id: string;
  title: string;
  description: string;
  banner_url?: string;
  thumbnail_url?: string;
}

interface ResourceNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  url?: string;
  mime_type?: string;
  children?: ResourceNode[];
}

function getFileIcon(extension: string, type: string) {
  if (type === 'folder') return <FolderIcon size={36} className="text-indigo-500 group-hover:text-indigo-700" />;
  switch (extension) {
    case 'pdf':
      return <FileText size={36} className="text-red-500 group-hover:text-red-700" />;
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return <FileVideo size={36} className="text-purple-500 group-hover:text-purple-700" />;
    case 'epub':
    case 'mobi':
    case 'azw':
      return <BookOpen size={36} className="text-orange-500 group-hover:text-orange-700" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
      return <FileImage size={36} className="text-pink-500 group-hover:text-pink-700" />;
    case 'txt':
      return <FileText size={36} className="text-gray-500 group-hover:text-gray-700" />;
    default:
      return <FileIcon size={36} className="text-indigo-500 group-hover:text-indigo-700" />;
  }
}

const ResourceTile: React.FC<{ node: ResourceNode }> = ({ node }) => {
  const ext = node.type === 'file' ? node.name.split('.').pop()?.toLowerCase() : '';
  return (
    <Card
      className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center transition hover:shadow-lg cursor-pointer group h-36"
      onClick={() => {
        if (node.type === 'file' && node.url) {
          if (node.url.toLowerCase().includes('.pdf')) {
            // PDF will be handled by PDFLink component
            return;
          } else {
            window.open(node.url, '_blank');
          }
        }
      }}
      tabIndex={0}
      role="button"
      title={node.name}
    >
      <div className="mb-2">
        {getFileIcon(ext || '', node.type)}
      </div>
      <div className="font-medium text-center text-xs break-all w-full" title={node.name}>{node.name}</div>
      {node.type === 'file' && node.url && (
        node.url.toLowerCase().includes('.pdf') ? (
          <div className="mt-2">
            <PDFLink 
              url={node.url}
              title={node.name}
              variant="button"
              showDownloadButton={true}
            />
          </div>
        ) : (
          <div className="mt-2 text-xs text-indigo-600 group-hover:underline">View Online</div>
        )
      )}
    </Card>
  );
};

const normalize = (p: string) => p.replace(/\\/g, '/').replace(/(^\/|\/$)/g, '');

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<ResourceNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      if (!error && data) setCourse(data);
    };
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('course_resources')
        .select('*')
        .eq('course_id', courseId);
      if (!error && data) setResources(data);
    };
    setLoading(true);
    Promise.all([fetchCourse(), fetchResources()]).then(() => setLoading(false));
  }, [courseId]);

  const normCurrent = normalize(currentPath);
  const children = resources.filter(n => {
    const nodeParent = normalize(n.path.split('/').slice(0, -1).join('/'));
    return nodeParent === normCurrent;
  });
  const isRoot = !currentPath;

  if (loading) return <div className="py-16 text-center">Loading...</div>;
  if (!course) return <div className="py-16 text-center">Course not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-white">
      <Navbar />
      <div className="relative w-full h-64 flex items-end justify-start bg-gradient-to-r from-indigo-500 to-pink-400 rounded-b-3xl overflow-hidden mb-8">
        {course.banner_url && (
          <img src={course.banner_url} alt="Course Banner" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
        <div className="relative z-10 p-8">
          <h1 className="text-4xl font-bold text-white drop-shadow mb-2">{course.title}</h1>
          <p className="text-white/90 max-w-xl drop-shadow">{course.description}</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4">
        <Card className="mb-8 bg-white/80 shadow-lg">
          <CardTitle className="p-4 pb-0 text-2xl font-semibold text-indigo-700">Course Resources</CardTitle>
          <CardContent>
            {!isRoot && (
              <button className="mb-4 text-indigo-600 underline" onClick={() => setCurrentPath(currentPath.split('/').slice(0, -1).join('/'))}>
                ← Back
              </button>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-4">
              {children.length === 0 && <div className="col-span-full text-center text-gray-400">No files or folders</div>}
              {children.map(node => (
                <div key={node.path} className="flex flex-col items-center cursor-pointer group">
                  <div className="mb-2">
                    {node.type === 'folder'
                      ? <FolderIcon size={48} className="text-indigo-500 group-hover:text-indigo-700" onClick={() => setCurrentPath(node.path)} />
                      : getFileIcon(node.name.split('.').pop()?.toLowerCase() || '', node.type)}
                  </div>
                  <div className="font-medium text-center text-xs break-all w-full" title={node.name}>{node.name}</div>
                  {node.type === 'file' && node.url && (
                    node.url.toLowerCase().includes('.pdf') ? (
                      <div className="mt-1">
                        <PDFLink 
                          url={node.url}
                          title={node.name}
                          variant="button"
                          showDownloadButton={true}
                        />
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-indigo-600 group-hover:underline">
                        <button onClick={() => window.open(node.url, '_blank')}>View Online</button>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetailPage; 