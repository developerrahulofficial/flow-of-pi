import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { JoinDialog } from "./JoinDialog";

export function Navigation() {
  const { user, isLoading, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-4 group relative">
            <div className="relative flex items-center justify-center">
              {/* Geometric Minimalist Symbol */}
              <div className="w-10 h-10 border border-white/20 group-hover:border-accent group-hover:bg-white/5 transition-all duration-700 ease-in-out flex items-center justify-center relative overflow-hidden">
                <span className="text-xl font-light text-white group-hover:scale-110 transition-transform duration-500 font-serif lowercase">
                  π
                </span>
                {/* Animated Scan Line */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-linear" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-[12px] font-black tracking-[0.2em] text-white">FLOW</span>
                <span className="text-[12px] font-light tracking-[0.3em] text-white/40">OF PI</span>
              </div>
              <div className="h-[1px] w-4 group-hover:w-full bg-accent transition-all duration-500 mt-1" />
            </div>
          </a>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/mission">
            <a className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              Mission
            </a>
          </Link>
          <a
            href="/wallpapers/latest.png"
            target="_blank"
            className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            Wallpaper
          </a>

          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white/20" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-mono text-white/80 uppercase tracking-tighter">
                  {user.instagramHandle ? `@${user.instagramHandle}` : (user.firstName || "Explorer")}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => logout()}
                className="text-white/40 hover:text-white hover:bg-white/5 font-mono text-[10px] uppercase tracking-widest"
              >
                <LogOut className="w-3 h-3 mr-2" />
                Exit
              </Button>
            </div>
          ) : (
            <JoinDialog />
          )}
        </div>
      </div>
    </nav>
  );
}
