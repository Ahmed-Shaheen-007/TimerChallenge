import { ChallengeWithParticipants } from "@/types";
import { formatDateRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreVertical, Plus } from "lucide-react";
import ParticipantProgress from "./ParticipantProgress";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import AddProgressModal from "./AddProgressModal";

interface ChallengeCardProps {
  challenge: ChallengeWithParticipants;
  onAddProgress?: (participantId: number, value: number, date: string, notes?: string) => void;
}

export default function ChallengeCard({ challenge, onAddProgress }: ChallengeCardProps) {
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  
  const handleAddProgress = () => {
    if (challenge.participants && challenge.participants.length > 0) {
      // Just select the first participant for now
      // In a real app, you would select the actual user's participant record
      setSelectedParticipantId(challenge.participants[0].id);
      setShowAddProgressModal(true);
    }
  };
  
  return (
    <Card className={challenge.isCompleted ? "opacity-80" : ""}>
      <CardHeader className="pb-0 pt-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{challenge.title}</h3>
              {challenge.isCompleted === 1 && (
                <Badge variant="outline" className="bg-green-900/30 text-green-400 text-xs">
                  Completed
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              {formatDateRange(startDate, endDate)}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-4 mb-2">
          {challenge.participants.map((participant) => (
            <ParticipantProgress 
              key={participant.id}
              participant={participant}
              targetValue={challenge.targetValue}
              unit={challenge.unit}
            />
          ))}
        </div>
        
        {challenge.isCompleted === 0 && (
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              className="bg-primary/10 hover:bg-primary/20 text-primary" 
              onClick={handleAddProgress}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add {challenge.unit === 'hours' ? 'Hours' : 'Progress'}</span>
            </Button>
          </div>
        )}
      </CardContent>
      
      {showAddProgressModal && selectedParticipantId && (
        <AddProgressModal
          open={showAddProgressModal}
          onOpenChange={setShowAddProgressModal}
          participantId={selectedParticipantId}
          unit={challenge.unit}
          onAddProgress={onAddProgress}
        />
      )}
    </Card>
  );
}
