import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyDigit, useAssignDigit } from "@/hooks/use-pi";
import { Button } from "@/components/ui/button";
import { Loader2, Fingerprint, Share2, Instagram, Check, ArrowRightCircle } from "lucide-react";
import { JoinDialog } from "./JoinDialog";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";

const DIGIT_COLORS = [
  "#666666", // 0 → Grey
  "#EF4444", // 1 → Red
  "#F97316", // 2 → Orange
  "#FACC15", // 3 → Yellow
  "#4ADE80", // 4 → Green
  "#2DD4BF", // 5 → Teal
  "#3B82F6", // 6 → Blue
  "#6366F1", // 7 → Indigo
  "#A855F7", // 8 → Purple
  "#EC4899", // 9 → Pink
];

const PHI = (1 + Math.sqrt(5)) / 2;

function ChordVisualizer({ from, to, index }: { from: number; to: number; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 500;
    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.42;

    ctx.clearRect(0, 0, size, size);

    // Draw background ring
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    const segmentAngle = (Math.PI * 2) / 10;

    // Accurate Jitter from PiEngine
    // Chord for index is between index-1 and index. Engine uses 'i' as index here.
    const jitterA = ((index * PHI) % 1) * 0.9 + 0.05;
    const jitterB = (((index + 1) * PHI) % 1) * 0.9 + 0.05;

    const angleA = (from * segmentAngle) + (jitterA * segmentAngle) - Math.PI / 2;
    const angleB = (to * segmentAngle) + (jitterB * segmentAngle) - Math.PI / 2;

    const x1 = cx + R * Math.cos(angleA);
    const y1 = cy + R * Math.sin(angleA);
    const x2 = cx + R * Math.cos(angleB);
    const y2 = cy + R * Math.sin(angleB);

    let midAngle = (angleA + angleB) / 2;
    if (Math.abs(angleA - angleB) > Math.PI) {
      midAngle += Math.PI;
    }

    const innerR = R * 0.4;
    const cpX = cx + innerR * Math.cos(midAngle);
    const cpY = cy + innerR * Math.sin(midAngle);

    // Draw the segments
    for (let i = 0; i < 10; i++) {
      const start = i * segmentAngle - Math.PI / 2;
      const end = (i + 1) * segmentAngle - Math.PI / 2;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, R, start + 0.05, end - 0.05);
      ctx.strokeStyle = DIGIT_COLORS[i];
      ctx.stroke();
    }

    // Draw the active chord
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 12;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, DIGIT_COLORS[from]);
    gradient.addColorStop(1, DIGIT_COLORS[to]);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cpX, cpY, x2, y2);
    ctx.strokeStyle = gradient;
    ctx.lineCap = "round";

    ctx.shadowBlur = 40;
    ctx.shadowColor = DIGIT_COLORS[to];
    ctx.stroke();

    // Draw active dots
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
    [{ x: x1, y: y1, c: from }, { x: x2, y: y2, c: to }].forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = DIGIT_COLORS[p.c];
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

  }, [from, to, index]);

  return <canvas ref={canvasRef} width={500} height={500} className="w-[220px] h-[220px] md:w-[260px] md:h-[260px]" />;
}

export function UserDigitSection() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: myDigit, isLoading: digitLoading } = useMyDigit();
  const { mutate: assignDigit, isPending: isAssigning } = useAssignDigit();
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#000000",
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `pi-chord-${myDigit?.digitIndex}.png`;
      link.click();

      setHasShared(true);
      setTimeout(() => setHasShared(false), 3000);
    } catch (err) {
      console.error("Failed to capture card:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 space-y-6">
        <h3 className="text-xl font-mono text-white/80 uppercase">Claim Your DNA in Infinity</h3>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm">
          Secure your permanent spot in the sequence. Your unique digit will be encoded into the collective masterpiece forever.
        </p>
        <JoinDialog
          trigger={
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-white hover:text-black font-mono tracking-widest uppercase h-14 px-8 rounded-none border-2 border-accent transition-all duration-300"
            >
              <Fingerprint className="w-5 h-5 mr-3" />
              Claim My Digit
            </Button>
          }
        />
      </div>
    );
  }

  if (!digitLoading && !myDigit) {
    return (
      <div className="text-center py-12 space-y-6 border border-white/10 rounded-lg p-8 bg-white/5">
        <h3 className="text-2xl font-mono text-white uppercase font-bold tracking-tight">Welcome, {user.firstName || "Explorer"}</h3>
        <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider">You haven't joined the sequence yet.</p>
        <Button
          onClick={() => assignDigit()}
          disabled={isAssigning}
          className="bg-accent text-black hover:bg-white font-mono h-12 px-8 uppercase tracking-widest font-bold"
        >
          {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reveal My Digit"}
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {myDigit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto py-8"
        >
          <div className="flex flex-col items-center gap-6">
            <div
              ref={cardRef}
              className="relative w-[340px] h-[600px] bg-black border border-white/10 overflow-hidden flex flex-col items-center p-6"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#FFFFFF" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative z-10 text-center pt-4 w-full h-full flex flex-col justify-between">
                <header className="space-y-1">
                  <div className="text-[10px] font-mono tracking-[0.6em] text-accent font-black uppercase">
                    Infinite Masterpiece
                  </div>
                  <div className="text-3xl font-bold font-mono text-white uppercase tracking-tighter">
                    Digit Unlocked
                  </div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">
                    I revealed position #{myDigit.digitIndex}
                  </div>
                </header>

                <main className="flex flex-col items-center gap-4">
                  <ChordVisualizer
                    from={myDigit.digitIndex === 1 ? myDigit.digitValue : (myDigit.fromDigit ?? 0)}
                    to={myDigit.toDigit ?? myDigit.digitValue}
                    index={myDigit.digitIndex}
                  />

                  <div className="flex items-center justify-center gap-6 w-full">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black font-mono text-cyan-400">
                        {myDigit.digitIndex === 1 ? "-" : (myDigit.fromDigit ?? "-")}
                      </span>
                      <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest mt-1">Origin</span>
                    </div>

                    <ArrowRightCircle className="w-6 h-6 text-white/20" />

                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black font-mono text-accent">
                        {myDigit.toDigit ?? myDigit.digitValue}
                      </span>
                      <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest mt-1">Result</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-white/70 leading-relaxed italic max-w-[240px] mx-auto mb-2">
                    "My contribution to the sequence. A visual chord drawn into the flow of Pi."
                  </p>
                  <div className="w-full h-px bg-white/20" />
                </main>

                <footer className="w-full pb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-[8px] font-mono text-white/40 uppercase font-black">Contributor</div>
                      <div className="text-xs font-mono text-white uppercase font-black tracking-wider">
                        @{user.instagramHandle?.replace('@', '') || "Explorer"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] font-mono text-white/40 uppercase font-black">Platform</div>
                      <div className="text-xs font-mono text-accent font-black tracking-widest uppercase">FLOWOFPI.COM</div>
                    </div>
                  </div>
                </footer>
              </div>
            </div>

            <Button
              onClick={handleShare}
              disabled={isCapturing}
              className="w-full h-14 bg-white text-black hover:bg-accent hover:text-white transition-all duration-300 font-black tracking-[0.2em] uppercase rounded-none border-2 border-white flex gap-3 text-sm"
            >
              {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : hasShared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {hasShared ? "READY TO POST" : "Share as Story"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
