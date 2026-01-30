import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Check, ChevronRight, Copy, ExternalLink, Settings, List, ArrowRight, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WallpaperPreviewProps {
    urls?: {
        latest: string;
        resolutions: Record<string, string>;
    };
    isLoading: boolean;
}

const DEVICES = [
    { id: "iphone-11", name: "iPhone 11", res: "828x1792" },
    { id: "iphone-11-pro", name: "iPhone 11 Pro", res: "1125x2436" },
    { id: "iphone-12", name: "iPhone 12/13/14", res: "1170x2532" },
    { id: "iphone-14-pro", name: "iPhone 14 Pro", res: "1179x2556" },
    { id: "iphone-14-plus", name: "iPhone 14 Plus", res: "1284x2778" },
    { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", res: "1290x2796" },
    { id: "iphone-15", name: "iPhone 15 / 15 Pro", res: "1179x2556" },
    { id: "iphone-15-pro-max", name: "iPhone 15 Plus / Pro Max", res: "1290x2796" },
    { id: "iphone-16-pro", name: "iPhone 16 Pro", res: "1206x2622" },
    { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", res: "1320x2868" },
];

export function WallpaperPreview({ urls, isLoading }: WallpaperPreviewProps) {
    const [selectedDevice, setSelectedDevice] = useState(DEVICES[2]); // Default to iPhone 12/13/14
    const [showGuide, setShowGuide] = useState(false);
    const [copied, setCopied] = useState(false);

    const currentImageUrl = urls?.resolutions[selectedDevice.id] || urls?.latest;

    const handleCopyUrl = () => {
        if (!currentImageUrl) return;
        navigator.clipboard.writeText(currentImageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="py-24 px-4 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 relative overflow-hidden">
            {/* Background Text Overlay */}
            <div className="absolute top-20 left-0 text-[10vw] font-black text-white/[0.02] -z-10 select-none font-mono">
                AUTOMATE
            </div>

            {/* Device Mockup */}
            <div className="relative group shrink-0">
                {/* Glow behind phone */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 via-magenta-500/20 to-yellow-500/20 rounded-[3rem] blur-2xl group-hover:opacity-100 opacity-50 transition-opacity duration-700" />

                {/* Phone Frame */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-[280px] h-[580px] md:w-[320px] md:h-[660px] bg-neutral-900 rounded-[3rem] p-3 border-[8px] border-neutral-800 shadow-2xl overflow-hidden"
                >
                    {/* Speaker/Sensors */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-900 rounded-b-2xl z-20" />

                    {/* Screen Content */}
                    <div className="relative w-full h-full bg-black rounded-[2.2rem] overflow-hidden">
                        <AnimatePresence mode="wait">
                            {isLoading || !currentImageUrl ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full flex items-center justify-center bg-neutral-950"
                                >
                                    <div className="w-12 h-12 border-2 border-white/10 border-t-white/80 rounded-full animate-spin" />
                                </motion.div>
                            ) : (
                                <motion.img
                                    key={selectedDevice.id}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.6 }}
                                    src={currentImageUrl}
                                    alt="Pi Wallpaper Preview"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </AnimatePresence>

                        {/* UI Overlay (Time/Status) */}
                        <div className="absolute top-10 left-0 right-0 px-8 flex justify-between items-center z-10 text-white/90 font-medium text-xs">
                            <span>9:41</span>
                            <div className="flex gap-1.5">
                                <div className="w-4 h-2 border border-white/50 rounded-[1px]" />
                                <div className="w-4 h-2 bg-white/50 rounded-[1px]" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Controls Content Area */}
            <div className="flex-1 max-w-lg">
                <AnimatePresence mode="wait">
                    {!showGuide ? (
                        <motion.div
                            key="preview-controls"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-5xl font-bold font-mono tracking-tighter">
                                    A <span className="text-accent italic">LIVING</span> LEGACY
                                </h2>
                                <p className="text-muted-foreground text-sm md:text-base font-mono">
                                    Your wallpaper is no longer static. It's a real-time window into humanity's progress through the infinite.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-3">
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">Target Device</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full md:w-72 justify-between border-white/10 bg-white/5 hover:bg-white/10 h-12 font-mono text-xs tracking-widest uppercase">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="w-4 h-4 text-accent" />
                                                    {selectedDevice.name}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-white/20" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-72 bg-neutral-900 border-white/10 text-white font-mono">
                                            {DEVICES.map((device) => (
                                                <DropdownMenuItem
                                                    key={device.id}
                                                    onClick={() => setSelectedDevice(device)}
                                                    className="flex justify-between items-center text-[10px] tracking-widest uppercase py-3 cursor-pointer hover:bg-white/5"
                                                >
                                                    <span>{device.name}</span>
                                                    <span className="text-white/20 text-[8px]">{device.res}</span>
                                                    {selectedDevice.id === device.id && (
                                                        <Check className="w-3 h-3 text-accent" />
                                                    )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <Button
                                    onClick={() => setShowGuide(true)}
                                    disabled={isLoading || !currentImageUrl}
                                    className="group relative w-full md:w-72 h-16 bg-white text-black hover:bg-accent hover:text-white transition-all duration-500 font-bold overflow-hidden rounded-xl"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-xs">
                                        <Settings className="w-4 h-4 animate-spin-slow group-hover:scale-110 transition-transform" />
                                        Setup Auto-Update
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-magenta-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Button>

                                <p className="text-[10px] text-white/30 font-mono flex items-center gap-2">
                                    <Info className="w-3 h-3" />
                                    Optimized for iOS 16+ Shortcuts
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="shortcut-guide"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 md:p-8 space-y-8 backdrop-blur-xl"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold font-mono tracking-tight text-accent">SHORTCUT SETUP</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Automate your wallpaper</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowGuide(false)}
                                    className="rounded-full hover:bg-white/10 text-white/40 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Step 1: Copy URL */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-xs font-mono font-bold">
                                        <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px]">1</span>
                                        COPY WALLPAPER URL
                                    </div>
                                    <div className="relative flex items-center gap-2">
                                        <div className="flex-1 bg-black/40 border border-white/5 rounded-lg px-4 h-12 flex items-center text-[10px] font-mono text-white/60 overflow-hidden truncate">
                                            {currentImageUrl}
                                        </div>
                                        <Button
                                            onClick={handleCopyUrl}
                                            className={`shrink-0 h-12 w-12 md:w-32 rounded-lg transition-all duration-300 ${copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-accent hover:text-white'}`}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : (
                                                <div className="flex items-center gap-2">
                                                    <Copy className="w-4 h-4" />
                                                    <span className="hidden md:inline text-[10px] tracking-widest font-bold uppercase">Copy</span>
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Step 2: Shortcut Steps */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-xs font-mono font-bold">
                                        <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px]">2</span>
                                        CREATE SHORTCUT
                                    </div>
                                    <div className="grid gap-3">
                                        {[
                                            { icon: ExternalLink, text: "Open Shortcuts app & New Shortcut" },
                                            { icon: List, text: "Add 'Get Contents of URL' & paste link" },
                                            { icon: Smartphone, text: "Add 'Set Wallpaper' (use output image)" },
                                            { icon: Check, text: "Go to Automation > New > Time of Day" }
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-lg border border-white/[0.02]">
                                                <step.icon className="w-4 h-4 text-white/40" />
                                                <span className="text-[10px] md:text-xs font-mono text-white/70 leading-relaxed">
                                                    {step.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-center gap-2 text-[9px] text-white/20 font-mono text-center mb-[-10px]">
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                YOUR PI UPDATES AUTOMATICALLY EVERY TIME THE SHORTCUT RUNS
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
