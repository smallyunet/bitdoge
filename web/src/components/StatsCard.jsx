import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

export function StatsCard({ label, value, subtext, delay = 0, className }) {
    const reduceMotion = useReducedMotion();
    const isLoading = value === null || value === undefined;

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? false : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.5, delay }}
            className={cn(
                "bg-glass border border-neutral-800 p-6 rounded-xl flex flex-col items-start hover:border-bitdoge-gold/50 transition-colors",
                className
            )}
        >
            <span className="text-neutral-500 text-sm uppercase tracking-wider mb-2 font-mono">
                {label}
            </span>
            <span className={cn(
                "text-3xl lg:text-4xl font-bold text-white mb-1 font-mono text-glow",
                isLoading && "text-neutral-600 animate-pulse"
            )}>
                {isLoading ? "—" : value}
            </span>
            {subtext && (
                <span className="text-neutral-400 text-xs mt-1">{subtext}</span>
            )}
        </motion.div>
    );
}
