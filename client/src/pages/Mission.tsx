import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Mission() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <div className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <Link href="/">
                        <a className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 font-mono text-xs uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Home
                        </a>
                    </Link>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-16"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-magenta-400 to-yellow-400 bg-clip-text text-transparent">
                            The Mission
                        </h1>
                        <p className="text-xl md:text-2xl text-white/60 font-light max-w-2xl">
                            Transforming the infinite beauty of Pi into a collective work of art, one digit at a time.
                        </p>
                    </motion.div>

                    {/* Content Sections */}
                    <div className="space-y-16">
                        {/* The Concept */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="border-l-2 border-accent/30 pl-6"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-accent">The Concept</h2>
                            <div className="space-y-4 text-white/70 leading-relaxed">
                                <p>
                                    <span className="font-bold text-white">Flow of Pi</span> is an experiment in collective digital art.
                                    Each participant claims a single, unique digit from the infinite sequence of Pi (3.14159...).
                                </p>
                                <p>
                                    As more people join, a stunning circular chord diagram emerges — visualizing the mathematical
                                    relationships between consecutive digits through colored arcs and connections.
                                </p>
                                <p>
                                    Your participation becomes permanent: your Instagram handle is forever linked to your digit
                                    in the sequence, creating a living timeline of discovery.
                                </p>
                            </div>
                        </motion.section>

                        {/* How It Works */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="border-l-2 border-cyan-500/30 pl-6"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-cyan-400">How It Works</h2>
                            <div className="space-y-4 text-white/70 leading-relaxed">
                                <p className="font-mono text-sm">
                                    <span className="text-white font-bold">1-User-1-Digit System</span>
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Sign in with Google and provide your Instagram handle</li>
                                    <li>You'll be assigned the next available digit in Pi's sequence</li>
                                    <li>Your digit is permanent — no one else can claim it</li>
                                    <li>Each new participant unlocks the next digit, revealing more of Pi</li>
                                </ul>

                                <p className="font-mono text-sm pt-4">
                                    <span className="text-white font-bold">The Visualization</span>
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Digits 0-9 are arranged in a circle, each with a unique color</li>
                                    <li>Curved chords connect consecutive digits in the sequence</li>
                                    <li>The wallpaper updates automatically as new users join</li>
                                    <li>Download your personalized Pi wallpaper for any device</li>
                                </ul>
                            </div>
                        </motion.section>

                        {/* The Art */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="border-l-2 border-magenta-500/30 pl-6"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-magenta-400">The Artistic Vision</h2>
                            <div className="space-y-4 text-white/70 leading-relaxed">
                                <p>
                                    The chord diagram is inspired by <span className="text-white font-semibold">Circos plots</span> used
                                    in genomics and data visualization. Each digit gets a spectral color:
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-4">
                                    {[
                                        { digit: 0, color: "#666666", name: "Grey" },
                                        { digit: 1, color: "#EF4444", name: "Red" },
                                        { digit: 2, color: "#F97316", name: "Orange" },
                                        { digit: 3, color: "#FACC15", name: "Yellow" },
                                        { digit: 4, color: "#4ADE80", name: "Green" },
                                        { digit: 5, color: "#2DD4BF", name: "Teal" },
                                        { digit: 6, color: "#3B82F6", name: "Blue" },
                                        { digit: 7, color: "#6366F1", name: "Indigo" },
                                        { digit: 8, color: "#A855F7", name: "Purple" },
                                        { digit: 9, color: "#EC4899", name: "Pink" },
                                    ].map(({ digit, color, name }) => (
                                        <div key={digit} className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full border border-white/20"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="text-xs font-mono">
                                                <span className="text-white font-bold">{digit}</span>
                                                <span className="text-white/40"> · {name}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p>
                                    As the sequence grows, patterns emerge — repeating digits cluster as dots, while transitions
                                    between different digits create flowing, curved connections. The result is a unique, ever-evolving
                                    mathematical masterpiece.
                                </p>
                            </div>
                        </motion.section>

                        {/* Community */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="border-l-2 border-yellow-500/30 pl-6"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-400">Join the Flow</h2>
                            <div className="space-y-4 text-white/70 leading-relaxed">
                                <p>
                                    Every participant contributes to something larger than themselves. Your digit, your handle,
                                    your moment in time — all preserved in the infinite flow of Pi.
                                </p>
                                <p>
                                    The timeline shows the complete history: who unlocked which digit, when, and in what order.
                                    You're not just claiming a number — you're becoming part of mathematical history.
                                </p>
                                <p className="text-white font-semibold pt-4">
                                    Ready to claim your place in Pi's endless sequence?
                                </p>
                            </div>
                        </motion.section>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="pt-8 pb-16 text-center"
                        >
                            <Link href="/">
                                <a className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-magenta-500 text-white font-bold text-sm uppercase tracking-widest rounded-lg hover:scale-105 transition-transform duration-300">
                                    Start Your Journey
                                </a>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
