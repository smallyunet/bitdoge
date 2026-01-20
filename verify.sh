CONTRACT_ADDRESS=0x000000001994bb7b8ee7d91012bdecf5ec033a7f

forge verify-contract "$CONTRACT_ADDRESS" src/BitDoge.sol:BitDoge \
    --etherscan-api-key "$ETHERSCAN_API_KEY" \
    --watch