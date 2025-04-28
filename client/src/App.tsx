import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ChallengeDetail from "@/pages/ChallengeDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/challenge/:id" component={ChallengeDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
    </TooltipProvider>
  );
}

export default App;
