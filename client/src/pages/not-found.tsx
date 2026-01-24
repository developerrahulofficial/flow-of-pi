import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="flex mb-8">
        <AlertTriangle className="h-12 w-12 text-accent animate-pulse" />
      </div>
      
      <h1 className="text-6xl font-mono font-bold mb-4 tracking-tighter">404</h1>
      <p className="text-xl text-muted-foreground font-mono mb-8 text-center max-w-md">
        The digit you are looking for does not exist in this sequence.
      </p>

      <Link href="/">
        <Button variant="outline" className="border-white/20 hover:bg-white hover:text-black font-mono">
          Return to Sequence
        </Button>
      </Link>
    </div>
  );
}
