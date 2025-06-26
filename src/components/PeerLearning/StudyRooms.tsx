import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Plus, Video, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ComingSoonInline } from '@/components/ErrorPage';

// Mock data for study rooms
const mockRooms = [
  {
    id: '1',
    name: 'Calculus Help Session',
    room_type: 'Video',
    status: 'active',
    participants: 4,
    max_participants: 10,
    start_time: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Physics Problem Solving',
    room_type: 'Whiteboard',
    status: 'scheduled',
    participants: 0,
    max_participants: 8,
    start_time: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  },
  {
    id: '3',
    name: 'Programming Study Group',
    room_type: 'Video',
    status: 'active',
    participants: 6,
    max_participants: 12,
    start_time: new Date().toISOString()
  },
];

const StudyRooms = () => {
  const [rooms, setRooms] = useState(mockRooms);
  const { toast } = useToast();

  useEffect(() => {
    // We'll use mock data for now until Supabase types are updated
    setRooms(mockRooms);
    
    // Commented out until Supabase schema is updated
    // const fetchStudyRooms = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('study_rooms')
    //       .select('*');
    //
    //     if (error) throw error;
    //     setRooms(data);
    //   } catch (error) {
    //     toast({
    //       title: 'Error',
    //       description: 'Failed to load study rooms',
    //       variant: 'destructive'
    //     });
    //   }
    // };
    // 
    // fetchStudyRooms();
  }, []);

  const createStudyRoom = () => {
    toast({
      title: '',
      description: <ComingSoonInline message="Study room creation feature will be available shortly." />,
      duration: 4000
    });
  };

  const joinRoom = (roomId) => {
    toast({
      title: '',
      description: <ComingSoonInline message="Room joining feature will be available shortly." />,
      duration: 4000
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Study Rooms</CardTitle>
        <Button onClick={createStudyRoom}>
          <Plus className="mr-2 h-4 w-4" /> Create Room
        </Button>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No study rooms found. Create one to get started!
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="border rounded p-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold flex items-center">
                    <Video className="mr-2 h-4 w-4 text-primary" />
                    {room.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded ${room.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {room.status === 'active' ? 'Active' : 'Scheduled'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{room.room_type} Room</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="mr-1 h-3 w-3" />
                    <span>{room.participants}/{room.max_participants} participants</span>
                  </div>
                  {room.status === 'scheduled' && (
                    <span className="text-xs text-muted-foreground">
                      Starts in {formatDistanceToNow(new Date(room.start_time))}
                    </span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => joinRoom(room.id)}
                >
                  {room.status === 'active' ? 'Join Now' : 'Join When Starts'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyRooms;
