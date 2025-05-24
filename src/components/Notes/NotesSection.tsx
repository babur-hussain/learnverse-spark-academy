import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import SearchBar from '@/components/UI/SearchBar';
import { 
  Folder, 
  Calendar,
  Star,
  Share2
} from 'lucide-react';

// Using Calendar instead of CalendarDays
// Using Folder instead of FolderPlus

const NotesSection = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    
    
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <p className="text-muted-foreground">Access and manage your study materials</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <SearchBar 
            placeholder="Search notes..."
            onSearch={(query) => setSearchQuery(query)}
          />
          
          <Button className="gradient-primary">
            <Folder className="mr-2 h-4 w-4" />
            Add New Note
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="shared">Shared With Me</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Object-Oriented Programming Concepts</CardTitle>
                <CardDescription>Computer Science</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Key concepts of OOP including encapsulation, inheritance, polymorphism, and abstraction with practical examples.</p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Updated 3 days ago</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1">Favorite</span>
                </Button>
                <div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Linear Regression Analysis</CardTitle>
                <CardDescription>Statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Comprehensive guide to linear regression, covering assumptions, model fitting, and interpretation of results.</p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Updated 1 week ago</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1">Favorite</span>
                </Button>
                <div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>The Art of Public Speaking</CardTitle>
                <CardDescription>Communication Skills</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Techniques and strategies for effective public speaking, including structuring your speech, managing anxiety, and engaging your audience.</p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Updated 2 weeks ago</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1">Favorite</span>
                </Button>
                <div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="favorites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Object-Oriented Programming Concepts</CardTitle>
                <CardDescription>Computer Science</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Key concepts of OOP including encapsulation, inheritance, polymorphism, and abstraction with practical examples.</p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Updated 3 days ago</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1">Favorite</span>
                </Button>
                <div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Object-Oriented Programming Concepts</CardTitle>
                <CardDescription>Computer Science</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Key concepts of OOP including encapsulation, inheritance, polymorphism, and abstraction with practical examples.</p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Updated 3 days ago</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1">Favorite</span>
                </Button>
                <div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Linear Regression Analysis</CardTitle>
                <CardDescription>Statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Comprehensive guide to linear regression, covering assumptions, model fitting, and interpretation of results.</p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Updated 1 week ago</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1">Favorite</span>
                </Button>
                <div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>The Art of Public Speaking</CardTitle>
                <CardDescription>Communication Skills</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Techniques and strategies for effective public speaking, including structuring your speech, managing anxiety, and engaging your audience.</p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Updated 2 weeks ago</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1">Favorite</span>
                </Button>
                <div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="shared">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Effective Time Management</CardTitle>
                <CardDescription>Personal Development</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Strategies for prioritizing tasks, setting goals, and managing your time effectively to increase productivity.</p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Shared 1 week ago</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1">Favorite</span>
                </Button>
                <div>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesSection;
