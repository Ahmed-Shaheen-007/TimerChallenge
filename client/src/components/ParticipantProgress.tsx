import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Participant } from "@/types";
import { calculateProgressPercentage, getInitials } from "@/lib/utils";

interface ParticipantProgressProps {
  participant: Participant;
  targetValue: number;
  unit: string;
}

export default function ParticipantProgress({ 
  participant, 
  targetValue,
  unit 
}: ParticipantProgressProps) {
  const { user, currentValue } = participant;
  const progressPercentage = calculateProgressPercentage(currentValue, targetValue);
  
  return (
    <div className="flex items-center gap-3">
      <Avatar className="w-8 h-8" style={{ backgroundColor: user.avatarColor }}>
        <AvatarFallback className="text-sm font-medium">
          {getInitials(user.username)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium">{user.username}</span>
          <span className="text-sm">
            {currentValue}{unit === 'hours' ? 'h' : ''} 
            <span className="text-muted-foreground">
              {' '}/ {targetValue}{unit === 'hours' ? 'h' : ''}
            </span>
          </span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: user.avatarColor 
            }}
          />
        </div>
      </div>
    </div>
  );
}
