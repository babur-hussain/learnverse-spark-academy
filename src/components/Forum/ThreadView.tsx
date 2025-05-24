
import React, { useEffect, useState } from 'react';
import { ForumThread } from '@/types/forum';
import { Button } from '@/components/UI/button';
import { BarChart, Check } from 'lucide-react';
import { Progress } from '@/components/UI/progress';
import { cn } from '@/lib/utils';

interface ThreadViewProps {
  thread: ForumThread;
  onVotePoll?: (pollId: string, optionIndex: number) => Promise<void>;
}

const ThreadView = ({ thread, onVotePoll }: ThreadViewProps) => {
  const [totalVotes, setTotalVotes] = useState(0);
  
  // Calculate total votes for the poll
  useEffect(() => {
    if (thread.poll) {
      const total = thread.poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
      setTotalVotes(total);
    }
  }, [thread.poll]);
  
  const handlePollVote = async (optionIndex: number) => {
    if (onVotePoll && thread.poll) {
      await onVotePoll(thread.poll.id, optionIndex);
    }
  };
  
  const hasVoted = thread.poll?.userVotes && thread.poll.userVotes.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Thread content */}
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: thread.content }} />
      
      {/* Poll display */}
      {thread.poll && (
        <div className="bg-muted p-4 rounded-md mt-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart size={20} />
            <h3 className="text-lg font-medium">{thread.poll.question}</h3>
          </div>
          
          <div className="space-y-3">
            {thread.poll.options.map((option, index) => {
              const votePercentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
              const userVoted = thread.poll?.userVotes?.includes(index);
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hasVoted ? (
                        <div className={cn(
                          "flex items-center",
                          userVoted ? "text-primary font-medium" : ""
                        )}>
                          {userVoted && <Check size={16} className="mr-1" />}
                          <span>{option.text}</span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-left justify-start"
                          onClick={() => handlePollVote(index)}
                        >
                          {option.text}
                        </Button>
                      )}
                    </div>
                    {hasVoted && (
                      <span className="text-sm text-muted-foreground">
                        {option.votes || 0} vote{(option.votes || 0) !== 1 ? 's' : ''} ({Math.round(votePercentage)}%)
                      </span>
                    )}
                  </div>
                  
                  {hasVoted && (
                    <Progress value={votePercentage} className="h-2" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Total votes: {totalVotes}
            {thread.poll.closesAt && new Date(thread.poll.closesAt) > new Date() && (
              <span> · Poll closes {new Date(thread.poll.closesAt).toLocaleDateString()}</span>
            )}
            {thread.poll.closesAt && new Date(thread.poll.closesAt) < new Date() && (
              <span> · Poll closed</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadView;
