# BitDoge (BITDOGE)

**A Unique, Gamified Bitcoin Tribute on Ethereum.**

> "What if we could simulate Bitcoin's history, from genesis to the final block, entirely on a smart contract?"

**BitDoge** is a fun, hyper-deflationary token that rigorously mimics Bitcoin's supply curve and halving mechanics. It is a pure, decentralized token with no owner, no pre-mine, and no special privileges.

Designed for the ultra-long term, BitDoge will take approximately **140 years** to mint fully, concluding around the year 2166.

---

## ⚡️ Key Mechanics

### 1. The Halving (Bitcoin DNA)
Just like Bitcoin, BitDoge has a hard-coded halving schedule.
-   **Initial Reward:** 1.0 BITDOGE per block.
-   **Halving Interval:** Every 10,512,000 blocks (~4 Years).
-   **Halving Events:** 64 total halvings before the reward effectively hits zero.

### 2. The Entropy Rule (The Black Hole)
This is where BitDoge diverges into "PVP" territory.
-   **Mining is Competitive:** Only **one** person can mine a block (first come, first served).
-   **Missed Blocks are BURNED:** If no one mines a block (e.g., no transaction for 10 blocks), the rewards for those 10 missed blocks are minted directly to the **Burn Address** (`0x...dead`).
-   **Consequence:** The "Real Max Supply" will likely be significantly lower than 21M, depending on how often the network "sleeps."

### 3. Fair Launch & Security
-   **No Pre-Mine:** The deployer gets nothing.
-   **No Ownership:** The contract is immutable. No one can pause, blacklist, or mint extra tokens.
-   **EOA Only:** "Humans Only." Smart contracts cannot mine. This prevents MEV bots from easily monopolizing the blocks via atomic interactions.

---

## � Deployment Details

| Item | Value |
| :--- | :--- |
| **Contract Address** | `0x000000001994bb7b8ee7d91012bdecf5ec033a7f` |
| **Salt (Hex)** | `0x00000000000000000000000000000000000000000000000000000000ee61351e` |
| **Transaction Hash** | [0x408fae633674950a2d887d717d1a602326f189c72fcd64e8a3e52f089659b586](https://etherscan.io/tx/0x408fae633674950a2d887d717d1a602326f189c72fcd64e8a3e52f089659b586) |
| **Deployment Block** | [24276673](https://etherscan.io/block/24276673) |
| **Verified Source** | [Etherscan Link](https://etherscan.io/address/0x000000001994bb7b8ee7d91012bdecf5ec033a7f) |

---

## �📊 Tokenomics

| Metric | Value |
| :--- | :--- |
| **Token Symbol** | BITDOGE |
| **Max Supply** | 21,000,000 |
| **Decimals** | 18 |
| **Genesis Block** | #24,444,444 (Approx. Feb 2026) |
| **Block Time** | ~12 Seconds (Ethereum) |
| **Halving Period** | ~4 Years (10,512,000 Blocks) |
| **Esimated End Date** | Year 2166 |
| **Smart Contract** | `0xBd09e...` (Vanity Address) |

### Supply Curve

-   **Era 1 (Years 0-4):** 1.0 BITDOGE / block
-   **Era 2 (Years 4-8):** 0.5 BITDOGE / block
-   **Era 3 (Years 8-12):** 0.25 BITDOGE / block
-   ...and so on for 140 years.

---

## ⛏️ How to Mine

Mining is a simple interaction with the contract. You pay the gas fee to execute the transaction, and the protocol rewards you with the block subsidy.

```bash
# Direct Mining (Send 0 ETH)
cast send <CONTRACT_ADDRESS> --rpc-url <RPC> --private-key <KEY>
```

**Sacrifice (Optional):**
You can optionally send ETH with your transaction ("Sacrifice"). This ETH is **locked forever** in the contract, serving as a "Proof of Burn" floor value for the ecosystem.

---

## 🛠 Project Structure

This project is built with **Foundry**.

### Directories
-   `src/`: The Solidity smart contracts.
-   `test/`: Comprehensive unit tests simulating 40+ years of mining.
-   `script/`: Helper scripts for deployment and tools.

### Key Tools
-   **CPU Miner**: `script/mine_mp.py` - A Python script to calculate vanity contract addresses.
-   **GPU Guide**: `GPU_VANITY_GUIDE.md` - Instructions for using GPU acceleration.

## ⚠️ Disclaimer

BitDoge is a fun community token and code-as-art.
-   It has **no intrinsic value**.
-   It is **not** an investment.
-   The code is provided "as is."

**"Vires in Numeris."**
