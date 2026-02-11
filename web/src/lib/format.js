export function formatIntegerWithCommas(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const negative = str.startsWith('-');
  const digits = negative ? str.slice(1) : str;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return negative ? `-${grouped}` : grouped;
}

export function formatApproxDurationSeconds(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '';
  const seconds = Math.floor(totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `~${days}d ${hours % 24}h`;
  if (hours > 0) return `~${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `~${minutes}m`;
  return `~${seconds}s`;
}

export function trimDecimalString(value, maxDecimals) {
  const str = String(value);
  if (!str.includes('.')) return str;
  const [i, d] = str.split('.');
  const trimmed = d.slice(0, maxDecimals).replace(/0+$/g, '');
  return trimmed.length ? `${i}.${trimmed}` : i;
}
