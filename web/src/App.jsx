import { useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useReadContracts, useBlockNumber } from 'wagmi';
import { formatEther } from 'viem';
import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, Cuboid } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { Miner } from './components/Miner';
import { RecentActivity } from './components/RecentActivity';
import { TopMiners } from './components/TopMiners';
import BitDogeABI from './abi/BitDoge.json';

import { BITDOGE } from './config/bitdoge';
import { formatIntegerWithCommas, formatApproxDurationSeconds, trimDecimalString } from './lib/format';
import { addErc20ToWallet } from './lib/wallet';

const {
  CONTRACT_ADDRESS,
  BURN_ADDRESS,
  GENESIS_BLOCK,
  HALVING_BLOCKS,
  SYMBOL,
  DECIMALS,
  EXPLORER_BASE_URL,
  ESTIMATED_BLOCK_TIME_SECONDS,
} = BITDOGE;

function App() {
  const reduceMotion = useReducedMotion();
  const { data: blockNumberVal } = useBlockNumber({ watch: true });
  const currentBlock = blockNumberVal || 0n;

  const {
    data: contractData,
    isError: isContractsError,
    error: contractsError,
  } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS,
        abi: BitDogeABI,
        functionName: 'totalSupply',
      },
      {
        address: CONTRACT_ADDRESS,
        abi: BitDogeABI,
        functionName: 'balanceOf',
        args: [BURN_ADDRESS],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: BitDogeABI,
        functionName: 'totalSacrificed',
      }
    ],
    query: {
      refetchInterval: 5000,
    }
  });

  const totalSupplyRaw = contractData?.[0]?.result;
  const burnedRaw = contractData?.[1]?.result;
  const totalSacrificedRaw = contractData?.[2]?.result;

  const totalSupply = useMemo(() => {
    if (totalSupplyRaw === undefined) return null;
    const eth = formatEther(totalSupplyRaw);
    const integer = eth.split('.')[0];
    return formatIntegerWithCommas(integer);
  }, [totalSupplyRaw]);

  const burned = useMemo(() => {
    if (burnedRaw === undefined) return null;
    const eth = formatEther(burnedRaw);
    const integer = eth.split('.')[0];
    return formatIntegerWithCommas(integer);
  }, [burnedRaw]);

  const totalSacrificed = useMemo(() => {
    if (!totalSacrificedRaw) return '0';
    return trimDecimalString(formatEther(totalSacrificedRaw), 6);
  }, [totalSacrificedRaw]);

  // Calculations
  const isStarted = currentBlock >= GENESIS_BLOCK;
  const blocksPassed = isStarted ? currentBlock - GENESIS_BLOCK : 0n;
  const era = blocksPassed / HALVING_BLOCKS;
  const blocksUntilHalving = HALVING_BLOCKS - (blocksPassed % HALVING_BLOCKS);
  const currentRewardFormatted = useMemo(() => {
    if (!isStarted) return '0';
    if (era >= 64n) return '0';
    const wei = (10n ** 18n) >> era;
    return trimDecimalString(formatEther(wei), 8);
  }, [era, isStarted]);

  const blocksUntilGenesis = !isStarted ? (GENESIS_BLOCK - currentBlock) : 0n;
  const genesisEta = !isStarted
    ? formatApproxDurationSeconds(Number(blocksUntilGenesis) * ESTIMATED_BLOCK_TIME_SECONDS)
    : '';

  const addToWallet = async () => {
    await addErc20ToWallet({
      address: CONTRACT_ADDRESS,
      symbol: SYMBOL,
      decimals: DECIMALS,
    });
  };

  return (
    <div className="min-h-screen bg-bitdoge-dark text-bitdoge-text selection:bg-bitdoge-gold selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-bitdoge-gold flex items-center justify-center">
              <span className="font-bold text-black font-mono">Ð</span>
            </div>
            <span className="font-bold tracking-tight text-white hidden sm:block">BitDoge</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={addToWallet}
              className="hidden md:flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
              title="Add to MetaMask"
            >
              <Wallet className="w-4 h-4" />
              Add Token
            </button>
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-bitdoge-gold/10 rounded-full blur-[100px] -z-10" />

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? false : { opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            The 140-Year <br />
            <span className="text-bitdoge-gold text-glow">Simulation</span>
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? false : { opacity: 1 }}
            transition={reduceMotion ? undefined : { delay: 0.2 }}
            className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10"
          >
            BitDoge mimics Bitcoin's supply curve on Ethereum.
            <br className="hidden sm:block" />
            Fair launch. No owner. Just pure math and entropy.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          <StatsCard
            label="Total Supply"
            value={totalSupply}
            subtext="Max 21,000,000"
            delay={0.1}
          />
          <StatsCard
            label="Block Height"
            value={blockNumberVal ? `#${formatIntegerWithCommas(currentBlock.toString())}` : null}
            subtext={
              isStarted
                ? 'Live'
                : `Genesis: ${GENESIS_BLOCK.toString()} (${blocksUntilGenesis.toString()} blocks ${genesisEta ? `/${genesisEta}` : ''})`
            }
            delay={0.2}
          />
          <StatsCard
            label="Halving In"
            value={blocksUntilHalving.toString()}
            subtext={`Era ${era + 1n} / 64`}
            delay={0.3}
          />
          <StatsCard
            label="Burned"
            value={burned}
            subtext={`${totalSacrificed} ETH Sacrificed`}
            delay={0.4}
            className="border-red-900/30"
          />
        </div>

        {isContractsError && (
          <div className="mb-10 p-4 rounded-xl border border-red-900/40 bg-red-900/10 text-red-300 text-xs">
            RPC read failed. This is usually a CORS / rate limit issue on public RPCs.
            <div className="opacity-80 mt-1 break-all">{contractsError?.message || String(contractsError)}</div>
          </div>
        )}

        {/* Interaction Area */}
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Cuboid className="text-bitdoge-gold" />
                The Rules
              </h3>
              <ul className="space-y-4 text-neutral-400">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-bitdoge-gold mt-2 shrink-0" />
                  <p><strong>First Come, First Served.</strong> Only one person can mine per block.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <p><strong>Entropy Rule.</strong> If a block is missed, rewards are BURNED forever.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <p><strong>Fair Launch.</strong> No pre-mine. No keys. Immutable.</p>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-neutral-900/50 rounded-xl border border-white/5">
              <h4 className="text-sm font-mono text-neutral-500 uppercase mb-2">Current Status</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">Current Reward</span>
                <span className="text-bitdoge-gold font-mono">{currentRewardFormatted} BITDOGE</span>
              </div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-bitdoge-gold h-full"
                  style={{ width: `${Number((blocksPassed % HALVING_BLOCKS) * 100n / HALVING_BLOCKS)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-600 mt-2 font-mono">
                <span>Start of Era</span>
                <span>Next Halving</span>
              </div>
            </div>
          </div>

          <div>
            <Miner
              currentBlock={currentBlock}
              genesisBlock={GENESIS_BLOCK}
              isStarted={isStarted}
              explorerBaseUrl={EXPLORER_BASE_URL}
              onAddToken={addToWallet}
            />
          </div>
        </div>

        {/* Real-time Data Section */}
        <div className="mt-24 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div className="lg:col-span-1">
            <TopMiners />
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 bg-black py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-neutral-500 text-sm">
            <p>Vires in Numeris.</p>
          </div>
          <div className="flex gap-6 text-sm text-neutral-400">
            <a href="https://github.com/smallyunet/bitdoge" target="_blank" className="hover:text-white transition-colors">GitHub</a>
            <a href={`${EXPLORER_BASE_URL}/address/${CONTRACT_ADDRESS}`} target="_blank" className="hover:text-white transition-colors">Contract</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
