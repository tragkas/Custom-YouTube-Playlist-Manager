
import React, { useState, useEffect, useRef } from 'react';
import { Playlist as PlaylistType } from './types';
import Playlist from './components/Playlist';
import VideoPlayer from './components/VideoPlayer';
import { PlusIcon, ImportIcon } from './components/Icons';
import { loadPlaylistsFromLocalStorage, savePlaylistsToLocalStorage } from './utils/storage';
import ConfirmationModal from './components/ConfirmationModal';
import ImportPlaylistModal from './components/ImportPlaylistModal';

const App: React.FC = () => {
  const [playlists, setPlaylists] = useState<PlaylistType[]>(loadPlaylistsFromLocalStorage);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<PlaylistType | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
      name: `New Learning Path ${playlists.length + 1}`,
      videos: [],
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const handleImportPlaylist = (newPlaylist: PlaylistType) => {
    setPlaylists(prevPlaylists => [...prevPlaylists, newPlaylist]);
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };
  
  const confirmDeletePlaylist = () => {
    if (playlistToDelete) {
      deletePlaylist(playlistToDelete.id);
      setPlaylistToDelete(null);
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <header className="max-w-4xl mx-auto mb-20 text-center">
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-8">
            Learning Operating System
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]">
            Turn YouTube into your <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 animate-gradient-x">personal classroom.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop losing your focus to the algorithm. Playliner helps you curate expert knowledge, track your progress, and master any skill without the distractions.
          </p>
        </header>

        <div className="flex justify-center items-center flex-wrap gap-6 mb-16">
          <button
            onClick={addPlaylist}
            className="flex items-center gap-3 bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 hover:-translate-y-1 transition-all duration-300"
          >
            <PlusIcon />
            Create Learning Path
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-3 bg-slate-900 text-slate-200 font-bold px-8 py-4 rounded-2xl border border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:-translate-y-1 transition-all duration-300"
          >
            <ImportIcon />
            Sync YouTube Playlist
          </button>
        </div>

        {/* Feature Micro-Trust Section */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20 text-center sm:text-left">
           <div>
             <div className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">Focused</div>
             <p className="text-slate-500 text-sm">Watch content in a distraction-free player designed for deep work.</p>
           </div>
           <div>
             <div className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">Trackable</div>
             <p className="text-slate-500 text-sm">Visualize your progress with automatic completion percentages.</p>
           </div>
           <div>
             <div className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">Organized</div>
             <p className="text-slate-500 text-sm">Reorder videos to build the perfect logical sequence for learning.</p>
           </div>
        </div>

        {playlists.length > 0 ? (
            <div className="space-y-8 max-w-4xl mx-auto" onDragLeave={handlePlaylistDragLeave}>
                {playlists.map((playlist, index) => (
                    <Playlist
                    key={playlist.id}
                    playlist={playlist}
                    onDelete={() => setPlaylistToDelete(playlist)}
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
            <div className="text-center py-32 px-6 bg-slate-900/30 rounded-[2rem] border border-slate-900 border-dashed max-w-4xl mx-auto">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-800">
                  <PlusIcon className="h-10 w-10 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-100">Your journey starts here.</h3>
                <p className="mt-4 text-slate-500 max-w-md mx-auto leading-relaxed">
                  The best time to start learning was yesterday. Create your first path or import a playlist to begin tracking your growth.
                </p>
            </div>
        )}

        <footer className="max-w-4xl mx-auto mt-32 pb-12 text-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-12"></div>
          <p className="text-slate-600 text-xs font-medium tracking-widest uppercase">
            Designed for the curious. &copy; {new Date().getFullYear()} Playliner
          </p>
        </footer>
      </div>

      {playingVideoUrl && <VideoPlayer videoUrl={playingVideoUrl} onClose={() => setPlayingVideoUrl(null)} />}
      <ConfirmationModal
        isOpen={!!playlistToDelete}
        onClose={() => setPlaylistToDelete(null)}
        onConfirm={confirmDeletePlaylist}
        title="Delete Playlist"
        message={`This will permanently remove "${playlistToDelete?.name}" and all ${playlistToDelete?.videos.length} videos inside it.`}
       />
       <ImportPlaylistModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportPlaylist}
       />
    </div>
  );
};

export default App;
