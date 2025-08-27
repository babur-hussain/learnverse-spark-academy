import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type UserRow = { id: string; full_name: string | null; username: string | null; role?: string | null };

export const UserSearch: React.FC<{ query: string; onPick: (u: UserRow) => void }> = ({ query, onPick }) => {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, isFetching } = useQuery<UserRow[]>({
    queryKey: ['notif-user-search', query, page],
    queryFn: async () => {
      const base = supabase
        .from('profiles')
        .select('id, full_name, username, role')
        .order('created_at', { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      const q = query.trim();
      const { data, error } = q
        ? await base.or(`full_name.ilike.%${q}%,username.ilike.%${q}%,id.eq.${q}`)
        : await base;

      if (error) throw error;
      return (data || []) as UserRow[];
    },
    staleTime: 30_000,
  });

  return (
    <div className="border rounded p-2 max-h-72 overflow-auto space-y-2">
      <div className="text-xs text-muted-foreground px-1">
        {query.trim() ? 'Search results' : 'All users'} {isFetching && '…'}
      </div>
      {isLoading && <div className="text-sm text-muted-foreground px-1">Loading…</div>}
      {!isLoading && (data ?? []).length === 0 && (
        <div className="text-sm text-muted-foreground px-1">No users found</div>
      )}
      {!isLoading && (data ?? []).map(u => (
        <button key={u.id} onClick={() => onPick(u)} className="w-full text-left px-2 py-1 hover:bg-accent rounded">
          <div className="flex items-center justify-between">
            <span>{u.full_name || u.username || 'Unknown'}</span>
            <span className="text-xs text-muted-foreground">{u.role || ''}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">{u.id}</div>
        </button>
      ))}
      <div className="flex items-center justify-between pt-2">
        <button
          className="text-xs underline disabled:opacity-50"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >Prev</button>
        <div className="text-xs text-muted-foreground">Page {page + 1}</div>
        <button
          className="text-xs underline"
          onClick={() => setPage(page + 1)}
        >Next</button>
      </div>
    </div>
  );
};

export default UserSearch;


