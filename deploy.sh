#!/bin/bash

# Load environment variables
source .env

# 4. Deploy using Forge Script
echo "----------------------------------------------------"
echo "Submitting Transaction via Script..."
forge script script/Deploy.s.sol:DeployBitDoge \
  --rpc-url $RPC_URL \
  --broadcast \
  --legacy \
  -vvvv
