import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ChallengeWithParticipants } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, BarChart, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { formatDateRange, getTimeRemaining } from "@/lib/utils";
import ParticipantProgress from "@/components/ParticipantProgress";
import Scoreboard from "@/components/Scoreboard";
import JoinChallengeButton from "@/components/JoinChallengeButton";
import { useEffect, useState } from "react";
import AddProgressModal from "@/components/AddProgressModal";

export default function ChallengeDetail() {
  const [_, params] = useRoute('/challenge/:id');
  const challengeId = parseInt(params?.id || '0');
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // For page transition animation
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: challenge, isLoading, error } = useQuery<ChallengeWithParticipants>({
    queryKey: ['/api/challenges', challengeId],
    enabled: !!challengeId,
  });
  
  const handleAddProgress = () => {
    if (challenge?.participants && challenge.participants.length > 0) {
      // Just select the first participant for now (in a real app, it would be the current user's participant)
      setSelectedParticipantId(challenge.participants[0].id);
      setShowAddProgressModal(true);
    }
  };
  
  if (!mounted) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }
  
  if (error || !challenge) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="p-6 bg-destructive/10 text-destructive rounded-md">
          <h1 className="text-xl font-semibold mb-2">Error Loading Challenge</h1>
          <p>We couldn't load the challenge details. Please try again later.</p>
          <Button asChild className="mt-4">
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const isActive = challenge.isCompleted === 0;
  const timeRemaining = isActive ? getTimeRemaining(endDate) : 'Completed';
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl fade-in">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center mb-4"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Challenges</span>
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{challenge.title}</h1>
            <p className="text-muted-foreground">{formatDateRange(startDate, endDate)}</p>
          </div>
          
          {isActive && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="button-primary bg-primary/10 hover:bg-primary/20 text-primary" 
                onClick={handleAddProgress}
              >
                <BarChart className="h-4 w-4 mr-2" />
                <span>Log Progress</span>
              </Button>
              
              <JoinChallengeButton 
                challengeId={challenge.id} 
                currentUsers={challenge.participants.map(p => p.user)}
              />
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mt-6" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 w-64 mb-6">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-sm">Leaderboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  Time Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{timeRemaining}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <BarChart className="h-4 w-4 mr-2 text-primary" />
                  Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{challenge.targetValue} {challenge.unit}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Participants Progress</CardTitle>
              <CardDescription>
                {challenge.participants.length} participant{challenge.participants.length !== 1 ? 's' : ''} in this challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenge.participants.map((participant) => (
                  <ParticipantProgress 
                    key={participant.id}
                    participant={participant}
                    targetValue={challenge.targetValue}
                    unit={challenge.unit}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leaderboard">
          <Scoreboard challengeId={challenge.id} />
        </TabsContent>
      </Tabs>
      
      {showAddProgressModal && selectedParticipantId && (
        <AddProgressModal
          open={showAddProgressModal}
          onOpenChange={setShowAddProgressModal}
          participantId={selectedParticipantId}
          unit={challenge.unit}
        />
      )}
    </div>
  );
}