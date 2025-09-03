
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GuardianService } from '@/services/GuardianService';
import { useGuardian } from '@/contexts/GuardianContext';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/UI/form';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Calendar } from '@/components/UI/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Textarea } from '@/components/UI/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/UI/dialog';
import { 
  Calendar as CalendarIcon, 
  Clock,
  VideoIcon,
  Users,
  Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const meetingFormSchema = z.object({
  teacher_id: z.string().min(1, { message: "Teacher is required" }),
  meeting_date: z.date({ required_error: "Meeting date is required" }),
  meeting_time: z.string().min(1, { message: "Meeting time is required" }),
  duration_minutes: z.string().min(1, { message: "Duration is required" }),
  meeting_type: z.string().min(1, { message: "Meeting type is required" }),
  notes: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

const BookMeetingForm: React.FC = () => {
  const { guardian, currentStudent, refreshData } = useGuardian();
  const { toast } = useToast();
  const [isBooking, setIsBooking] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      teacher_id: "",
      meeting_date: undefined,
      meeting_time: "",
      duration_minutes: "30",
      meeting_type: "virtual",
      notes: "",
    },
  });

  const onSubmit = async (values: MeetingFormValues) => {
    if (!guardian || !currentStudent) return;
    
    try {
      setIsBooking(true);
      
      // Combine date and time
      const dateTime = new Date(values.meeting_date);
      const [hours, minutes] = values.meeting_time.split(':').map(Number);
      dateTime.setHours(hours, minutes);
      
      const meeting = await GuardianService.bookMeeting({
        guardian_id: guardian.id,
        student_id: currentStudent.student_id,
        teacher_id: values.teacher_id,
        meeting_date: dateTime.toISOString(),
        duration_minutes: parseInt(values.duration_minutes),
        meeting_type: values.meeting_type,
        notes: values.notes || undefined,
        status: 'scheduled'
      });
      
      if (meeting) {
        toast({
          title: "Meeting booked",
          description: "Your meeting has been successfully scheduled",
        });
        form.reset();
        setIsDialogOpen(false);
        refreshData();
      }
    } catch (error) {
      console.error('Error booking meeting:', error);
      toast({
        title: "Error",
        description: "Could not book the meeting. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Mock teachers data - in a real app, this would come from an API
  const teachers = [
    { id: "1", name: "Ms. Johnson" },
    { id: "2", name: "Mr. Smith" },
    { id: "3", name: "Dr. Patel" },
  ];

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Clock className="mr-2 h-4 w-4" />
          Book Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book a Parent-Teacher Meeting</DialogTitle>
          <DialogDescription>
            Schedule a meeting with your child's teacher to discuss academic progress and concerns
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Teacher selection */}
            <FormField
              control={form.control}
              name="teacher_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date picker */}
            <FormField
              control={form.control}
              name="meeting_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Meeting Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Time input */}
            <FormField
              control={form.control}
              name="meeting_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              {/* Duration select */}
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Meeting type */}
              <FormField
                control={form.control}
                name="meeting_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="virtual">
                          <div className="flex items-center">
                            <VideoIcon className="mr-2 h-4 w-4" />
                            <span>Virtual</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="in_person">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            <span>In Person</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide any additional information or specific topics you'd like to discuss"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isBooking}>
                {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Book Meeting
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BookMeetingForm;
