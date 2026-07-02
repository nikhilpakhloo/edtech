const MAX_REMOTE_IMAGE_WIDTH = 1800;
const UNSPLASH_HOST = 'images.unsplash.com';

export function getResizedImageUri(uri: string, requestedWidth?: number) {
  if (!requestedWidth) {
    return uri;
  }

  try {
    const url = new URL(uri);

    if (url.hostname !== UNSPLASH_HOST) {
      return uri;
    }

    const imageWidth = Math.min(Math.ceil(requestedWidth), MAX_REMOTE_IMAGE_WIDTH);
    url.searchParams.set('w', String(imageWidth));
    url.searchParams.set('q', '80');
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');

    return url.toString();
  } catch {
    return uri;
  }
}
