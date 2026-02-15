/**
 * Fetches logs in smaller block ranges to satisfy RPC providers that enforce
 * maximum `eth_getLogs` block span limits (e.g. 50,000 blocks).
 */

const DEFAULT_MAX_BLOCK_SPAN = 45_000n;

/**
 * @param {import('viem').PublicClient} publicClient
 * @param {object} params - Same shape as `publicClient.getLogs` params.
 * @param {bigint | 'earliest' | undefined} [params.fromBlock]
 * @param {bigint | 'latest' | undefined} [params.toBlock]
 * @param {bigint} [options.maxBlockSpan]
 */
export async function getLogsChunked(publicClient, params, options = {}) {
  const { fromBlock, toBlock, ...rest } = params;

  const latestBlock =
    toBlock === undefined || toBlock === 'latest'
      ? await publicClient.getBlockNumber()
      : BigInt(toBlock);

  const startBlock =
    fromBlock === undefined || fromBlock === 'earliest'
      ? 0n
      : BigInt(fromBlock);

  if (startBlock > latestBlock) return [];

  const maxBlockSpan = options.maxBlockSpan ?? DEFAULT_MAX_BLOCK_SPAN;
  if (maxBlockSpan <= 0n) throw new Error('maxBlockSpan must be > 0');

  const logs = [];
  let currentFrom = startBlock;

  while (currentFrom <= latestBlock) {
    const currentTo = (() => {
      const candidate = currentFrom + maxBlockSpan - 1n;
      return candidate > latestBlock ? latestBlock : candidate;
    })();

    // viem expects bigint block numbers here.
    // eslint-disable-next-line no-await-in-loop
    const chunk = await publicClient.getLogs({
      ...rest,
      fromBlock: currentFrom,
      toBlock: currentTo,
    });

    logs.push(...chunk);
    currentFrom = currentTo + 1n;
  }

  return logs;
}
