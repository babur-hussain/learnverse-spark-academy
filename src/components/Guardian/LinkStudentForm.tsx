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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/UI/dialog';
import { Plus, Loader2 } from 'lucide-react';

const linkFormSchema = z.object({
  student_id: z.string().min(1, { message: "Student ID is required" }),
  relationship_type: z.string().min(1, { message: "Relationship type is required" }),
});

const verifyFormSchema = z.object({
  verification_code: z.string().min(1, { message: "Verification code is required" }),
});

type LinkFormValues = z.infer<typeof linkFormSchema>;
type VerifyFormValues = z.infer<typeof verifyFormSchema>;

const LinkStudentForm: React.FC = () => {
  const { guardian, refreshData } = useGuardian();
  const { toast } = useToast();
  const [isLinking, setIsLinking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [linkCreated, setLinkCreated] = useState(false);
  const [pendingLinkId, setPendingLinkId] = useState<string | null>(null);

  const linkForm = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      student_id: "",
      relationship_type: "parent",
    },
  });

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      verification_code: "",
    },
  });

  const onSubmitLinkForm = async (values: LinkFormValues) => {
    if (!guardian) return;
    
    try {
      setIsLinking(true);
      const link = await GuardianService.linkStudent({
        guardian_id: guardian.id,
        student_id: values.student_id,
        relationship_type: values.relationship_type,
        is_primary: false,
        verification_status: 'pending',
        verification_code: ''
      });
      
      if (link) {
        setLinkCreated(true);
        setPendingLinkId(link.id);
        linkForm.reset();
        toast({
          title: "Student link created",
          description: "Please enter the verification code to complete the link",
        });
      }
    } catch (error) {
      console.error('Error linking student:', error);
      toast({
        title: "Error",
        description: "Could not link student. The student ID may be invalid or already linked.",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const onSubmitVerifyForm = async (values: VerifyFormValues) => {
    if (!guardian || !pendingLinkId) return;
    
    try {
      setIsVerifying(true);
      const success = await GuardianService.verifyStudentLink({
        guardian_id: guardian.id,
        student_id: "",  // Not used in the verification function
        relationship_type: "",  // Not used in the verification function
        verification_code: values.verification_code,
      });
      
      if (success) {
        toast({
          title: "Verification successful",
          description: "The student has been linked to your account",
        });
        refreshData();
        verifyForm.reset();
        setLinkCreated(false);
        setPendingLinkId(null);
      } else {
        toast({
          title: "Verification failed",
          description: "The verification code is invalid or expired",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying link:', error);
      toast({
        title: "Error",
        description: "Could not verify student link. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Link Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link a Student</DialogTitle>
          <DialogDescription>
            {linkCreated 
              ? "Enter the verification code provided by the school or teacher"
              : "Enter the student ID and your relationship to link a student to your account"
            }
          </DialogDescription>
        </DialogHeader>
        
        {!linkCreated ? (
          <Form {...linkForm}>
            <form onSubmit={linkForm.handleSubmit(onSubmitLinkForm)} className="space-y-4">
              <FormField
                control={linkForm.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter student ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={linkForm.control}
                name="relationship_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="grandparent">Grandparent</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={isLinking}>
                  {isLinking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Link Student
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(onSubmitVerifyForm)} className="space-y-4">
              <FormField
                control={verifyForm.control}
                name="verification_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter verification code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setLinkCreated(false);
                    setPendingLinkId(null);
                  }}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isVerifying}>
                  {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LinkStudentForm;
