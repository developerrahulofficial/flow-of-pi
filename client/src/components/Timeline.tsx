import { usePiTimeline, useMyDigit } from "@/hooks/use-pi";
import { useState, useRef } from "react";
import { Target } from "lucide-react";

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
                        id={`digit-${node.digitIndex}`}
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
    const { data: myDigit } = useMyDigit();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const jumpToMyDigit = () => {
        if (!myDigit) return;
        const el = document.getElementById(`digit-${myDigit.digitIndex}`);
        if (el && scrollContainerRef.current) {
            const containerLeft = scrollContainerRef.current.getBoundingClientRect().left;
            const containerWidth = scrollContainerRef.current.clientWidth;
            const elLeft = el.getBoundingClientRect().left;
            const elWidth = el.clientWidth;

            const currentScroll = scrollContainerRef.current.scrollLeft;
            const targetScroll = currentScroll + (elLeft - containerLeft) - (containerWidth / 2) + (elWidth / 2);

            scrollContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

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

    return (
        <div className="relative w-full flex flex-col items-center">
            {myDigit && (
                <button
                    onClick={jumpToMyDigit}
                    className="mb-8 z-30 px-6 py-2.5 bg-background shadow-[0_0_20px_rgba(74,222,128,0.25)] hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] text-accent rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2.5 border border-accent/40 hover:border-accent hover:bg-accent/10 hover:-translate-y-0.5"
                >
                    <Target className="w-4 h-4" />
                    Locate My Digit
                </button>
            )}

            <div className="relative w-full text-white">
                {/* Fade masks */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-40 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-40 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

                {/* Scroll track */}
                <div
                    ref={scrollContainerRef}
                    className={`overflow-x-auto no-scrollbar flex w-full cursor-grab active:cursor-grabbing select-none pb-4`}
                    onMouseDown={onMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
                >
                    <div className="flex-shrink-0 flex items-center px-4">
                        {/* Start padding to ensure first and last items can be centered */}
                        <div className="w-[45vw] flex-shrink-0" aria-hidden="true" />
                        <NodeList nodes={timeline} />
                        <div className="w-[45vw] flex-shrink-0" aria-hidden="true" />
                    </div>
                </div>
            </div>
        </div>
    );
}
