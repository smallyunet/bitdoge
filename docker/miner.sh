#!/bin/sh

set -u

ADDRESS="0x000000001994bb7b8ee7d91012bdecf5ec033a7f"
RPC_URL="https://ethereum-rpc.publicnode.com"

if [ -z "${PRIVATE_KEY:-}" ]; then
  echo "[miner] ERROR: PRIVATE_KEY env var is required" >&2
  exit 1
fi

echo "[miner] starting hourly cast send loop"
echo "[miner] address=${ADDRESS} rpc=${RPC_URL}"

while true; do
  ts="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "[miner] ${ts} running cast send..."

  # Keep the container alive even if a single send fails.
  cast send "$ADDRESS" \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    || echo "[miner] ${ts} cast send failed (will retry next hour)" >&2

  echo "[miner] sleeping 3600s"
  sleep 3600
done
