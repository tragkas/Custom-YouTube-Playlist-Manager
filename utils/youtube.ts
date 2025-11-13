import { Playlist, Video } from '../types';

export const extractPlaylistId = (url: string): string | null => {
  // Regex to find playlist ID from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|list=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2]) {
    return match[2];
  }
  return null;
};

// Use a public proxy to convert RSS to JSON to avoid CORS issues
const RSS_PROXY_URL = 'https://api.rss2json.com/v1/api.json?rss_url=';

export const importYouTubePlaylist = async (playlistUrl: string): Promise<Playlist> => {
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
        throw new Error('Invalid YouTube playlist URL. Please check the URL and try again.');
    }
    
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
    const response = await fetch(`${RSS_PROXY_URL}${encodeURIComponent(feedUrl)}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch playlist data. It might be private or deleted.');
    }
    
    const data = await response.json();

    if (data.status !== 'ok') {
        throw new Error(data.message || 'Could not parse playlist data. The playlist might be private or invalid.');
    }

    if (!data.items || data.items.length === 0) {
        throw new Error('This playlist is empty or could not be accessed.');
    }

    const playlistName = data.feed.title || 'Imported YouTube Playlist';

    const videos: Video[] = data.items.map((item: any) => ({
        id: `vid-${new Date().getTime()}-${Math.random()}`,
        name: item.title,
        url: item.link,
        watched: false,
    }));

    const newPlaylist: Playlist = {
        id: `pl-${new Date().getTime()}`,
        name: playlistName,
        videos,
    };

    return newPlaylist;
};
