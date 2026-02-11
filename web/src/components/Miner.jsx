import { useState } from "react";
import {
    useSendTransaction,
    useWaitForTransactionReceipt,
    useAccount,
    useChainId,
} from "wagmi";
import { parseEther } from "viem";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    Pickaxe,
    Flame,
    Loader2,
    CheckCircle2,
    ExternalLink,
    Copy,
    Wallet,
} from "lucide-react";
import { cn } from "../lib/utils";

import { BITDOGE } from "../config/bitdoge";
import { copyToClipboard } from "../lib/wallet";

const { CONTRACT_ADDRESS, GENESIS_BLOCK, EXPLORER_BASE_URL } = BITDOGE;

function friendlyTxError(err) {
    const msg = err?.shortMessage || err?.message || String(err || "");
    const lower = msg.toLowerCase();

    if (lower.includes("access-control-allow-origin") || lower.includes("cors")) {
        return "RPC blocked by CORS. Try setting VITE_RPC_URL to a browser-friendly RPC.";
    }
    if (msg.includes("BitDoge loading") || lower.includes("genesis")) {
        return "Mining hasn't started yet (Genesis not reached).";
    }
    if (msg.includes("Block already mined") || lower.includes("already mined")) {
        return "This block was already mined. Wait for the next block and try again.";
    }
    if (msg.includes("Humans only") || lower.includes("tx.origin")) {
        return "EOA only: contract calls are not allowed.";
    }
    if (lower.includes("user rejected") || lower.includes("rejected")) {
        return "Transaction rejected in wallet.";
    }
    if (lower.includes("insufficient funds")) {
        return "Insufficient funds for gas (or value).";
    }

    return msg;
}

function isValidEthAmountString(value) {
    if (value === "") return true;
    if (!/^(\d+)(\.\d{0,18})?$/.test(value)) return false;
    return true;
}

export function Miner({
    currentBlock,
    genesisBlock,
    isStarted,
    explorerBaseUrl,
    onAddToken,
}) {
    const reduceMotion = useReducedMotion();
    const { isConnected } = useAccount();
    const chainId = useChainId();
    const [sacrificeAmount, setSacrificeAmount] = useState("");
    const [mode, setMode] = useState("mine");
    const [copied, setCopied] = useState(false);

    const { data: hash, sendTransaction, isPending, error } = useSendTransaction();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const isMainnet = chainId === 1;
    const sacrificeIsValid = mode !== "sacrifice" ? true : isValidEthAmountString(sacrificeAmount);
    const canMine = Boolean(isConnected && isMainnet && isStarted);
    const disableAction = !canMine || !sacrificeIsValid || isPending || isConfirming;

    const explorer = explorerBaseUrl || EXPLORER_BASE_URL;
    const effectiveGenesis = genesisBlock ?? GENESIS_BLOCK;
    const blocksLeft = !isStarted && typeof currentBlock === "bigint" ? (effectiveGenesis - currentBlock) : 0n;

    const statusLine = !isConnected
        ? "Connect wallet to interact"
        : !isMainnet
            ? "Switch network to Ethereum Mainnet"
            : !isStarted
                ? `Not started yet. ${blocksLeft > 0n ? `${blocksLeft.toString()} blocks to Genesis` : `Genesis at #${effectiveGenesis.toString()}`}`
                : "Ready";

    const handleMine = async () => {
        if (!canMine) return;
        try {
            sendTransaction({
                to: CONTRACT_ADDRESS,
                value: mode === "sacrifice" ? parseEther(sacrificeAmount || "0") : 0n,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const doCopy = async () => {
        const ok = await copyToClipboard(CONTRACT_ADDRESS);
        setCopied(ok);
        if (ok) setTimeout(() => setCopied(false), 1200);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-glass border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
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

                <div className="flex items-center justify-between mb-4 text-xs text-neutral-500 font-mono">
                    <span>{statusLine}</span>
                    <a
                        href={`${explorer}/address/${CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-neutral-300 transition-colors"
                        title="View contract"
                    >
                        Contract <ExternalLink className="w-3 h-3" />
                    </a>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={doCopy}
                        className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors font-mono inline-flex items-center gap-2"
                        title="Copy contract address"
                    >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? "Copied" : `${CONTRACT_ADDRESS.slice(0, 8)}…${CONTRACT_ADDRESS.slice(-6)}`}
                    </button>

                    <button
                        onClick={onAddToken}
                        className="md:hidden text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors font-mono inline-flex items-center gap-2"
                        title="Add token to wallet"
                    >
                        <Wallet className="w-3.5 h-3.5" />
                        Add Token
                    </button>
                </div>

                <div className="min-h-[150px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {mode === "sacrifice" && (
                            <motion.div
                                initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                                animate={reduceMotion ? false : { opacity: 1, height: "auto" }}
                                exit={reduceMotion ? false : { opacity: 0, height: 0 }}
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
                                {!sacrificeIsValid && (
                                    <p className="text-[10px] text-red-300 mt-1">
                                        Invalid amount (max 18 decimals).
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isConnected ? (
                        <div className="text-center text-neutral-400 text-sm py-4">
                            Connect Wallet to Initiate Interaction
                        </div>
                    ) : (
                        <button
                            disabled={disableAction}
                            onClick={handleMine}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold tracking-wider relative group overflow-hidden transition-all",
                                disableAction && "opacity-60 cursor-not-allowed",
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

                    {hash && (
                        <div className="mt-3 text-xs text-neutral-500 font-mono break-all">
                            Tx:{" "}
                            <a
                                className="underline hover:text-neutral-300"
                                href={`${explorer}/tx/${hash}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {hash}
                            </a>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs break-all">
                            {friendlyTxError(error)}
                        </div>
                    )}

                    {isSuccess && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-900/50 rounded-lg text-green-400 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <div>
                                Transaction Successful! <br />
                                <a
                                    href={`${explorer}/tx/${hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline opacity-80 hover:opacity-100"
                                >
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
