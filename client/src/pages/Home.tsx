import { Navigation } from "@/components/Navigation";
import { DigitCounter } from "@/components/DigitCounter";
import { WallpaperPreview } from "@/components/WallpaperPreview";
import { UserDigitSection } from "@/components/UserDigitSection";
import { Timeline } from "@/components/Timeline";
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
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 mb-24 relative"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-sm md:text-base font-mono text-accent tracking-[0.4em] uppercase mb-4">
                THE INFINITE MASTERPIECE
              </h1>
              {stateLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <DigitCounter value={piState?.currentDigitIndex || 0} />
                </motion.div>
              )}
            </div>

            <div className="py-0 px-4">
              <p className="text-muted-foreground text-xs md:text-sm font-mono max-w-lg mx-auto leading-relaxed mb-12">
                A living, evolving artwork visualized from the digits of Pi.
                Each connection represents a unique human contribution.
              </p>
              <Timeline />
            </div>

            <UserDigitSection />
          </motion.div>
        </motion.section>

        <motion.section
          id="download"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-neutral-950 border-y border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 font-mono text-9xl font-bold select-none pointer-events-none italic">
            3.14
          </div>
          <WallpaperPreview urls={wallpaper} isLoading={wallpaperLoading} />
        </motion.section>




        {/* Footer */}
        <footer id="about" className="py-20 border-t border-white/10 bg-black">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-12 text-center">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="text-[10px] text-white/40 font-mono tracking-[0.5em] uppercase">
                Collaborative Digital Art
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
                    <span className="text-2xl font-light text-white font-serif lowercase italic">π</span>
                  </div>
                  <div className="text-left">
                    <div className="text-[12px] font-black tracking-[0.3em] text-white">
                      FLOW <span className="text-white/30 font-light">OF PI</span>
                    </div>
                    <div className="text-[8px] font-mono tracking-[0.3em] text-white/20 uppercase mt-1">
                      Collaborative Masterpiece
                    </div>
                  </div>
                </div>

                <div className="text-sm font-mono text-white/60 flex items-center justify-center gap-3">
                  CRAFTED BY
                  <a
                    href="https://instagram.com/developer_rahul_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative px-4 py-1.5"
                  >
                    <div className="absolute inset-0 bg-white rounded-sm transform group-hover:skew-x-3 transition-transform duration-300" />
                    <span className="relative text-black font-black tracking-widest text-[11px] group-hover:text-accent transition-colors duration-300 uppercase">
                      @developer_rahul_
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8 pt-12 border-t border-white/5">
              <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
                © {new Date().getFullYear()} FLOW OF PI. All rights reserved.
              </div>

              <div className="text-[10px] text-white/30 text-center md:text-right max-w-sm font-mono leading-relaxed">
                <p>
                  Special thanks to the pioneers of Pi visualization. Every digit is deterministically rendered on the fly.
                </p>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
