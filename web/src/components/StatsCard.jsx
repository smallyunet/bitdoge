import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export function StatsCard({ label, value, subtext, delay = 0, className }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "bg-glass border border-neutral-800 p-6 rounded-xl flex flex-col items-start hover:border-bitdoge-gold/50 transition-colors",
                className
            )}
        >
            <span className="text-neutral-500 text-sm uppercase tracking-wider mb-2 font-mono">
                {label}
            </span>
            <span className="text-3xl lg:text-4xl font-bold text-white mb-1 font-mono text-glow">
                {value}
            </span>
            {subtext && (
                <span className="text-neutral-400 text-xs mt-1">{subtext}</span>
            )}
        </motion.div>
    );
}
