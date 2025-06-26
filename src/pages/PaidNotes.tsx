
import React, { useState } from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import { NotePurchaseCard } from '@/components/UI/NotePurchaseCard';
import SearchBar from '@/components/UI/SearchBar';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';

const PaidNotes = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample notes data - in real app, this would come from Supabase
  const sampleNotes = [
    {
      id: '1',
      title: 'Advanced Data Structures & Algorithms Notes',
      description: 'Comprehensive notes covering advanced DSA concepts with examples and practice problems.',
      price: 299,
      file_type: 'pdf',
      file_size: 5242880, // 5MB
      download_count: 150,
      view_count: 320,
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'Machine Learning Complete Guide',
      description: 'Complete ML notes with theory, practical examples, and Python implementations.',
      price: 499,
      file_type: 'pdf',
      file_size: 8388608, // 8MB
      download_count: 89,
      view_count: 180,
      created_at: '2024-02-10T00:00:00Z'
    },
    {
      id: '3',
      title: 'React.js Best Practices & Patterns',
      description: 'Industry-standard React patterns, hooks, and performance optimization techniques.',
      price: 399,
      file_type: 'pdf',
      file_size: 3145728, // 3MB
      download_count: 200,
      view_count: 450,
      created_at: '2024-03-05T00:00:00Z'
    },
    {
      id: '4',
      title: 'System Design Interview Prep',
      description: 'Complete system design notes with case studies and real-world examples.',
      price: 599,
      file_type: 'pdf',
      file_size: 10485760, // 10MB
      download_count: 75,
      view_count: 130,
      created_at: '2024-03-20T00:00:00Z'
    }
  ];

  const [purchasedNotes, setPurchasedNotes] = useState<string[]>([]);

  const handlePurchaseSuccess = (noteId: string) => {
    setPurchasedNotes(prev => [...prev, noteId]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Premium Notes</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Access high-quality study materials and notes
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <SearchBar 
                placeholder="Search notes..."
                onSearch={(query) => setSearchQuery(query)}
              />
              
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="ppt">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Notes</TabsTrigger>
              <TabsTrigger value="purchased">My Purchases</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sampleNotes.map((note) => (
                  <NotePurchaseCard
                    key={note.id}
                    note={note}
                    isPurchased={purchasedNotes.includes(note.id)}
                    onPurchaseSuccess={() => handlePurchaseSuccess(note.id)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="purchased">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sampleNotes
                  .filter(note => purchasedNotes.includes(note.id))
                  .map((note) => (
                    <NotePurchaseCard
                      key={note.id}
                      note={note}
                      isPurchased={true}
                    />
                  ))}
              </div>
              {purchasedNotes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    You haven't purchased any notes yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sampleNotes
                  .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
                  .map((note) => (
                    <NotePurchaseCard
                      key={note.id}
                      note={note}
                      isPurchased={purchasedNotes.includes(note.id)}
                      onPurchaseSuccess={() => handlePurchaseSuccess(note.id)}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      {isMobile ? (
        <MobileFooter />
      ) : (
        <footer className="py-8 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">© 2025 LearnVerse: Spark Academy. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PaidNotes;
