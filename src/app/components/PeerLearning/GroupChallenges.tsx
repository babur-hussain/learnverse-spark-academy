import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Plus, Award, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ComingSoonInline } from '@/components/ErrorPage';

// Mock data for group challenges
const mockChallenges = [
  {
    id: '1',
    title: 'Calculus Sprint',
    challenge_type: 'Quiz',
    end_time: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    participants: 12
  },
  {
    id: '2',
    title: 'Physics Problem Set',
    challenge_type: 'Problem Set',
    end_time: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    participants: 8
  },
  {
    id: '3',
    title: 'Programming Competition',
    challenge_type: 'Contest',
    end_time: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    participants: 24
  },
];

const GroupChallenges = () => {
  const [challenges, setChallenges] = useState(mockChallenges);
  const { toast } = useToast();

  useEffect(() => {
    // We'll use mock data for now until Supabase types are updated
    setChallenges(mockChallenges);
    
    // Commented out until Supabase schema is updated
    // const fetchGroupChallenges = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('group_challenges')
    //       .select('*');
    //
    //     if (error) throw error;
    //     setChallenges(data);
    //   } catch (error) {
    //     toast({
    //       title: 'Error',
    //       description: 'Failed to load group challenges',
    //       variant: 'destructive'
    //     });
    //   }
    // };
    // 
    // fetchGroupChallenges();
  }, []);

  const createChallenge = () => {
    toast({
      title: '',
      description: <ComingSoonInline message="Challenge creation feature will be available shortly." />,
      duration: 4000
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Group Challenges</CardTitle>
        <Button onClick={createChallenge}>
          <Plus className="mr-2 h-4 w-4" /> Create Challenge
        </Button>
      </CardHeader>
      <CardContent>
        {challenges.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No group challenges found. Create one to get started!
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="border rounded p-4">
                <h3 className="font-semibold flex items-center">
                  <Award className="mr-2 h-4 w-4 text-yellow-500" />
                  {challenge.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {challenge.challenge_type} Challenge
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>Ends in {formatDistanceToNow(new Date(challenge.end_time))}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {challenge.participants} participants
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupChallenges;
