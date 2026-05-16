export function formatPKR(amount) {
  if (amount >= 1000000) {
    return `PKR ${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `PKR ${(amount / 1000).toFixed(1)}K`
  }
  return `PKR ${amount.toLocaleString('en-PK')}`
}

export function formatPriceRange(min, max) {
  return `${formatPKR(min)} – ${formatPKR(max)}`
}
