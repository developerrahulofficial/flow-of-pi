import { useAuth } from "@/hooks/use-auth";
import { useMyDigit, useAssignDigit } from "@/hooks/use-pi";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UserDigitSection() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: myDigit, isLoading: digitLoading } = useMyDigit();
  const { mutate: assignDigit, isPending: isAssigning } = useAssignDigit();

  // If loading auth state, show minimalist loader
  if (authLoading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not Logged In State
  if (!user) {
    return (
      <div className="text-center py-12 space-y-6">
        <h3 className="text-xl font-mono text-white/80">
          Be part of the sequence.
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm">
          Claim your unique digit of Pi. Your position will be permanently encoded into the global artwork.
        </p>
        <Button 
          size="lg" 
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono tracking-widest uppercase"
          asChild
        >
          <a href="/api/login">
            <Fingerprint className="w-4 h-4 mr-2" />
            Claim Digit
          </a>
        </Button>
      </div>
    );
  }

  // Logged In but No Digit (Should trigger auto-assign, but manual fallback here)
  if (!digitLoading && !myDigit) {
    return (
      <div className="text-center py-12 space-y-6 border border-dashed border-white/20 rounded-lg p-8">
        <h3 className="text-2xl font-mono text-white">Welcome, {user.firstName || "Explorer"}</h3>
        <p className="text-muted-foreground">You haven't claimed your digit yet.</p>
        <Button 
          onClick={() => assignDigit()} 
          disabled={isAssigning}
          className="bg-white text-black hover:bg-gray-200"
        >
          {isAssigning ? "Calculating..." : "Generate My Digit"}
        </Button>
      </div>
    );
  }

  // Has Digit - Show chord information
  return (
    <AnimatePresence>
      {myDigit && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="relative group overflow-hidden border border-white/10 bg-white/5 p-8 rounded-sm hover:border-accent/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="text-xs font-mono uppercase text-muted-foreground tracking-widest mb-2">
                Your Chord in the Artwork
              </div>
              
              <div className="text-2xl font-bold font-mono text-white mb-2">
                Chord #{myDigit.chordNumber || myDigit.digitIndex}
              </div>
              
              <div className="flex items-center justify-center gap-4 w-full">
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-bold font-mono text-cyan-400">{myDigit.startDigit ?? myDigit.digitValue}</span>
                  <span className="text-[10px] uppercase text-muted-foreground mt-1">From</span>
                </div>
                <ArrowRight className="w-6 h-6 text-white/40" />
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-bold font-mono text-magenta-400">{myDigit.endDigit ?? "?"}</span>
                  <span className="text-[10px] uppercase text-muted-foreground mt-1">To</span>
                </div>
              </div>

              <div className="w-full h-px bg-white/10 my-4" />
              
              <p className="text-xs text-muted-foreground font-mono">
                You drew a line connecting digit {myDigit.startDigit ?? myDigit.digitValue} to digit {myDigit.endDigit ?? "?"} in the global artwork.
              </p>
              <p className="text-[10px] text-muted-foreground/60 font-mono">
                Added on {new Date(myDigit.assignedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
