import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WallpaperUrls } from "@shared/schema";

interface WallpaperPreviewProps {
  urls?: WallpaperUrls;
  isLoading: boolean;
}

export function WallpaperPreview({ urls, isLoading }: WallpaperPreviewProps) {
  const [activeRes, setActiveRes] = useState<keyof WallpaperUrls['resolutions']>("1290x2796");
  
  // Provide a clean fallback if urls are missing (e.g. backend not ready)
  const defaultImage = "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop"; 
  /* abstract digital art network dark mode */

  const currentImage = urls?.latest || defaultImage;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto py-12">
      
      {/* Phone Mockup */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mx-auto"
      >
        <div className="relative w-[300px] h-[600px] rounded-[3rem] border-8 border-neutral-900 bg-neutral-950 shadow-2xl overflow-hidden ring-1 ring-white/10">
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-neutral-900 z-20 rounded-b-xl w-32 mx-auto" />
          
          {/* Screen Content */}
          <div className="absolute inset-0 z-10 bg-black flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            ) : (
              <img 
                src={currentImage} 
                alt="Generated Pi Wallpaper" 
                className="w-full h-full object-cover opacity-90"
              />
            )}
            
            {/* Lock Screen UI Mockup */}
            <div className="absolute top-12 inset-x-0 text-center z-20">
              <div className="text-5xl font-sans font-thin text-white/80 drop-shadow-md">09:41</div>
              <div className="text-sm font-sans text-white/60 mt-1">Wednesday, September 12</div>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
        
        {/* Glow effect behind phone */}
        <div className="absolute inset-0 bg-accent/20 blur-[100px] -z-10 rounded-full" />
      </motion.div>

      {/* Controls & Info */}
      <div className="space-y-8 text-left">
        <div className="space-y-2">
          <h2 className="text-3xl font-mono font-bold text-white">Current Iteration</h2>
          <p className="text-muted-foreground max-w-md">
            The artwork evolves in real-time. Every new user adds a digit, creating a unique chord in the global sequence.
          </p>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-mono uppercase text-muted-foreground tracking-widest">Select Resolution</label>
          <div className="flex flex-wrap gap-2">
            {urls ? (
              Object.keys(urls.resolutions).map((res) => (
                <button
                  key={res}
                  onClick={() => setActiveRes(res as any)}
                  className={`
                    px-4 py-2 text-xs font-mono border transition-all duration-200
                    ${activeRes === res 
                      ? "border-accent text-accent bg-accent/10" 
                      : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"}
                  `}
                >
                  {res}
                </button>
              ))
            ) : (
              <div className="text-xs text-muted-foreground italic">Fetching resolutions...</div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            disabled={!urls}
            className="h-12 px-8 font-mono uppercase tracking-widest bg-white text-black hover:bg-neutral-200"
            onClick={() => {
              if (urls) window.open(urls.resolutions[activeRes], '_blank');
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button 
            variant="outline" 
            className="h-12 px-8 font-mono uppercase tracking-widest border-white/20 hover:bg-white/5"
            onClick={() => {
              document.getElementById('shortcut-guide')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Auto-Sync
          </Button>
        </div>
        
        <div className="p-4 border border-white/5 bg-white/5 rounded-sm">
           <code className="text-xs text-muted-foreground block mb-2">/api/pi/state</code>
           <div className="flex gap-4 text-xs font-mono">
             <div>
               <span className="text-gray-500">Status:</span> <span className="text-accent">Active</span>
             </div>
             <div>
               <span className="text-gray-500">Rendering:</span> <span className="text-white">Canvas 2D</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
