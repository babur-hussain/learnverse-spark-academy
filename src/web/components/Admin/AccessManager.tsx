
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/UI/table';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/UI/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Trash2, Plus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface NoteFile {
  id: string;
  title: string;
  file_path: string;
}

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  role: string;
}

interface NoteAccess {
  id: string;
  note_id: string;
  role: string;
  access_level: string;
  created_at: string;
  note_title?: string;
}

const AccessManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newAccess, setNewAccess] = useState({
    note_id: '',
    role: '',
    access_level: 'view'
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ['notes_for_access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('note_files')
        .select('id, title, file_path')
        .order('title');
      
      if (error) {
        toast({
          title: 'Error fetching notes',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data as NoteFile[];
    }
  });

  // Fetch profiles for user selection
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, role')
        .order('username');
      
      if (error) {
        toast({
          title: 'Error fetching profiles',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data as Profile[];
    }
  });

  // Fetch note access entries
  const { data: noteAccess = [], isLoading } = useQuery({
    queryKey: ['note_access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('note_access')
        .select(`
          id,
          note_id,
          role,
          access_level,
          created_at,
          note_files (
            title
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching note access',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      // Transform the data to flatten it
      return data.map(access => ({
        ...access,
        note_title: access.note_files ? access.note_files.title : 'Unknown Note'
      })) as NoteAccess[];
    }
  });

  // Create note access
  const createNoteAccess = useMutation({
    mutationFn: async (access: {
      note_id: string;
      role: string;
      access_level: string;
    }) => {
      // Check if this role already has access to this note
      const { data: existingAccess } = await supabase
        .from('note_access')
        .select('*')
        .eq('note_id', access.note_id)
        .eq('role', access.role);

      if (existingAccess && existingAccess.length > 0) {
        throw new Error('This role already has access to this note. Please edit the existing access instead.');
      }

      const { data, error } = await supabase
        .from('note_access')
        .insert([{
          note_id: access.note_id,
          role: access.role,
          access_level: access.access_level
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Access granted',
        description: 'The note access has been granted successfully.'
      });
      setNewAccess({ note_id: '', role: '', access_level: 'view' });
      queryClient.invalidateQueries({ queryKey: ['note_access'] });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error granting access',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete note access
  const deleteNoteAccess = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('note_access')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({
          title: 'Error revoking access',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Access revoked',
        description: 'The note access has been revoked successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['note_access'] });
    }
  });

  // Filter note access entries based on search query
  const filteredNoteAccess = noteAccess.filter(access => {
    const searchLower = searchQuery.toLowerCase();
    return (
      access.note_title.toLowerCase().includes(searchLower) ||
      access.role.toLowerCase().includes(searchLower) ||
      access.access_level.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateAccess = () => {
    createNoteAccess.mutate(newAccess);
  };

  const handleDialogOpen = (open: boolean) => {
    if (!open) {
      setNewAccess({ note_id: '', role: '', access_level: 'view' });
    }
    setDialogOpen(open);
  };

  const handleDeleteAccess = (accessId: string) => {
    if (confirm('Are you sure you want to revoke this access?')) {
      deleteNoteAccess.mutate(accessId);
    }
  };

  // Format role display
  const formatRole = (role: string) => {
    // Check if role is a UUID (likely a user ID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(role);
    
    if (isUuid) {
      const profile = profiles.find(p => p.id === role);
      if (profile) {
        return `User: ${profile.username || profile.full_name || 'Unknown'}`;
      }
      return `User: ${role.slice(0, 8)}...`;
    }
    
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-xl font-semibold">Manage Note Access</h2>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search access entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Grant Access
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Grant Note Access</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="note" className="text-sm font-medium">Select Note</label>
                  <Select
                    value={newAccess.note_id}
                    onValueChange={(value) => setNewAccess({ ...newAccess, note_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a note" />
                    </SelectTrigger>
                    <SelectContent>
                      {notes.map((note) => (
                        <SelectItem key={note.id} value={note.id}>
                          {note.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">Grant Access To</label>
                  <Select
                    value={newAccess.role}
                    onValueChange={(value) => setNewAccess({ ...newAccess, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role or user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">All Students</SelectItem>
                      <SelectItem value="educator">All Educators</SelectItem>
                      <SelectItem value="admin">All Admins</SelectItem>
                      
                      {profiles.length > 0 && (
                        <>
                          <SelectItem disabled value="">
                            ── Individual Users ──
                          </SelectItem>
                          
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.username || profile.full_name || profile.id.slice(0, 8)}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="accessLevel" className="text-sm font-medium">Access Level</label>
                  <Select
                    value={newAccess.access_level}
                    onValueChange={(value) => setNewAccess({ ...newAccess, access_level: value as 'view' | 'edit' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="edit">Edit Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateAccess}
                  disabled={!newAccess.note_id || !newAccess.role || !newAccess.access_level}
                  className="gradient-primary"
                >
                  Grant Access
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learn-purple"></div>
        </div>
      ) : filteredNoteAccess.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery ? (
            <p className="text-muted-foreground">No access entries matching your search</p>
          ) : (
            <p className="text-muted-foreground">No access entries found. Grant access to notes to get started.</p>
          )}
        </div>
      ) : (
        <Table>
          <TableCaption>List of note access permissions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Note</TableHead>
              <TableHead>Granted To</TableHead>
              <TableHead>Access Level</TableHead>
              <TableHead>Date Granted</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNoteAccess.map((access) => (
              <TableRow key={access.id}>
                <TableCell className="font-medium">{access.note_title}</TableCell>
                <TableCell>{formatRole(access.role)}</TableCell>
                <TableCell>
                  {access.access_level === 'edit' ? (
                    <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Edit Access
                    </div>
                  ) : (
                    <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      View Only
                    </div>
                  )}
                </TableCell>
                <TableCell>{new Date(access.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteAccess(access.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AccessManager;
