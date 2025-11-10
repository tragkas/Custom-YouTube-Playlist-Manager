import { Playlist } from '../types';

const LOCAL_STORAGE_KEY = 'ytPlaylists';

export const loadPlaylistsFromLocalStorage = (): Playlist[] => {
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (error) {
    console.error("Could not parse playlists from localStorage", error);
  }
  return [];
};

export const savePlaylistsToLocalStorage = (playlists: Playlist[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(playlists));
  } catch (error) {
    console.error("Could not save playlists to localStorage", error);
  }
};
