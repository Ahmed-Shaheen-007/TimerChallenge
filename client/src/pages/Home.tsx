import { useQuery } from "@tanstack/react-query";
import { ChallengeWithParticipants } from "@/types";
import Header from "@/components/Header";
import ChallengeCard from "@/components/ChallengeCard";
import Scoreboard from "@/components/Scoreboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("challenges");
  const [mounted, setMounted] = useState(false);
  
  // For page transition animation
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data, isLoading, error } = useQuery<{
    active: ChallengeWithParticipants[];
    completed: ChallengeWithParticipants[];
  }>({
    queryKey: ['/api/challenges'],
  });
  
  const handleAddProgress = async (participantId: number, value: number, date: string, notes?: string) => {
    // This is handled in the AddProgressModal component
    // but we could add additional UI feedback here if needed
  };
  
  if (!mounted) {
    return null; // Prevents flash on first render
  }
  
  return (
    <div className={`container mx-auto px-4 py-8 max-w-4xl fade-in`}>
      <Header />
      
      <Tabs defaultValue="challenges" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-64 mb-6">
          <TabsTrigger value="challenges" className="text-sm">Challenges</TabsTrigger>
          <TabsTrigger value="scoreboard" className="text-sm">Scoreboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="challenges" className="space-y-8">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Active Challenges</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[250px] w-full rounded-xl" />
                <Skeleton className="h-[250px] w-full rounded-xl" />
              </div>
            ) : error ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                Failed to load challenges. Please try again.
              </div>
            ) : data?.active && data.active.length > 0 ? (
              <div className="space-y-6">
                {data.active.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                    onAddProgress={handleAddProgress}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-card rounded-xl">
                <p className="text-muted-foreground">No active challenges yet.</p>
                <p className="mt-2">Create a new challenge to get started!</p>
              </div>
            )}
          </section>
          
          {data?.completed && data.completed.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Completed Challenges</h2>
              <div className="space-y-6">
                {data.completed.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                  />
                ))}
              </div>
            </section>
          )}
        </TabsContent>
        
        <TabsContent value="scoreboard">
          <Scoreboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
