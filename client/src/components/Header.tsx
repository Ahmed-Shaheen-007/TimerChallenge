import { Plus, User, Clock, Award, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import NewChallengeModal from "./NewChallengeModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);

  return (
    <header className="flex justify-between items-center mb-8 fade-in">
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            Timero
            <span className="ml-2 bg-secondary text-xs px-2 py-0.5 rounded-full">Beta</span>
          </h1>
          <p className="text-muted-foreground text-sm">Track time challenges with friends</p>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button 
          variant="default" 
          className="button-primary flex items-center gap-2"
          onClick={() => setShowNewChallengeModal(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Challenge</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Avatar className="h-8 w-8 border-2 border-transparent hover:border-primary transition-all duration-300">
                <AvatarFallback className="text-sm bg-secondary">
                  JD
                </AvatarFallback>
              </Avatar>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Award className="h-4 w-4" />
              <span>My Achievements</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <NewChallengeModal
        open={showNewChallengeModal}
        onOpenChange={setShowNewChallengeModal}
      />
    </header>
  );
}
