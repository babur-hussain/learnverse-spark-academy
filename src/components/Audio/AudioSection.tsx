import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import SearchBar from '@/components/UI/SearchBar';
import { Headphones, Calendar, Star, Share2, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AudioSection = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch colleges
  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch courses for selected class or college
  const { data: courses = [] } = useQuery({
    queryKey: ['courses', selectedClass, selectedCollege],
    queryFn: async () => {
      if (selectedClass) {
        const { data, error } = await supabase
          .from('class_subjects')
          .select('subject_id, subjects(id, title)')
          .eq('class_id', selectedClass);
        if (error) throw error;
        return (data || []).map(cs => cs.subjects);
      } else if (selectedCollege) {
        const { data, error } = await supabase
          .from('college_courses')
          .select('course_id, courses(id, title)')
          .eq('college_id', selectedCollege);
        if (error) throw error;
        return (data || []).map(cc => cc.courses);
      }
      return [];
    },
    enabled: !!selectedClass || !!selectedCollege
  });

  // Fetch audio files for selected class/college and course
  const { data: audioFiles = [], isLoading } = useQuery({
    queryKey: ['audio_files', selectedClass, selectedCollege, selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from('audio_files')
        .select('*')
        .order('created_at', { ascending: false });
      if (selectedClass) query = query.eq('class_id', selectedClass);
      if (selectedCollege) query = query.eq('college_id', selectedCollege);
      if (selectedCourse) query = query.eq('course_id', selectedCourse);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Filter audio files by search query
  const filteredAudio = audioFiles.filter(audio =>
    audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (audio.description && audio.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audio Library</h1>
          <p className="text-muted-foreground">Listen to voice notes and audiobooks by class, college, and course</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <SearchBar 
            placeholder="Search audio..."
            onSearch={(query) => setSearchQuery(query)}
          />
          <Select value={selectedClass} onValueChange={value => { setSelectedClass(value); setSelectedCollege(''); setSelectedCourse(''); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCollege} onValueChange={value => { setSelectedCollege(value); setSelectedClass(''); setSelectedCourse(''); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select College" />
            </SelectTrigger>
            <SelectContent>
              {colleges.map(college => (
                <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!(selectedClass || selectedCollege)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Audio</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {isLoading ? (
              <div>Loading...</div>
            ) : filteredAudio.length === 0 ? (
              <div>No audio files found.</div>
            ) : filteredAudio.map((audio) => (
              <Card key={audio.id}>
                <CardHeader>
                  <CardTitle>{audio.title}</CardTitle>
                  <CardDescription>{audio.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <audio controls className="w-full">
                    <source src={audio.file_path} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                    <Headphones className="h-4 w-4" />
                    <span>{audio.duration}</span>
                    <Calendar className="h-4 w-4 ml-4" />
                    <span>{new Date(audio.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={audio.file_path} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Star className="h-4 w-4 text-yellow-400" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AudioSection; 