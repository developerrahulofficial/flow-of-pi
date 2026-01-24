import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface DigitCounterProps {
  value: number;
}

export function DigitCounter({ value }: DigitCounterProps) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <motion.span className="text-6xl md:text-9xl font-mono font-light tracking-tighter text-white text-glow">
          {display}
        </motion.span>
        <span className="absolute -top-4 -right-8 text-xs font-mono text-accent animate-pulse">
          LIVE
        </span>
      </div>
      <span className="text-sm md:text-base text-muted-foreground font-mono mt-2 uppercase tracking-[0.2em]">
        Digits Unlocked
      </span>
    </div>
  );
}
