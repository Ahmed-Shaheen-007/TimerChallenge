import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@/types";
import { UserPlus } from "lucide-react";

interface JoinChallengeButtonProps {
  challengeId: number;
  currentUsers: User[];
}

export default function JoinChallengeButton({ challengeId, currentUsers }: JoinChallengeButtonProps) {
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  
  // For demo purposes, we'll assume the user is the first user not in the challenge
  // In a real app, this would be the currently logged in user
  const handleJoinChallenge = async () => {
    try {
      setIsJoining(true);
      
      // Fetch all users
      const response = await fetch('/api/users');
      const allUsers = await response.json() as User[];
      
      // Find a user who is not already in the challenge
      const currentUserIds = currentUsers.map(u => u.id);
      const availableUsers = allUsers.filter(u => !currentUserIds.includes(u.id));
      
      if (availableUsers.length === 0) {
        toast({
          title: "Cannot join challenge",
          description: "All available users are already in this challenge.",
          variant: "destructive",
        });
        return;
      }
      
      // Join with the first available user
      const userToJoin = availableUsers[0];
      
      await apiRequest('POST', `/api/challenges/${challengeId}/join`, {
        userId: userToJoin.id
      });
      
      // Invalidate challenges query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      
      toast({
        title: "Challenge joined!",
        description: `${userToJoin.username} has joined the challenge.`
      });
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast({
        title: "Failed to join",
        description: "Could not join the challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <Button 
      onClick={handleJoinChallenge} 
      disabled={isJoining}
      variant="outline" 
      className="button-primary bg-primary/10 hover:bg-primary/20 text-primary"
    >
      {isJoining ? (
        "Joining..."
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          <span>Join Challenge</span>
        </>
      )}
    </Button>
  );
}