
import React from 'react';
import { useGuardian } from '@/contexts/GuardianContext';
import { GuardianService } from '@/services/GuardianService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import { format } from 'date-fns';
import { Calendar, Clock, ExternalLink, Users, Video, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookMeetingForm from './BookMeetingForm';

const MeetingsList: React.FC = () => {
  const { currentStudent } = useGuardian();
  const [meetings, setMeetings] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const loadMeetings = async () => {
      if (!currentStudent?.student_id) return;
      
      setIsLoading(true);
      try {
        const data = await GuardianService.getMeetings(currentStudent.student_id);
        setMeetings(data);
      } catch (error) {
        console.error('Error loading meetings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeetings();
  }, [currentStudent]);

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      const success = await GuardianService.cancelMeeting(meetingId);
      if (success) {
        toast({
          title: "Meeting cancelled",
          description: "The meeting has been cancelled successfully",
        });
        // Update the local state
        setMeetings(meetings.map(m => 
          m.id === meetingId ? { ...m, status: 'cancelled' } : m
        ));
      }
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast({
        title: "Error",
        description: "Could not cancel the meeting. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getMeetingStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-600">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-red-500 text-red-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    return type === 'virtual' ? 
      <Video className="h-4 w-4 text-blue-500" /> : 
      <Users className="h-4 w-4 text-purple-500" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Parent-Teacher Meetings
          </CardTitle>
          <CardDescription>Schedule and manage meetings with teachers</CardDescription>
        </div>
        <BookMeetingForm />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No scheduled meetings. Click "Book Meeting" to schedule one.
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map(meeting => (
              <div 
                key={meeting.id}
                className={`p-4 border rounded-md ${
                  meeting.status === 'cancelled' ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    {meeting.teacher?.avatar_url ? (
                      <AvatarImage src={meeting.teacher.avatar_url} alt={meeting.teacher?.full_name || 'Teacher'} />
                    ) : (
                      <AvatarFallback>
                        {meeting.teacher?.full_name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {meeting.teacher?.full_name || 'Teacher'}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          {getMeetingTypeIcon(meeting.meeting_type)}
                          <span>
                            {meeting.meeting_type === 'virtual' ? 'Virtual Meeting' : 'In-Person Meeting'}
                          </span>
                        </div>
                      </div>
                      <div>
                        {getMeetingStatusBadge(meeting.status)}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(meeting.meeting_date), 'h:mm a')} 
                          ({meeting.duration_minutes} mins)
                        </span>
                      </div>
                    </div>

                    {meeting.notes && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {meeting.notes}
                      </p>
                    )}

                    <div className="flex justify-end mt-4 gap-2">
                      {meeting.meeting_link && meeting.status === 'scheduled' && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Join
                          </a>
                        </Button>
                      )}
                      
                      {meeting.status === 'scheduled' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelMeeting(meeting.id)}
                        >
                          <X className="h-3.5 w-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingsList;
