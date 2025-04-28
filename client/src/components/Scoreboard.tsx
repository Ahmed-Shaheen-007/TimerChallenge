import { useQuery } from "@tanstack/react-query";
import { Participant, Challenge } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, calculateProgressPercentage } from "@/lib/utils";
import { Trophy, Award, Medal } from "lucide-react";

interface ScoreboardProps {
  challengeId?: number;
}

export default function Scoreboard({ challengeId }: ScoreboardProps) {
  const { data: allChallenges, isLoading } = useQuery<{
    active: Array<Challenge & { participants: Participant[] }>;
    completed: Array<Challenge & { participants: Participant[] }>;
  }>({
    queryKey: ['/api/challenges'],
  });
  
  const challenges = allChallenges 
    ? [...(allChallenges.active || []), ...(allChallenges.completed || [])]
    : [];
  
  // If challengeId is provided, show scoreboard for that challenge only
  // Otherwise, show a global leaderboard from all challenges
  const participants = challengeId
    ? challenges.find(c => c.id === challengeId)?.participants || []
    : challenges.flatMap(c => c.participants);
  
  // Group participants by user to calculate total progress
  const userProgressMap = participants.reduce((acc, participant) => {
    const { userId, user, currentValue } = participant;
    const challenge = challenges.find(c => c.id === participant.challengeId);
    
    if (!challenge) return acc;
    
    const progressPercentage = calculateProgressPercentage(currentValue, challenge.targetValue);
    
    if (!acc[userId]) {
      acc[userId] = {
        user,
        totalProgress: 0,
        challengeCount: 0,
        averageProgress: 0,
      };
    }
    
    acc[userId].totalProgress += progressPercentage;
    acc[userId].challengeCount += 1;
    acc[userId].averageProgress = acc[userId].totalProgress / acc[userId].challengeCount;
    
    return acc;
  }, {} as Record<number, { 
    user: Participant['user'], 
    totalProgress: number, 
    challengeCount: number,
    averageProgress: number 
  }>);
  
  // Convert to array and sort by average progress
  const leaderboard = Object.values(userProgressMap)
    .sort((a, b) => b.averageProgress - a.averageProgress);
  
  // Get challenge title if challengeId is provided
  const challengeTitle = challengeId 
    ? challenges.find(c => c.id === challengeId)?.title 
    : undefined;
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className="scoreboard fade-in">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-primary" />
          {challengeTitle ? `${challengeTitle} Leaderboard` : 'Global Leaderboard'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.map((item, index) => (
              <div key={item.user.id} className={`leaderboard-item ${index < 3 ? 'bg-secondary/20' : ''}`}>
                <div className={`rank-badge ${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'bg-secondary'}`}>
                  {index < 3 ? getRankIcon(index) : index + 1}
                </div>
                
                <Avatar className="h-10 w-10" style={{ backgroundColor: item.user.avatarColor }}>
                  <AvatarFallback>
                    {getInitials(item.user.username)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="font-medium">{item.user.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.challengeCount} challenge{item.challengeCount !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">{Math.round(item.averageProgress)}%</div>
                  <div className="text-xs text-muted-foreground">completion</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No participants found
          </div>
        )}
      </CardContent>
    </Card>
  );
}