import React, { useRef, useState, useEffect, DragEvent } from 'react';
import apiClient from '@/integrations/api/client';
import { uploadFileToS3 } from '@/integrations/s3/upload';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { FolderPlus, Upload, File as FileIcon, Folder as FolderIcon, Loader2, X, Trash2, Pencil, Download, Move, Upload as UploadIcon, FilePlus, FileText, FileImage, FileVideo, FileAudio, FileArchive, BookOpen } from 'lucide-react';
import PDFLink from '@/components/UI/PDFLink';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent } from '@/components/UI/dialog';
import { Card } from '@/components/UI/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/UI/progress';

interface CourseResourceManagerProps {
  courseId: string;
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

// Helper to build a tree from flat resource list
function buildResourceTree(resources: ResourceNode[]): ResourceNode[] {
  const root: { [key: string]: ResourceNode } = {};
  const nodes: { [key: string]: ResourceNode } = {};
  resources.forEach(res => {
    nodes[res.path] = { ...res, children: [] };
  });
  Object.values(nodes).forEach(node => {
    const parentPath = node.path.split('/').slice(0, -1).join('/');
    if (parentPath && nodes[parentPath]) {
      nodes[parentPath].children!.push(node);
    } else {
      root[node.path] = node;
    }
  });
  return Object.values(root);
}

// Helper to recursively collect all files from drag-and-drop
async function getAllFileEntries(dataTransferItemList: DataTransferItemList): Promise<File[]> {
  let fileEntries: File[] = [];
  const queue: any[] = [];
  for (let i = 0; i < dataTransferItemList.length; i++) {
    const entry = dataTransferItemList[i].webkitGetAsEntry();
    if (entry) queue.push(entry);
  }
  while (queue.length > 0) {
    const entry = queue.shift();
    if (entry.isFile) {
      await new Promise<void>(resolve => {
        entry.file((file: File) => {
          fileEntries.push(file);
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      await new Promise<void>(resolve => {
        const dirReader = entry.createReader();
        dirReader.readEntries((entries: any[]) => {
          queue.push(...entries);
          resolve();
        });
      });
    }
  }
  return fileEntries;
}



function getFileIcon(extension: string) {
  switch (extension) {
    case 'pdf':
      return <FileText size={36} className="text-red-500 group-hover:text-red-700" />;
    case 'doc':
    case 'docx':
      return <FileText size={36} className="text-blue-500 group-hover:text-blue-700" />;
    case 'xls':
    case 'xlsx':
      return <FileText size={36} className="text-green-500 group-hover:text-green-700" />;
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
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return <FileVideo size={36} className="text-purple-500 group-hover:text-purple-700" />;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <FileAudio size={36} className="text-orange-500 group-hover:text-orange-700" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FileArchive size={36} className="text-yellow-500 group-hover:text-yellow-700" />;
    case 'txt':
      return <FileText size={36} className="text-gray-500 group-hover:text-gray-700" />;
    default:
      return <FileIcon size={36} className="text-indigo-500 group-hover:text-indigo-700" />;
  }
}

const ResourceTile = ({ node, onView }) => {
  const ext = node.type === 'file' ? node.name.split('.').pop()?.toLowerCase() : '';
  return (
    <Card
      className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center transition hover:shadow-lg cursor-pointer group h-36"
      onClick={() => node.type === 'file' && node.url ? onView(node) : undefined}
      tabIndex={0}
      role="button"
      title={node.name}
    >
      <div className="mb-2">
        {node.type === 'folder'
          ? <FolderIcon size={36} className="text-indigo-500 group-hover:text-indigo-700" />
          : getFileIcon(ext || '')}
      </div>
      <div className="font-medium text-center text-xs break-all w-full" title={node.name}>{node.name}</div>
      {node.type === 'file' && node.url && (
        <div className="mt-2 text-xs text-indigo-600 group-hover:underline">View Online</div>
      )}
    </Card>
  );
};

const ResourceTree: React.FC<{ nodes: ResourceNode[], parentPath: string, onView: (node: ResourceNode) => void }> = ({ nodes, parentPath, onView }) => {
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});
  const handleToggle = (path: string) => {
    setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };
  // Normalize parent path for robust matching
  const normalize = (p: string) => p.replace(/\\/g, '/').replace(/(^\/|\/$)/g, '');
  const normParent = normalize(parentPath);
  // Only show direct children of parentPath
  const children = nodes.filter(n => {
    const nodeParent = normalize(n.path.split('/').slice(0, -1).join('/'));
    return nodeParent === normParent;
  });
  return (
    <div className="space-y-2">
      {children.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1).map(node => (
        <div key={node.path} className="ml-2">
          {node.type === 'folder' ? (
            <div>
              <div className="flex items-center cursor-pointer font-semibold text-indigo-700" onClick={() => handleToggle(node.path)}>
                <FolderIcon size={20} className="mr-1" />
                <span>{node.name}</span>
                <span className="ml-1">{openFolders[node.path] ? '▼' : '▶'}</span>
              </div>
              {openFolders[node.path] && (
                <div className="ml-4 border-l border-gray-200 pl-2">
                  <ResourceTree nodes={nodes} parentPath={node.path} onView={onView} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-6">
              {getFileIcon(node.name.split('.').pop()?.toLowerCase() || '')}
              <span className="break-all text-sm">{node.name}</span>
              <button className="text-indigo-600 underline ml-2" onClick={() => onView(node)}>View Online</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const CourseResourceManager: React.FC<CourseResourceManagerProps> = ({ courseId }) => {
  const [resources, setResources] = useState<ResourceNode[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<ResourceNode | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ResourceNode | null>(null);
  const [moveTarget, setMoveTarget] = useState<ResourceNode | null>(null);
  const [moveDest, setMoveDest] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState({ uploaded: 0, total: 0 });
  const [isDragActive, setIsDragActive] = useState(false);

  // Helper to upsert resource by path
  const upsertResource = async (data: any) => {
    try {
      const response = await apiClient.get('/api/admin/resources', { 
        params: { course_id: courseId, path: data.path } 
      });
      const existing = response.data;
      
      const payload = { ...data, title: data.title || data.name };
      
      if (existing && existing.length > 0) {
        const id = existing[0]._id || existing[0].id;
        return await apiClient.put(`/api/admin/resources/${id}`, payload);
      } else {
        return await apiClient.post('/api/admin/resources', payload);
      }
    } catch (error) {
      console.error('Upsert failed:', error);
      throw error;
    }
  };

  // Fetch resources for this course
  const fetchResources = async () => {
    try {
      const response = await apiClient.get(`/api/admin/resources`, { params: { course_id: courseId } });
      setResources(response.data as ResourceNode[]);
      console.log('Fetched resources:', response.data);
    } catch (error) {
      console.error('Failed to fetch resources', error);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line
  }, [courseId]);

  // Handle file upload (single or multiple files into currentPath)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    let uploaded = 0;
    let total = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    setUploadProgress({ uploaded: 0, total });
    try {
      for (const file of Array.from(files)) {
        const uploadPath = currentPath ? `${currentPath}/${file.name}` : file.name;
        const storagePath = `${courseId}/${uploadPath}`;
        // Upload to 'courses' bucket
        await uploadFileToS3(file, 'uploads');
        uploaded += file.size;
        setUploadProgress({ uploaded, total });
        // Get public URL
        const publicUrl = `${import.meta.env.VITE_API_BASE_URL}/api/storage/public/${storagePath}`;
        // Insert metadata in DB
        await upsertResource({
          course_id: courseId,
          path: uploadPath,
          name: file.name,
          title: file.name,
          type: 'file',
          size: file.size,
          url: publicUrl,
          mime_type: file.type,
        });
        // Insert folders in the path if not present
        const folders = uploadPath.split('/').slice(0, -1);
        let folderPath = '';
        for (const folder of folders) {
          folderPath = folderPath ? `${folderPath}/${folder}` : folder;
          await upsertResource({
            course_id: courseId,
            path: folderPath,
            name: folder,
            title: folder,
            type: 'folder',
          });
        }
      }
      setUploadProgress({ uploaded: 0, total: 0 });
      fetchResources();
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({ title: 'Upload error', description: err.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Update handleFolderUpload to use folderInputRef
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    let uploaded = 0;
    let total = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    setUploadProgress({ uploaded: 0, total });
    try {
      // Collect all unique folder paths from files
      const folderSet = new Set<string>();
      for (const file of Array.from(files)) {
        const relativePath = normalize((file as any).webkitRelativePath || file.name);
        const folders = relativePath.split('/').slice(0, -1);
        let folderPath = '';
        for (const folder of folders) {
          folderPath = folderPath ? `${folderPath}/${folder}` : folder;
          folderSet.add(normalize(folderPath));
        }
      }
      // Insert all unique folders into the database (up to 10 levels deep)
      for (const folderPath of Array.from(folderSet)) {
        const folderName = folderPath.split('/').pop() || folderPath;
        await upsertResource({
          course_id: courseId,
          path: normalize(folderPath),
          name: folderName,
          title: folderName,
          type: 'folder',
        });
      }
      
      // Now upload files as before
      for (const file of Array.from(files)) {
        const relativePath = normalize((file as any).webkitRelativePath || file.name);
        const storagePath = `${courseId}/${relativePath}`;
        // Upload to 'courses' bucket
        await uploadFileToS3(file, 'uploads');
        uploaded += file.size;
        setUploadProgress({ uploaded, total });
        const publicUrl = `${import.meta.env.VITE_API_BASE_URL}/api/storage/public/${storagePath}`;
        await upsertResource({
          course_id: courseId,
          path: relativePath,
          name: file.name,
          title: file.name,
          type: 'file',
          size: file.size,
          url: publicUrl,
          mime_type: file.type,
        });
      }
      setUploadProgress({ uploaded: 0, total: 0 });
      // Force UI refresh after upload
      await fetchResources();
    } catch (err: any) {
      console.error('Folder upload error:', err);
    } finally {
      setIsUploading(false);
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  // Handle new folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const folderPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
    await upsertResource({
      course_id: courseId,
      path: folderPath,
      name: newFolderName,
      title: newFolderName,
      type: 'folder',
    });
    setNewFolderName('');
    fetchResources();
  };

  // File preview handler
  const handlePreview = (node: ResourceNode) => {
    setPreviewUrl(node.url || null);
    setPreviewType(node.mime_type || '');
  };

  // Download handler
  const handleDownload = (node: ResourceNode) => {
    if (node.url) {
      if (node.url.toLowerCase().includes('.pdf')) {
        // PDF will be handled by PDFLink component
        return;
      } else {
        window.open(node.url, '_blank');
      }
    }
  };

  const updateResourcePath = async (oldPath: string, newPath: string, newName?: string) => {
    const res = await apiClient.get('/api/admin/resources', { params: { course_id: courseId, path: oldPath } });
    if (res.data && res.data.length > 0) {
      const id = res.data[0]._id || res.data[0].id;
      const payload: any = { path: newPath };
      if (newName) {
        payload.name = newName;
        payload.title = newName;
      }
      await apiClient.put(`/api/admin/resources/${id}`, payload);
    }
  };

  // Rename handler
  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      const oldPath = renameTarget.path;
      const newPath = oldPath.split('/').slice(0, -1).concat(renameValue).join('/');
      
      await updateResourcePath(oldPath, newPath, renameValue);
      
      // If folder, update all children paths
      if (renameTarget.type === 'folder') {
        const childrenRes = await apiClient.get('/api/admin/resources', { params: { course_id: courseId } });
        if (childrenRes.data) {
          const children = childrenRes.data.filter((c: any) => c.path && c.path.startsWith(`${oldPath}/`));
          for (const child of children) {
            const childNewPath = child.path.replace(oldPath + '/', newPath + '/');
            const childId = child._id || child.id;
            await apiClient.put(`/api/admin/resources/${childId}`, { path: childNewPath });
          }
        }
      }
    } catch (e) {
      console.error('Rename error', e);
    }
    setRenameTarget(null);
    setRenameValue('');
    fetchResources();
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const deleteByPath = async (p: string) => {
        const res = await apiClient.get('/api/admin/resources', { params: { course_id: courseId, path: p } });
        if (res.data && res.data.length > 0) {
          const id = res.data[0]._id || res.data[0].id;
          await apiClient.delete(`/api/admin/resources/${id}`);
        }
      };

      await deleteByPath(deleteTarget.path);
      
      if (deleteTarget.type === 'folder') {
        const childrenRes = await apiClient.get('/api/admin/resources', { params: { course_id: courseId } });
        if (childrenRes.data) {
          const children = childrenRes.data.filter((c: any) => c.path && c.path.startsWith(`${deleteTarget.path}/`));
          for (const child of children) {
            const childId = child._id || child.id;
            await apiClient.delete(`/api/admin/resources/${childId}`);
          }
        }
      }
      // Optionally, delete from storage if file
      if (deleteTarget.type === 'file') {
        await apiClient.delete('/api/storage/files', { data: { paths: [`courses/${courseId}/${deleteTarget.path}`] } });
      }
    } catch (e) {
      console.error('Delete error', e);
    }
    setDeleteTarget(null);
    fetchResources();
  };

  // Move handler
  const handleMove = async () => {
    if (!moveTarget || !moveDest) return;
    try {
      const oldPath = moveTarget.path;
      const newPath = moveDest ? `${moveDest}/${moveTarget.name}` : moveTarget.name;
      
      await updateResourcePath(oldPath, newPath);
      
      // If folder, update all children paths
      if (moveTarget.type === 'folder') {
        const childrenRes = await apiClient.get('/api/admin/resources', { params: { course_id: courseId } });
        if (childrenRes.data) {
          const children = childrenRes.data.filter((c: any) => c.path && c.path.startsWith(`${oldPath}/`));
          for (const child of children) {
            const childNewPath = child.path.replace(oldPath + '/', newPath + '/');
            const childId = child._id || child.id;
            await apiClient.put(`/api/admin/resources/${childId}`, { path: childNewPath });
          }
        }
      }
    } catch (e) {
      console.error('Move error', e);
    }
    setMoveTarget(null);
    setMoveDest('');
    fetchResources();
  };

  // Drag-and-drop upload handler
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    setIsUploading(true);
    let uploaded = 0;
    let total = 0;
    try {
      const files = await getAllFileEntries(e.dataTransfer.items);
      total = files.reduce((sum, file) => sum + file.size, 0);
      setUploadProgress({ uploaded: 0, total });
      for (const file of files) {
        const relativePath = (file as any).webkitRelativePath || file.name;
        const uploadPath = currentPath ? `${currentPath}/${relativePath}` : relativePath;
        const storagePath = `${courseId}/${uploadPath}`;
        // Upload to 'courses' bucket
        await uploadFileToS3(file, 'uploads');
        uploaded += file.size;
        setUploadProgress({ uploaded, total });
        // Get public URL
        const publicUrl = `${import.meta.env.VITE_API_BASE_URL}/api/storage/public/${storagePath}`;

        // Insert metadata in DB
        await upsertResource({
          course_id: courseId,
          path: uploadPath,
          name: file.name,
          title: file.name,
          type: 'file',
          size: file.size,
          url: publicUrl,
          mime_type: file.type,
        });
        
        // Insert folders in the path if not present
        const folders = uploadPath.split('/').slice(0, -1);
        let folderPath = '';
        for (const folder of folders) {
          folderPath = folderPath ? `${folderPath}/${folder}` : folder;
          await upsertResource({
            course_id: courseId,
            path: folderPath,
            name: folder,
            title: folder,
            type: 'folder',
          });
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({ title: 'Upload error', description: err.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      fetchResources();
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  // Simple explorer: show only direct children of currentPath
  const normalize = (p: string) => (p || '').replace(/\\/g, '/').replace(/(^\/|\/$)/g, '');
  const normCurrent = normalize(currentPath);
  const children = resources.filter(n => {
    const nodeParent = normalize(n.path.split('/').slice(0, -1).join('/'));
    return nodeParent === normCurrent;
  });
  // Debug: log which children are being displayed in the grid
  console.log('Grid view for path:', currentPath, 'Children:', children.map(c => c.path));
  const isRoot = !currentPath;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Manage Course Resources</h1>
      <div
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'}`}
        onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
        onDrop={async e => { e.preventDefault(); setIsDragActive(false); /* ...existing drop logic... */ }}
        style={{ minHeight: 100 }}
      >
        <div className="text-lg font-semibold mb-2">Drag & drop files or folders here to upload</div>
        <div className="text-sm text-muted-foreground">Or use the buttons below to upload</div>
      </div>
      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        <Button asChild size="sm">
          <label>
            <UploadIcon size={16} className="mr-1" /> Upload Folder
            <Input
              type="file"
              {...{ webkitdirectory: "true", directory: "true" } as any}
              multiple
              className="hidden"
              ref={folderInputRef}
              onChange={handleFolderUpload}
              disabled={isUploading}
            />
          </label>
        </Button>
        <Button asChild size="sm">
          <label>
            <FilePlus size={16} className="mr-1" /> Upload File
            <Input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </Button>
        <Input
          placeholder="New folder name"
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
          className="w-40"
          disabled={isUploading}
        />
        <Button size="sm" onClick={handleCreateFolder} disabled={isUploading || !newFolderName.trim()}>
          <FolderPlus size={16} className="mr-1" /> Create Folder
        </Button>
        {isUploading && <Loader2 className="animate-spin ml-2" size={18} />}
      </div>
      {uploadProgress.total > 0 && (
        <div className="mb-4 max-w-xl mx-auto">
          <Progress value={uploadProgress.uploaded / uploadProgress.total * 100} />
          <div className="text-center text-sm mt-1">
            Uploading {(uploadProgress.uploaded / 1024 / 1024).toFixed(2)} MB of {(uploadProgress.total / 1024 / 1024).toFixed(2)} MB ({((uploadProgress.uploaded / uploadProgress.total) * 100).toFixed(0)}%)
          </div>
        </div>
      )}
      {!isRoot && (
        <button className="mb-4 text-indigo-600 underline" onClick={() => setCurrentPath(currentPath.split('/').slice(0, -1).join('/'))}>
          ← Back
        </button>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-4">
        {children.length === 0 && <div className="col-span-full text-center text-gray-400">No files or folders</div>}
        {children.map(node => (
          <div key={node.path} className="flex flex-col items-center cursor-pointer group" onClick={() => node.type === 'folder' ? setCurrentPath(node.path) : node.type === 'file' && node.url ? setPreviewUrl(node.url) : undefined}>
            <div className="mb-2">
              {node.type === 'folder'
                ? <FolderIcon size={48} className="text-indigo-500 group-hover:text-indigo-700" />
                : getFileIcon(node.name.split('.').pop()?.toLowerCase() || '')}
            </div>
            <div className="font-medium text-center text-xs break-all w-full" title={node.name}>{node.name}</div>
            {node.type === 'file' && node.url && (
              <div className="mt-1 text-xs text-indigo-600 group-hover:underline">View Online</div>
            )}
          </div>
        ))}
      </div>
      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={v => !v && setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          {previewType?.startsWith('image') && previewUrl && (
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] mx-auto" />
          )}
          {previewType?.startsWith('video') && previewUrl && (
            <video src={previewUrl} controls className="max-w-full max-h-[70vh] mx-auto" />
          )}
          {previewType === 'application/pdf' && previewUrl && (
            <iframe src={previewUrl} title="PDF Preview" className="w-full h-[70vh]" />
          )}
          {!previewType && previewUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">Open File</a>
          )}
        </DialogContent>
      </Dialog>
      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={v => !v && setRenameTarget(null)}>
        <DialogContent>
          <div className="mb-2 font-semibold">Rename {renameTarget?.type}</div>
          <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} className="mb-2" />
          <Button onClick={handleRename} disabled={!renameValue.trim()}>Rename</Button>
        </DialogContent>
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent>
          <div className="mb-2 font-semibold">Delete {deleteTarget?.type}</div>
          <div>Are you sure you want to delete <b>{deleteTarget?.name}</b>?</div>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogContent>
      </Dialog>
      {/* Move Dialog */}
      <Dialog open={!!moveTarget} onOpenChange={v => !v && setMoveTarget(null)}>
        <DialogContent>
          <div className="mb-2 font-semibold">Move {moveTarget?.type}</div>
          <div>Select destination folder:</div>
          <select value={moveDest} onChange={e => setMoveDest(e.target.value)} className="w-full mb-2">
            <option value="">Root</option>
            {resources.filter(r => r.type === 'folder' && r.path !== moveTarget?.path).map(folder => (
              <option key={folder.path} value={folder.path}>{folder.path}</option>
            ))}
          </select>
          <Button onClick={handleMove} disabled={!moveDest}>Move</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 