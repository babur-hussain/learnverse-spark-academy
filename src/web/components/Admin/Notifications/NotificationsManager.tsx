import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Label } from '@/components/UI/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/UI/select';
import { Input as TextInput } from '@/components/UI/input';
import UserSearch from './UserSearch';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/use-user-role';
import { supabase } from '@/integrations/supabase/client';

export const NotificationsManager: React.FC = () => {
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!isAdmin) return;
    setSending(true);
    try {
      if (!title.trim() || !body.trim()) {
        throw new Error('Title and message are required');
      }

      // store record for audit
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({ title, body, target });
      if (insertError) throw insertError;

      // invoke secured function with current session JWT
      const resolvedTarget = target === 'user' && targetUserId ? `user:${targetUserId}` : target;

      const { data: invokeData, error: invokeError } = await supabase.functions.invoke('send-notifications', {
        body: { title, body, target: resolvedTarget }
      });
      if (invokeError) throw invokeError;

      toast({ title: 'Sent', description: `Delivered ${invokeData.sent}/${invokeData.total}` });
      setTitle(''); setBody('');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>Compose and send push notifications to app users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exam update" />
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Your exam starts tomorrow at 9 AM." />
        </div>
        <div className="space-y-2">
          <Label>Target</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              <SelectItem value="role:student">Students</SelectItem>
              <SelectItem value="role:teacher">Teachers</SelectItem>
              <SelectItem value="user">Specific user…</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {target === 'user' && (
          <div className="space-y-2">
            <Label>User</Label>
            <TextInput value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search by name or email" />
            <UserSearch query={userQuery} onPick={(u) => { setTargetUserId(u.id); setUserQuery(`${u.full_name || u.username || ''} (${u.id.slice(0,6)}…)`); }} />
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          This will send push notifications to Android and iOS devices registered with your app.
        </div>
        <Button onClick={handleSend} disabled={!title || !body || sending} className="w-full">
          {sending ? 'Sending…' : 'Send Notification'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationsManager;


