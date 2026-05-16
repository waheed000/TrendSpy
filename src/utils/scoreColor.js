export function getScoreColor(score) {
  if (score >= 75) return 'green'
  if (score >= 50) return 'yellow'
  return 'red'
}

export function getScoreClasses(score) {
  if (score >= 75) return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  return 'bg-red-500/20 text-red-400 border-red-500/30'
}

export function getScoreBg(score) {
  if (score >= 75) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function getScoreLabel(score) {
  if (score >= 90) return 'Hot'
  if (score >= 75) return 'Strong'
  if (score >= 50) return 'Moderate'
  return 'Weak'
}
