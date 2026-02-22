import { usePiTimeline } from "@/hooks/use-pi";
import { useEffect, useState } from "react";

// --- CSS marquee keyframe injected once ---
const MARQUEE_STYLE = `
@keyframes marquee-rtl {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-rtl var(--marquee-duration, 30s) linear infinite;
  will-change: transform;
}
.marquee-track.paused {
  animation-play-state: paused;
}
`;

function injectStyle() {
    if (document.getElementById("timeline-marquee-style")) return;
    const tag = document.createElement("style");
    tag.id = "timeline-marquee-style";
    tag.textContent = MARQUEE_STYLE;
    document.head.appendChild(tag);
}

// ─── Dashed connector line ───────────────────────────────────────────────────
function DashedLine({ className = "" }: { className?: string }) {
    return (
        <div
            className={`w-px ${className}`}
            style={{
                backgroundImage:
                    "linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(74,222,128,0.35) 40%, rgba(74,222,128,0.35) 100%)",
                backgroundSize: "1px 5px",
                backgroundRepeat: "repeat-y",
            }}
        />
    );
}

// ─── User card ───────────────────────────────────────────────────────────────
function UserCard({ node }: { node: any }) {
    return (
        <div className="bg-black/90 backdrop-blur-md border border-accent/20 rounded md:rounded-md p-0.5 md:p-1.5 min-w-[54px] md:min-w-[110px] max-w-[80px] md:max-w-[160px] text-center hover:border-accent group transition-all duration-300 shadow-[0_0_12px_rgba(0,0,0,0.6)] z-30">
            <div className="text-[7px] md:text-[9px] font-sans leading-tight">
                {node.user.firstName && (
                    <div className="font-bold text-white group-hover:text-accent transition-colors truncate">
                        {node.user.firstName}
                    </div>
                )}
                {node.user.instagramHandle && (
                    <a
                        href={`https://instagram.com/${node.user.instagramHandle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent/60 hover:text-accent block mt-0.5 transition-colors truncate"
                    >
                        @{node.user.instagramHandle.replace("@", "")}
                    </a>
                )}
                {!node.user.firstName && !node.user.instagramHandle && (
                    <div className="text-muted-foreground uppercase tracking-widest text-[6px] md:text-[8px]">
                        ANON
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Sub-component: renders a single list of nodes ──────────────────────────
// Uses an in-flow flex-column layout per digit (no absolute positioning),
// so cards NEVER escape the container and get clipped.
function NodeList({ nodes }: { nodes: any[] }) {
    return (
        // items-end aligns everything on the bottom of the top zone → baseline of digit
        <div className="flex items-stretch">
            {nodes.map((node, index) => {
                const isTop = index % 2 === 1;
                const hasUserCard = !node.isSystem && node.user;
                const spacingClass = hasUserCard ? "mx-3 md:mx-8" : "mx-px md:mx-1";

                return (
                    <div
                        key={`${node.digitIndex}-${index}`}
                        className={`flex flex-col items-center ${spacingClass}`}
                    >
                        {/* ── TOP ZONE (fixed height) ── */}
                        <div className="flex flex-col items-center justify-end h-28 md:h-36">
                            {isTop && hasUserCard && (
                                <>
                                    <UserCard node={node} />
                                    <DashedLine className="h-4 md:h-6 mt-0.5" />
                                    {/* arrowhead pointing down */}
                                    <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-l-transparent border-r-transparent border-t-[4px] border-t-accent/40" />
                                </>
                            )}
                            {node.isSystem && (
                                <>
                                    <div className="mb-0.5 bg-neutral-900/80 border border-accent/20 rounded px-1 py-0.5">
                                        <div className="text-[6px] md:text-[8px] font-mono text-accent/70 tracking-widest">SYS</div>
                                    </div>
                                    <DashedLine className="h-3 md:h-5" />
                                    <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-l-transparent border-r-transparent border-t-[4px] border-t-accent/25" />
                                </>
                            )}
                            {/* spacer for digits that have nothing on top */}
                        </div>

                        {/* ── DIGIT ── */}
                        <div className="text-3xl md:text-5xl font-mono font-bold leading-none select-none">
                            {index === 0 ? (
                                <span className="text-accent">{node.digitValue}.</span>
                            ) : (
                                <span className={node.isSystem ? "text-accent" : "text-white"}>
                                    {node.digitValue}
                                </span>
                            )}
                        </div>

                        {/* ── BOTTOM ZONE (fixed height) ── */}
                        <div className="flex flex-col items-center justify-start h-28 md:h-36">
                            {!isTop && hasUserCard && (
                                <>
                                    {/* arrowhead pointing down into the card */}
                                    <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-l-transparent border-r-transparent border-t-[4px] border-t-accent/40" />
                                    <DashedLine className="h-4 md:h-6 mb-0.5" />
                                    <UserCard node={node} />
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Timeline ───────────────────────────────────────────────────────────
export function Timeline() {
    const { data: timeline, isLoading } = usePiTimeline();
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        injectStyle();
    }, []);

    if (isLoading) {
        return (
            <div className="py-8">
                <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
            </div>
        );
    }

    if (!timeline || timeline.length === 0) {
        return null;
    }

    const duration = Math.max(20, timeline.length * 3);

    return (
        // overflow-x-hidden ONLY — but since we no longer use absolute positioning,
        // vertical content won't be clipped at all.
        <div className="relative w-full" style={{ overflowX: "hidden" }}>
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

            {/* Marquee track */}
            <div
                className={`marquee-track${isPaused ? " paused" : ""}`}
                style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
            >
                {/* Copy 1 — trailing spacer signals end of sequence */}
                <div className="flex-shrink-0 flex items-center px-4">
                    <NodeList nodes={timeline} />
                    <div className="w-32 md:w-56 flex-shrink-0" aria-hidden="true" />
                </div>
                {/* Copy 2 — seamless loop */}
                <div className="flex-shrink-0 flex items-center px-4" aria-hidden="true">
                    <NodeList nodes={timeline} />
                    <div className="w-32 md:w-56 flex-shrink-0" aria-hidden="true" />
                </div>
            </div>
        </div>
    );
}
