# BitDoge (BITDOGE)

**An Immutable Bitcoin Supply-Curve Token on Ethereum.**

> "What if we could simulate Bitcoin's history, from genesis to the final block, entirely on a smart contract?"

**BitDoge** is an immutable, hyper-deflationary token that rigorously mimics Bitcoin's supply curve and halving mechanics. It is a pure, decentralized token with no owner, no pre-mine, and no special privileges.

Designed for the ultra-long term, BitDoge will take approximately **140 years** to mint fully, concluding around the year 2166.

**Quick links**
- Contract (Mainnet): `0x000000001994bb7b8ee7d91012bdecf5ec033a7f`
- Source / verification: https://etherscan.io/address/0x000000001994bb7b8ee7d91012bdecf5ec033a7f
- Frontend: `web/`

---

## ⚡️ Key Mechanics

### 1. The Halving (Bitcoin DNA)
Just like Bitcoin, BitDoge has a hard-coded halving schedule.
-   **Initial Reward:** 1.0 BITDOGE per block.
-   **Halving Interval:** Every 10,512,000 blocks (~4 Years).
-   **Halving Events:** 64 total halvings before the reward effectively hits zero.

### 2. The Entropy Rule (The Black Hole)
This is where BitDoge introduces adversarial, first-come-first-served mining dynamics.
-   **Mining is Competitive:** Only **one** person can mine a block (first come, first served).
-   **Missed Blocks are BURNED:** Any blocks skipped between two successful mines are minted directly to the **Burn Address** (`0x...dead`). (Example: if 10 blocks pass between mines, those 10 rewards are burned.)
-   **Consequence:** The "Real Max Supply" will likely be significantly lower than 21M, depending on how often the network "sleeps."

### 3. Fair Launch & Security
-   **No Pre-Mine:** The deployer gets nothing.
-   **No Ownership:** The contract is immutable. No one can pause, blacklist, or mint extra tokens.
-   **EOA Only:** Smart contracts cannot mine. This reduces the ability for automated contracts to monopolize blocks via atomic interactions.

---

## 🚀 Deployment Details

| Item | Value |
| :--- | :--- |
| **Contract Address** | `0x000000001994bb7b8ee7d91012bdecf5ec033a7f` |
| **Salt (Hex)** | `0x00000000000000000000000000000000000000000000000000000000ee61351e` |
| **Transaction Hash** | [0x408fae633674950a2d887d717d1a602326f189c72fcd64e8a3e52f089659b586](https://etherscan.io/tx/0x408fae633674950a2d887d717d1a602326f189c72fcd64e8a3e52f089659b586) |
| **Deployment Block** | [24276673](https://etherscan.io/block/24276673) |
| **Verified Source** | [Etherscan Link](https://etherscan.io/address/0x000000001994bb7b8ee7d91012bdecf5ec033a7f) |

---

## 📊 Tokenomics

| Metric | Value |
| :--- | :--- |
| **Token Symbol** | BITDOGE |
| **Max Supply** | 21,000,000 |
| **Decimals** | 18 |
| **Genesis Block** | #24,444,444 |
| **Block Time** | ~12 Seconds (Ethereum) |
| **Halving Period** | ~4 Years (10,512,000 Blocks) |
| **Estimated End Date** | Year 2166 |
| **Smart Contract** | `0x000000001994bb7b8ee7d91012bdecf5ec033a7f` |

### Supply Curve

-   **Era 1 (Years 0-4):** 1.0 BITDOGE / block
-   **Era 2 (Years 4-8):** 0.5 BITDOGE / block
-   **Era 3 (Years 8-12):** 0.25 BITDOGE / block
-   ...and so on for 140 years.

---

## ⛏️ How to Mine

Mining is a simple interaction with the contract's `receive()` function (a plain ETH transfer with empty calldata). You pay gas to execute the transaction, and the protocol rewards you with the block subsidy.

**Rules to keep in mind**
- Mining is locked until `GENESIS_BLOCK`.
- Only one mine per block: if someone already mined the current block, your tx will revert.
- EOAs only: calls from contracts will revert.

```bash
# Direct Mining (send 0 ETH, empty calldata)
cast send 0x000000001994bb7b8ee7d91012bdecf5ec033a7f \
	--rpc-url https://ethereum-rpc.publicnode.com \
	--private-key <PRIVATE_KEY>

# Optional: Sacrifice some ETH (still empty calldata)
cast send 0x000000001994bb7b8ee7d91012bdecf5ec033a7f \
	--value 0.01ether \
	--rpc-url https://ethereum-rpc.publicnode.com \
	--private-key <PRIVATE_KEY>
```

**Sacrifice (Optional):**
You can optionally send ETH with your transaction ("Sacrifice"). This ETH is **locked forever** in the contract, serving as a "Proof of Burn" floor value for the ecosystem.

**"Vires in Numeris."**
