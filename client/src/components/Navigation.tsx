import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Loader2 } from "lucide-react";

export function Navigation() {
  const { user, isLoading, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-mono text-xl font-bold tracking-tighter hover:text-white/80 transition-colors">
          PI_WALLPAPER<span className="text-accent animate-pulse">_</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="#about" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">
            Mission
          </Link>
          <Link href="#download" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">
            Download
          </Link>
          
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block text-xs font-mono text-muted-foreground border border-white/10 px-2 py-1 rounded-full">
                {user.firstName || user.email?.split('@')[0]}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()}
                className="text-xs hover:bg-white/10 hover:text-white"
              >
                <LogOut className="w-3 h-3 mr-2" />
                EXIT
              </Button>
            </div>
          ) : (
            <Button 
              asChild 
              size="sm" 
              variant="outline"
              className="border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-300 font-mono text-xs uppercase tracking-widest"
            >
              <a href="/api/login">
                <LogIn className="w-3 h-3 mr-2" />
                Join
              </a>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
