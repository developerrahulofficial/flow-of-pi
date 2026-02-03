import { usePiTimeline } from "@/hooks/use-pi";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function Timeline() {
    const { data: timeline, isLoading } = usePiTimeline();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const lastScrollPos = useRef(0);

    // Auto-scroll logic
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isLoading || isPaused) return;

        let animationFrameId: number;
        const speed = 0.5; // Constant ticker speed

        const scroll = () => {
            if (scrollContainer) {
                // Linear Scroll with Restart
                // We scroll until the very end, then snap back to 0.

                // Check if we have reached the end of the scrollable area
                if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1) {
                    scrollContainer.scrollLeft = 0; // Restart from beginning
                } else {
                    scrollContainer.scrollLeft += speed;
                }

                animationFrameId = requestAnimationFrame(scroll);
            }
        };

        animationFrameId = requestAnimationFrame(scroll);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isLoading, isPaused]);

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

    // Function to get arrow height based on position
    const getArrowHeight = (index: number) => {
        // Strict alternating pattern for same-side elements to prevent overlap
        // On mobile, avoiding random heights is crucial.
        // Even indices are Bottom, Odd indices are Top.
        // We want neighbor Bottoms to be High/Low/High/Low.
        // We want neighbor Tops to be Low/High/Low/High.

        const isTop = index % 2 === 1;
        // For top items (1, 3, 5...), we alternate based on (index - 1) / 2
        // For bottom items (0, 2, 4...), we alternate based on index / 2

        const sequenceIndex = Math.floor(index / 2);
        const isTall = sequenceIndex % 2 === 0;

        // Reduced heights for mobile and desktop
        if (isTop) {
            return isTall ? "h-12 md:h-16" : "h-4 md:h-8";
        } else {
            return isTall ? "h-12 md:h-16" : "h-4 md:h-8";
        }
    };

    return (
        <div className="relative w-full">
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

            <div
                ref={scrollRef}
                className="py-8 md:py-12 w-full overflow-x-hidden whitespace-nowrap" // hidden overflow to force ticker feel
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
            >
                <div className="inline-flex px-4 min-w-max">
                    {/* No Sticky header inside the scroll area it breaks the flow. Move title outside if needed, or keep it scrolling?
                        Verify: User wants "News Ticker". Usually headers don't scroll.
                        Let's remove the header from *inside* the scroll if we want it static,
                        BUT keeping it scrolling might be part of the "Timeline" feel?
                        Actually, let's keep the header *static* above the timeline to be cleaner.
                        Wait, current structure has header inside. I'll leave it out for now to focus on the numbers.
                     */}

                    {/* Fixed Header (Outside strictly, but if we want it scrolling... let's keep it simple) */}

                    {/* Pi Digits Display - Rendered inline */}
                    <div className="flex items-baseline text-2xl md:text-5xl font-mono font-bold pt-16 pb-16 md:pt-24 md:pb-24"> {/* Reduced padding for desktop too */}
                        {timeline.map((node, index) => {
                            const isTop = index % 2 === 1;
                            const arrowHeight = getArrowHeight(index); // This might break pattern across the duplication seam?
                            // ideally we want the seam to be seamless.
                            // length is usually even or large enough?
                            // If timeline.length is odd, the parity flips at the seam.
                            // We should probably rely on the *original* index logic?
                            // No, for visual continuity, we just treat the second half as a continuation.
                            // If length is odd, there will be a flip. Let's not overthink it for now.

                            const hasCard = !node.isSystem && node.user;

                            // Ticker Spacing: compact on mobile and desktop
                            // md:mx-16 -> md:mx-8
                            const spacingClass = hasCard ? "mx-3 md:mx-8" : "mx-px md:mx-1";

                            return (
                                <div
                                    key={node.digitIndex}
                                    className={`relative inline-block ${spacingClass}`}
                                >
                                    {/* Decimal point after first digit */}
                                    {index === 0 && (
                                        <span className="text-accent">{node.digitValue}.</span>
                                    )}
                                    {index > 0 && (
                                        <span className={`${node.isSystem ? "text-accent" : "text-white"} transition-colors duration-500`}>
                                            {node.digitValue}
                                        </span>
                                    )}

                                    {/* User indicator */}
                                    {!node.isSystem && node.user && (
                                        <div className={`absolute ${isTop ? "bottom-full mb-1" : "top-full mt-1"} left-1/2 -translate-x-1/2 flex flex-col ${isTop ? "items-center flex-col-reverse" : "items-center"} z-10 w-max`}>
                                            <div
                                                className={`w-px bg-accent/30 ${arrowHeight}`}
                                                style={{
                                                    backgroundImage: 'linear-gradient(to bottom, transparent 0%, transparent 50%, currentColor 50%, currentColor 100%)',
                                                    backgroundSize: '1px 4px',
                                                    backgroundRepeat: 'repeat-y'
                                                }}
                                            />
                                            <div className={`w-0 h-0 border-l-[2px] border-r-[2px] border-l-transparent border-r-transparent ${isTop ? "border-b-[3px] border-b-accent/30" : "border-t-[3px] border-t-accent/30"}`} />

                                            {/* Scaled down Card - Desktop also reduced */}
                                            <div className={`${isTop ? "mb-1" : "mt-1"} bg-black/90 backdrop-blur-md border border-accent/20 rounded md:rounded-md p-0.5 md:p-1.5 min-w-[50px] md:min-w-[100px] max-w-[70px] md:max-w-[160px] text-center hover:border-accent group transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                                                <div className="text-[7px] md:text-[9px] font-sans leading-tight">
                                                    {node.user.firstName && (
                                                        <div className="font-bold text-white group-hover:text-accent transition-colors truncate">
                                                            {node.user.firstName}
                                                        </div>
                                                    )}
                                                    {node.user.instagramHandle && (
                                                        <a
                                                            href={`https://instagram.com/${node.user.instagramHandle.replace('@', '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-accent/60 hover:text-accent block mt-0.5 transition-colors truncate"
                                                        >
                                                            @{node.user.instagramHandle.replace('@', '')}
                                                        </a>
                                                    )}
                                                    {!node.user.firstName && !node.user.instagramHandle && (
                                                        <div className="text-muted-foreground uppercase tracking-widest text-[6px] md:text-[8px]">ANON</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* System indicator */}
                                    {node.isSystem && (
                                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 flex flex-col items-center flex-col-reverse z-10 w-max">
                                            <div
                                                className="w-px h-3 md:h-6 bg-accent/20"
                                                style={{
                                                    backgroundImage: 'linear-gradient(to bottom, transparent 0%, transparent 50%, currentColor 50%, currentColor 100%)',
                                                    backgroundSize: '1px 3px',
                                                    backgroundRepeat: 'repeat-y'
                                                }}
                                            />
                                            <div className="w-0 h-0 border-l-[2px] border-r-[2px] border-l-transparent border-r-transparent border-b-[3px] border-b-accent/20" />
                                            <div className="mb-0.5 bg-neutral-900/80 border border-accent/20 rounded px-1 py-0.5">
                                                <div className="text-[6px] md:text-[8px] font-mono text-accent/70 tracking-widest">SYS</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
