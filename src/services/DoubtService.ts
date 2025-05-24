
import { supabase } from '@/integrations/supabase/client';
import type { 
  Doubt, 
  DoubtAttachment, 
  DoubtReply, 
  DoubtRating, 
  DoubtSession,
  DoubtStatus,
  DoubtUrgencyLevel 
} from '@/types/doubt';
import { useAuth } from '@/contexts/AuthContext';

export class DoubtService {
  static async createDoubt(
    title: string,
    content: string,
    urgencyLevel: DoubtUrgencyLevel,
    categoryId?: string,
    subject?: string,
    topic?: string
  ): Promise<Doubt | null> {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User must be authenticated to create a doubt');
      return null;
    }

    const { data, error } = await supabase
      .from('doubts')
      .insert({
        user_id: user.id,
        title,
        content,
        urgency_level: urgencyLevel,
        category_id: categoryId,
        subject,
        topic,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating doubt:', error);
      return null;
    }

    return data as unknown as Doubt;
  }

  static async uploadAttachment(
    doubtId: string,
    file: File,
    type: 'doubt' | 'reply'
  ): Promise<DoubtAttachment | null> {
    const filePath = `doubts/${doubtId}/${file.name}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('doubt-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    // Create attachment record
    const { data, error } = await supabase
      .from(type === 'doubt' ? 'doubt_attachments' : 'reply_attachments')
      .insert({
        doubt_id: doubtId,
        file_type: file.type.split('/')[0],
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating attachment record:', error);
      return null;
    }

    return data as unknown as DoubtAttachment;
  }

  static async getDoubts(status?: DoubtStatus): Promise<Doubt[]> {
    const query = supabase
      .from('doubts')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching doubts:', error);
      return [];
    }

    return data as unknown as Doubt[];
  }

  static async getDoubtById(id: string): Promise<Doubt | null> {
    const { data, error } = await supabase
      .from('doubts')
      .select(`
        *,
        doubt_attachments (*),
        doubt_replies (
          *,
          reply_attachments (*)
        ),
        doubt_ratings (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching doubt:', error);
      return null;
    }

    return data as unknown as Doubt;
  }

  static async updateDoubtStatus(
    id: string,
    status: DoubtStatus,
    assignedTo?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('doubts')
      .update({
        status,
        assigned_to: assignedTo,
        assigned_at: assignedTo ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating doubt status:', error);
      return false;
    }

    return true;
  }
}
