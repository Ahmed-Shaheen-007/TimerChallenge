import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import NewChallengeModal from "./NewChallengeModal";

export default function Header() {
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);

  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-semibold">Timero</h1>
        <p className="text-muted-foreground text-sm">Track time challenges with friends</p>
      </div>
      
      <div className="flex gap-4">
        <Button 
          variant="default" 
          className="flex items-center gap-2"
          onClick={() => setShowNewChallengeModal(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Challenge</span>
        </Button>
        
        <Button variant="outline" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>

      {showNewChallengeModal && (
        <NewChallengeModal
          open={showNewChallengeModal}
          onOpenChange={setShowNewChallengeModal}
        />
      )}
    </header>
  );
}
