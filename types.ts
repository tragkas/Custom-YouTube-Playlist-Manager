
export interface Video {
  id: string;
  name: string;
  url: string;
  watched: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  videos: Video[];
}
