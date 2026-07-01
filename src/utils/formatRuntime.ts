export function formatRuntime(minutes?: number, seasonCount?: number) {
  if (seasonCount) {
    return `${seasonCount} season${seasonCount > 1 ? 's' : ''}`;
  }

  if (!minutes) {
    return 'Live';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}
