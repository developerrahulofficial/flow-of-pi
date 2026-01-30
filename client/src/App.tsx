import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Mission from "@/pages/Mission";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useAssignDigit } from "@/hooks/use-pi";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mission" component={Mission} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Global auth handler to auto-assign digit on login
function AuthHandler() {
  const { user, isAuthenticated } = useAuth();
  const { mutate: assignDigit } = useAssignDigit();

  useEffect(() => {
    // If user just logged in, try to assign a digit
    // The backend will prevent duplicates, so it's safe to fire and forget
    if (isAuthenticated && user) {
      assignDigit();
    }
  }, [isAuthenticated, user, assignDigit]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthHandler />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
