import { usePiTimeline } from "@/hooks/use-pi";
import { motion } from "framer-motion";

export function Timeline() {
    const { data: timeline, isLoading } = usePiTimeline();

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
    // Shorter heights for a more compact look
    const getArrowHeight = (index: number) => {
        const heights = ["h-3", "h-6", "h-9", "h-12", "h-15"];
        // Deterministic but staggered height based on index
        const heightIndex = (index * 2) % 5;
        return heights[heightIndex];
    };

    return (
        <div className="py-12 w-full overflow-x-auto scrollbar-hide">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-6xl mx-auto px-4"
            >
                <div className="mb-12 text-center space-y-2">
                    <h2 className="text-xs md:text-sm font-mono text-accent tracking-[0.3em] uppercase">
                        Pi Sequence Timeline
                    </h2>
                    <div className="text-[9px] md:text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase">
                        ( backed by humans )
                    </div>
                </div>

                {/* Pi Digits Display */}
                <div className="relative flex items-center justify-center py-20 md:py-24">
                    <div className="flex items-baseline gap-2 md:gap-4 text-4xl md:text-7xl font-mono font-bold">
                        {timeline.map((node, index) => {
                            const isTop = index % 2 === 1;
                            const arrowHeight = getArrowHeight(index);
                            const hasCard = !node.isSystem && node.user;

                            return (
                                <div
                                    key={node.digitIndex}
                                    className={`relative inline-block ${hasCard ? "px-4 md:px-6" : "px-0.5 md:px-1"}`}
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

                                    {/* User indicator with dotted arrow */}
                                    {!node.isSystem && node.user && (
                                        <div className={`absolute ${isTop ? "bottom-full mb-1" : "top-full mt-1"} left-1/2 -translate-x-1/2 flex flex-col ${isTop ? "items-center flex-col-reverse" : "items-center"} z-10`}>
                                            {/* Dotted vertical line with staggered heights */}
                                            <div
                                                className={`w-px bg-accent/30 ${arrowHeight}`}
                                                style={{
                                                    backgroundImage: 'linear-gradient(to bottom, transparent 0%, transparent 50%, currentColor 50%, currentColor 100%)',
                                                    backgroundSize: '1px 3px',
                                                    backgroundRepeat: 'repeat-y'
                                                }}
                                            />

                                            {/* Arrow head */}
                                            <div className={`w-0 h-0 border-l-[3px] border-r-[3px] border-l-transparent border-r-transparent ${isTop ? "border-b-[4px] border-b-accent/30" : "border-t-[4px] border-t-accent/30"}`} />

                                            {/* User card - responsive sizing */}
                                            <div className={`${isTop ? "mb-1" : "mt-1"} bg-black/95 backdrop-blur-md border border-accent/20 rounded h-12 md:h-14 flex flex-col justify-center px-3 min-w-[80px] md:min-w-[130px] max-w-[110px] md:max-w-[170px] text-center hover:border-accent group transition-all duration-300 shadow-xl shadow-black/50`}>
                                                <div className="text-[9px] md:text-[10px] font-sans overflow-hidden">
                                                    {node.user.firstName && (
                                                        <div className="font-bold text-white truncate group-hover:text-accent transition-colors hidden md:block">
                                                            {node.user.firstName}
                                                        </div>
                                                    )}
                                                    {node.user.instagramHandle && (
                                                        <a
                                                            href={`https://instagram.com/${node.user.instagramHandle.replace('@', '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-accent/80 hover:text-accent underline decoration-accent/30 underline-offset-2 truncate block text-[9px] md:text-[9px] mt-0.5"
                                                        >
                                                            @{node.user.instagramHandle.replace('@', '')}
                                                        </a>
                                                    )}
                                                    {!node.user.firstName && !node.user.instagramHandle && (
                                                        <div className="text-muted-foreground uppercase tracking-widest text-[8px]">Anonymous</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* System indicator (Always level 0) */}
                                    {node.isSystem && (
                                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 flex flex-col items-center flex-col-reverse z-10">
                                            <div
                                                className="w-px h-4 bg-accent/20"
                                                style={{
                                                    backgroundImage: 'linear-gradient(to bottom, transparent 0%, transparent 50%, currentColor 50%, currentColor 100%)',
                                                    backgroundSize: '1px 2px',
                                                    backgroundRepeat: 'repeat-y'
                                                }}
                                            />
                                            <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-l-transparent border-r-transparent border-b-[4px] border-b-accent/20" />
                                            <div className="mb-1 bg-neutral-900 border border-accent/30 rounded px-1.5 py-0.5">
                                                <div className="text-[7px] font-mono text-accent font-bold tracking-widest">SYSTEM</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Continue with dots */}
                        <span className="text-muted-foreground tracking-widest">...</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-16 text-center">
                    <div className="text-[9px] md:text-[10px] text-white/30 font-mono uppercase tracking-[0.2em] bg-white/5 inline-block px-4 py-1 rounded-full border border-white/5">
                        {timeline.length} digits verified in sequence
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
