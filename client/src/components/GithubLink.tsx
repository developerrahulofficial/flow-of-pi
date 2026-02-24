import { useState, useEffect } from "react";
import { Github, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function GithubLink({ className }: { className?: string }) {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        fetch("https://api.github.com/repos/developerrahulofficial/flow-of-pi")
            .then(res => res.json())
            .then(data => {
                if (data && typeof data.stargazers_count === "number") {
                    setStars(data.stargazers_count);
                }
            })
            .catch(console.error);
    }, []);

    return (
        <a
            href="https://github.com/developerrahulofficial/flow-of-pi"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors group",
                className
            )}
            title="Star repository on GitHub"
        >
            <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {stars !== null && (
                <span className="flex items-center gap-0.5 bg-white/5 px-1.5 py-0.5 rounded-sm border border-white/10 group-hover:border-white/20 transition-colors">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{stars}</span>
                </span>
            )}
        </a>
    );
}
