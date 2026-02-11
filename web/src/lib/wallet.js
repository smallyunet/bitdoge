export async function addErc20ToWallet({ address, symbol, decimals, image }) {
  if (!window?.ethereum?.request) return false;
  try {
    return await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          symbol,
          decimals,
          ...(image ? { image } : {}),
        },
      },
    });
  } catch {
    return false;
  }
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
