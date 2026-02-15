import { useState, useEffect, useMemo } from 'react';
import { useWatchContractEvent, usePublicClient } from 'wagmi';
import { formatEther, parseAbiItem } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Coins, Clock, ChevronRight, User } from 'lucide-react';
import { shortenAddress, formatTimeAgo } from '../lib/format';
import BitDogeABI from '../abi/BitDoge.json';
import { BITDOGE } from '../config/bitdoge';
import { getLogsChunked } from '../lib/getLogsChunked';

const { CONTRACT_ADDRESS, EXPLORER_BASE_URL, GENESIS_BLOCK } = BITDOGE;

export function RecentActivity() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const publicClient = usePublicClient();

    // Fetch historical events on mount
    useEffect(() => {
        async function fetchHistory() {
            try {
                const [mintLogs, sacrificeLogs] = await Promise.all([
                    getLogsChunked(publicClient, {
                        address: CONTRACT_ADDRESS,
                        event: parseAbiItem('event Minted(address indexed user, uint256 userReward, uint256 burnedReward, uint256 blockNumber)'),
                        fromBlock: GENESIS_BLOCK,
                        toBlock: 'latest'
                    }),
                    getLogsChunked(publicClient, {
                        address: CONTRACT_ADDRESS,
                        event: parseAbiItem('event Sacrifice(address indexed user, uint256 amount)'),
                        fromBlock: GENESIS_BLOCK,
                        toBlock: 'latest'
                    })
                ]);

                const formattedMints = mintLogs.map(log => ({
                    type: 'MINT',
                    user: log.args.user,
                    amount: formatEther(log.args.userReward),
                    blockNumber: Number(log.blockNumber),
                    id: `${log.transactionHash}-${log.logIndex}`,
                    timestamp: Date.now(), // Real time would need getBlock, but for UI we can just show order
                }));

                const formattedSacrifices = sacrificeLogs.map(log => ({
                    type: 'SACRIFICE',
                    user: log.args.user,
                    amount: formatEther(log.args.amount),
                    blockNumber: Number(log.blockNumber),
                    id: `${log.transactionHash}-${log.logIndex}`,
                    timestamp: Date.now(),
                }));

                const allEvents = [...formattedMints, ...formattedSacrifices]
                    .sort((a, b) => b.blockNumber - a.blockNumber)
                    .slice(0, 10);

                setEvents(allEvents);
            } catch (err) {
                console.error('Failed to fetch event history:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [publicClient]);

    // Watch for new Mint events
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: BitDogeABI,
        eventName: 'Minted',
        onLogs(logs) {
            const newEvents = logs.map(log => ({
                type: 'MINT',
                user: log.args.user,
                amount: formatEther(log.args.userReward),
                blockNumber: Number(log.blockNumber),
                id: `${log.transactionHash}-${log.logIndex}`,
                timestamp: Date.now(),
            }));
            setEvents(prev => [...newEvents, ...prev].slice(0, 10));
        },
    });

    // Watch for new Sacrifice events
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: BitDogeABI,
        eventName: 'Sacrifice',
        onLogs(logs) {
            const newEvents = logs.map(log => ({
                type: 'SACRIFICE',
                user: log.args.user,
                amount: formatEther(log.args.amount),
                blockNumber: Number(log.blockNumber),
                id: `${log.transactionHash}-${log.logIndex}`,
                timestamp: Date.now(),
            }));
            setEvents(prev => [...newEvents, ...prev].slice(0, 10));
        },
    });

    if (loading) {
        return (
            <div className="bg-glass border border-white/5 rounded-2xl p-6 h-[400px] flex items-center justify-center">
                <div className="text-neutral-500 animate-pulse font-mono">Scanning Blockchain...</div>
            </div>
        );
    }

    return (
        <div className="bg-glass border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-bitdoge-gold" />
                    Recent Activity
                </h3>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Live Feed</span>
            </div>

            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500 text-sm italic">
                            No activity recorded yet.<br />The experiment is still loading.
                        </div>
                    ) : (
                        events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="p-4 hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${event.type === 'MINT' ? 'bg-bitdoge-gold/10 text-bitdoge-gold' : 'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {event.type === 'MINT' ? <Zap size={18} /> : <Coins size={18} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-medium text-white group-hover:text-bitdoge-gold transition-colors">
                                                    {event.type === 'MINT' ? 'New Block Mined' : 'ETH Sacrificed'}
                                                </span>
                                                <span className="text-[10px] text-neutral-500 font-mono bg-neutral-800 px-1.5 py-0.5 rounded">
                                                    #{event.blockNumber}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                                <User size={12} className="opacity-50" />
                                                <a
                                                    href={`${EXPLORER_BASE_URL}/address/${event.user}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline hover:text-white transition-colors font-mono"
                                                >
                                                    {shortenAddress(event.user)}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono font-bold ${event.type === 'MINT' ? 'text-bitdoge-gold' : 'text-blue-400'
                                            }`}>
                                            {event.type === 'MINT' ? `+${event.amount}` : `${event.amount} ETH`}
                                        </div>
                                        <div className="text-[10px] text-neutral-600 mt-1">
                                            {event.type === 'MINT' ? 'BITDOGE' : 'Locked Forever'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <a
                href={`${EXPLORER_BASE_URL}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 text-center text-xs text-neutral-500 hover:text-white hover:bg-white/5 transition-all border-t border-white/5 flex items-center justify-center gap-1.5"
            >
                View on Explorer
                <ChevronRight size={14} />
            </a>
        </div>
    );
}
