import { Navigation } from "@/components/Navigation";
import { DigitCounter } from "@/components/DigitCounter";
import { WallpaperPreview } from "@/components/WallpaperPreview";
import { UserDigitSection } from "@/components/UserDigitSection";
import { ShortcutGuide } from "@/components/ShortcutGuide";
import { usePiState, useWallpaper } from "@/hooks/use-pi";
import { motion } from "framer-motion";

export default function Home() {
  const { data: piState, isLoading: stateLoading } = usePiState();
  const { data: wallpaper, isLoading: wallpaperLoading } = useWallpaper();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-black overflow-x-hidden">
      <div className="fixed inset-0 scanlines pointer-events-none z-50 opacity-20" />
      
      <Navigation />

      <main className="pt-32 pb-16">
        
        {/* Hero Section */}
        <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 mb-24 relative">
          
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-sm md:text-base font-mono text-accent tracking-[0.3em] uppercase mb-4">
                Global Collaborative Art
              </h1>
              {stateLoading ? (
                <div className="h-32 flex items-center justify-center">
                   <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
              ) : (
                <DigitCounter value={piState?.currentDigitIndex || 0} />
              )}
            </div>

            <UserDigitSection />
          </motion.div>
        </section>

        {/* Wallpaper Preview Section */}
        <section id="download" className="bg-neutral-950 border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 font-mono text-9xl font-bold select-none pointer-events-none">
            3.14
          </div>
          <WallpaperPreview urls={wallpaper} isLoading={wallpaperLoading} />
        </section>

        {/* Shortcut Guide */}
        <ShortcutGuide />

        {/* Footer */}
        <footer id="about" className="py-12 border-t border-white/10 bg-black">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xs text-muted-foreground font-mono">
              © {new Date().getFullYear()} PI_WALLPAPER. All rights reserved.
            </div>
            
            <div className="text-xs text-muted-foreground text-center md:text-right max-w-sm">
              <p className="mb-2">
                Inspired by the visualisations of Martin Krzywinski and Cristian Ilies Vasile.
              </p>
              <p className="opacity-50">
                Every digit is deterministically rendered using the HTML5 Canvas API on the server.
              </p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
