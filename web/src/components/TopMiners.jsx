import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatEther, parseAbiItem } from 'viem';
import { Trophy, ArrowUpRight, Loader2 } from 'lucide-react';
import { shortenAddress } from '../lib/format';
import { BITDOGE } from '../config/bitdoge';
import { getLogsChunked } from '../lib/getLogsChunked';

const { CONTRACT_ADDRESS, EXPLORER_BASE_URL, GENESIS_BLOCK } = BITDOGE;

export function TopMiners() {
    const [miners, setMiners] = useState([]);
    const [loading, setLoading] = useState(true);
    const publicClient = usePublicClient();

    useEffect(() => {
        async function fetchMiners() {
            try {
                const logs = await getLogsChunked(publicClient, {
                    address: CONTRACT_ADDRESS,
                    event: parseAbiItem('event Minted(address indexed user, uint256 userReward, uint256 burnedReward, uint256 blockNumber)'),
                    fromBlock: GENESIS_BLOCK,
                    toBlock: 'latest'
                });

                const minerMap = logs.reduce((acc, log) => {
                    const user = log.args.user;
                    const reward = log.args.userReward;
                    acc[user] = (acc[user] || 0n) + reward;
                    return acc;
                }, {});

                const sortedMiners = Object.entries(minerMap)
                    .map(([address, total]) => ({
                        address,
                        total: formatEther(total),
                        rawTotal: total
                    }))
                    .sort((a, b) => (b.rawTotal > a.rawTotal ? 1 : -1))
                    .slice(0, 5);

                setMiners(sortedMiners);
            } catch (err) {
                console.error('Failed to fetch miner leaderboard:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchMiners();

        // Refresh periodically
        const interval = setInterval(fetchMiners, 30000);
        return () => clearInterval(interval);
    }, [publicClient]);

    if (loading) {
        return (
            <div className="bg-glass border border-white/5 rounded-2xl p-6 h-[400px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-bitdoge-gold animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-glass border border-white/5 rounded-2xl overflow-hidden h-full">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-bitdoge-gold" />
                    Hall of Fame
                </h3>
                <p className="text-xs text-neutral-500 mt-1">Top miners by total rewards</p>
            </div>

            <div className="p-6 space-y-6">
                {miners.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-neutral-500 text-sm italic">The leaderboard is empty.</p>
                        <p className="text-[10px] text-neutral-600 mt-2">Be the first to mine!</p>
                    </div>
                ) : (
                    miners.map((miner, index) => (
                        <div key={miner.address} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-bitdoge-gold text-black' :
                                        index === 1 ? 'bg-neutral-300 text-black' :
                                            index === 2 ? 'bg-amber-600 text-white' :
                                                'bg-neutral-800 text-neutral-400'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <a
                                        href={`${EXPLORER_BASE_URL}/address/${miner.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-white hover:text-bitdoge-gold transition-colors flex items-center gap-1"
                                    >
                                        {shortenAddress(miner.address)}
                                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <div className="text-[10px] text-neutral-500 font-mono">
                                        Global Rank {index + 1}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-white font-mono">
                                    {Number(miner.total).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-[10px] text-bitdoge-gold uppercase tracking-tighter">BITDOGE</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {miners.length > 0 && (
                <div className="px-6 pb-6 mt-4">
                    <div className="p-3 bg-bitdoge-gold/5 border border-bitdoge-gold/10 rounded-xl text-center">
                        <span className="text-[10px] text-bitdoge-gold uppercase font-bold tracking-widest">
                            Join the competition
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
