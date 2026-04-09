import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/UI/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/UI/card';
import { Star, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Educator {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  rating: number;
  review_count: number;
  created_at: string;
}

const EducatorSpotlight = () => {
  const { data: educators, isLoading, isError } = useQuery({
    queryKey: ['educators'],
    queryFn: async () => {
      // Simulate fetching educators from a database or API
      const mockEducators: Educator[] = [
        {
          id: '1',
          username: 'john_doe',
          full_name: 'John Doe',
          avatar_url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4cdca9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
          bio: 'Passionate educator with 10+ years of experience.',
          rating: 4.8,
          review_count: 120,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          username: 'jane_smith',
          full_name: 'Jane Smith',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&q=80',
          bio: 'Dedicated to making learning fun and accessible.',
          rating: 4.9,
          review_count: 155,
          created_at: new Date().toISOString(),
        },
      ];
      return mockEducators;
    },
  });

  if (isLoading) {
    return <div>Loading educators...</div>;
  }

  if (isError || !educators) {
    return <div>Error loading educators.</div>;
  }

  const randomEducator = educators[Math.floor(Math.random() * educators.length)];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Educator Spotlight</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={randomEducator.avatar_url} alt={randomEducator.full_name} />
          <AvatarFallback>{randomEducator.full_name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{randomEducator.full_name}</h3>
          <p className="text-sm text-muted-foreground">{randomEducator.bio}</p>
          <div className="flex items-center mt-2">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{randomEducator.rating}</span>
            <span className="text-sm text-muted-foreground ml-1">({randomEducator.review_count} reviews)</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Member since {formatDistanceToNow(new Date(randomEducator.created_at), { addSuffix: true })}
        </p>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact
        </button>
      </CardFooter>
    </Card>
  );
};

export default EducatorSpotlight;
