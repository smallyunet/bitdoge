# Load env and calculate cost
source .env && cast estimate --rpc-url $RPC_URL \
  --from 0xd0f53E697Ac2E481826e40B914ac079bF43855Aa \
  --cost \
  --create $(forge inspect BitDoge bytecode)