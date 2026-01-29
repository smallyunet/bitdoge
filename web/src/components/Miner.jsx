import { useState } from "react";
import { useSendTransaction, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { Pickaxe, Flame, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

const CONTRACT_ADDRESS = "0x000000001994bb7b8ee7d91012bdecf5ec033a7f";

export function Miner() {
    const { isConnected } = useAccount();
    const [sacrificeAmount, setSacrificeAmount] = useState("");
    const [mode, setMode] = useState("mine"); // 'mine' or 'sacrifice'

    const { data: hash, sendTransaction, isPending, error } = useSendTransaction();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleMine = async () => {
        try {
            sendTransaction({
                to: CONTRACT_ADDRESS,
                value: mode === "sacrifice" ? parseEther(sacrificeAmount || "0") : 0n,
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-glass border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-bitdoge-gold to-transparent opacity-50" />

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setMode("mine")}
                        className={cn(
                            "flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-mono text-sm",
                            mode === "mine"
                                ? "bg-bitdoge-gray text-bitdoge-gold border border-bitdoge-gold/30"
                                : "bg-transparent text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <Pickaxe className="w-4 h-4" />
                        PURE MINE
                    </button>
                    <button
                        onClick={() => setMode("sacrifice")}
                        className={cn(
                            "flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-mono text-sm",
                            mode === "sacrifice"
                                ? "bg-red-900/20 text-red-500 border border-red-500/30"
                                : "bg-transparent text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        <Flame className="w-4 h-4" />
                        SACRIFICE
                    </button>
                </div>

                <div className="min-h-[150px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {mode === "sacrifice" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4"
                            >
                                <label className="text-xs text-neutral-500 mb-2 block uppercase tracking-widest">
                                    Sacrifice Amount (ETH)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={sacrificeAmount}
                                        onChange={(e) => setSacrificeAmount(e.target.value)}
                                        placeholder="0.01"
                                        className="w-full bg-black/50 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                                    />
                                    <span className="absolute right-3 top-3 text-neutral-600 font-mono">ETH</span>
                                </div>
                                <p className="text-[10px] text-red-400 mt-2">
                                    * This ETH will be locked forever in the contract.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isConnected ? (
                        <div className="text-center text-neutral-400 text-sm py-4">
                            Connect Wallet to Initiate Interaction
                        </div>
                    ) : (
                        <button
                            disabled={isPending || isConfirming}
                            onClick={handleMine}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold tracking-wider relative group overflow-hidden transition-all",
                                mode === "sacrifice"
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-bitdoge-gold hover:bg-yellow-500 text-black"
                            )}
                        >
                            {isPending || isConfirming ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {isPending ? "CONFIRMING..." : "MINING..."}
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    {mode === "sacrifice" ? "BURN ETH & MINE" : "BROADCAST (0 ETH)"}
                                </span>
                            )}
                        </button>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs break-all">
                            {error.shortMessage || error.message}
                        </div>
                    )}

                    {isSuccess && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-900/50 rounded-lg text-green-400 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <div>
                                Transaction Successful! <br />
                                <a href={`https://etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer" className="underline opacity-80 hover:opacity-100">
                                    View on Explorer
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
