import React, { useState, useEffect, useRef } from 'react';
import { Playlist as PlaylistType } from './types';
import Playlist from './components/Playlist';
import VideoPlayer from './components/VideoPlayer';
import { PlusIcon } from './components/Icons';
import { loadPlaylistsFromLocalStorage, savePlaylistsToLocalStorage } from './utils/storage';

const App: React.FC = () => {
  const [playlists, setPlaylists] = useState<PlaylistType[]>(loadPlaylistsFromLocalStorage);

  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  // Drag-and-drop state for playlists
  const draggedPlaylistIndex = useRef<number | null>(null);
  const dragOverPlaylistIndex = useRef<number | null>(null);
  const [draggingPlaylist, setDraggingPlaylist] = useState<number | null>(null);
  const [dragOverPlaylist, setDragOverPlaylist] = useState<number | null>(null);

  useEffect(() => {
    savePlaylistsToLocalStorage(playlists);
  }, [playlists]);

  const addPlaylist = () => {
    const newPlaylist: PlaylistType = {
      id: `pl-${Date.now()}`,
      name: `New Playlist ${playlists.length + 1}`,
      videos: [],
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };


  const updatePlaylist = (updatedPlaylist: PlaylistType) => {
    setPlaylists(playlists.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p));
  };

  // Playlist D&D handlers
  const handlePlaylistDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    draggedPlaylistIndex.current = index;
    setDraggingPlaylist(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePlaylistDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (draggedPlaylistIndex.current !== index) {
      dragOverPlaylistIndex.current = index;
      setDragOverPlaylist(index);
    }
  };
  
  const handlePlaylistDragLeave = () => {
     setDragOverPlaylist(null);
  };

  const handlePlaylistDragEnd = () => {
    if (draggedPlaylistIndex.current !== null && dragOverPlaylistIndex.current !== null) {
      const newPlaylists = [...playlists];
      const [draggedItem] = newPlaylists.splice(draggedPlaylistIndex.current, 1);
      newPlaylists.splice(dragOverPlaylistIndex.current, 0, draggedItem);
      setPlaylists(newPlaylists);
    }
    draggedPlaylistIndex.current = null;
    dragOverPlaylistIndex.current = null;
    setDraggingPlaylist(null);
    setDragOverPlaylist(null);
  };

  return (
    <div className="min-h-screen bg-slate-700 text-white font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mt-10">
            Custom YouTube Playlists <br/ > for Your Interests.
          </h1>
          <p className="mt-5 text-lg text-white">
            Turn YouTube into your personal productivity playlist.
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <button
            onClick={addPlaylist}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
          >
            <PlusIcon />
            Create New Playlist
          </button>
        </div>

        {playlists.length > 0 ? (
            <div className="space-y-6 max-w-4xl mx-auto" onDragLeave={handlePlaylistDragLeave}>
                {playlists.map((playlist, index) => (
                    <Playlist
                    key={playlist.id}
                    playlist={playlist}
                    onDelete={() => deletePlaylist(playlist.id)}
                    onUpdate={updatePlaylist}
                    onPlayVideo={setPlayingVideoUrl}
                    index={index}
                    onDragStart={handlePlaylistDragStart}
                    onDragEnter={handlePlaylistDragEnter}
                    onDragEnd={handlePlaylistDragEnd}
                    isDragging={draggingPlaylist === index}
                    hasDragOver={dragOverPlaylist === index}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 max-w-4xl mx-auto">
                <h3 className="text-2xl font-semibold text-gray-300">Your space is empty!</h3>
                <p className="mt-2 text-gray-500">Click "Create New Playlist" to get started and build your collection.</p>
            </div>
        )}
      </div>

      {playingVideoUrl && <VideoPlayer videoUrl={playingVideoUrl} onClose={() => setPlayingVideoUrl(null)} />}
    </div>
  );
};

export default App;