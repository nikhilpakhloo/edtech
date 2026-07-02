import { APP_STRINGS } from '@/constants/string';

export function formatRuntime(minutes?: number, seasonCount?: number) {
  if (seasonCount) {
    return APP_STRINGS.format.season(seasonCount);
  }

  if (!minutes) {
    return APP_STRINGS.common.live;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) {
    return APP_STRINGS.format.minutes(remainingMinutes);
  }

  return APP_STRINGS.format.hoursMinutes(hours, remainingMinutes);
}
