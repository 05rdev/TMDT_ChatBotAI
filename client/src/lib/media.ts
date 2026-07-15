export const getMediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  return `${serverBaseUrl}/${url.replace(/^\/+/, '')}`;
};
