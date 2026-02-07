
import React, { useState, useRef, useEffect } from 'react';
import { Playlist as PlaylistType, Video } from '../types';
import VideoItem from './VideoItem';
import { TrashIcon, PlusIcon, GripVerticalIcon, ChevronDownIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

interface PlaylistProps {
  playlist: PlaylistType;
  onDelete: () => void;
  onUpdate: (playlist: PlaylistType) => void;
  onPlayVideo: (url: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  index: number;
  isDragging: boolean;
  hasDragOver: boolean;
}

const Playlist: React.FC<PlaylistProps> = ({ 
    playlist, 
    onDelete, 
    onUpdate, 
    onPlayVideo,
    onDragStart,
    onDragEnter,
    onDragEnd,
    index,
    isDragging,
    hasDragOver
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [playlistName, setPlaylistName] = useState(playlist.name);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const addVideoUrlInputRef = useRef<HTMLInputElement>(null);
  
  // D&D state for videos
  const draggedVideoIndex = useRef<number | null>(null);
  const dragOverVideoIndex = useRef<number | null>(null);
  const [draggingVideo, setDraggingVideo] = useState<number | null>(null);
  const [dragOverVideo, setDragOverVideo] = useState<number | null>(null);


  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);
  
  useEffect(() => {
    if (showAddForm) {
      addVideoUrlInputRef.current?.focus();
    }
  }, [showAddForm]);

  const handleNameUpdate = () => {
    if (playlistName.trim()) {
      onUpdate({ ...playlist, name: playlistName.trim() });
      setIsEditingName(false);
    } else {
        setPlaylistName(playlist.name); // revert if empty
        setIsEditingName(false);
    }
  };
  
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim() || isAddingVideo) return;

    setIsAddingVideo(true);
    let videoName = "Untitled Video";

    try {
      const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(newVideoUrl.trim())}`);
      const data = await response.json();

      if (response.ok && data.title) {
        videoName = data.title;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Could not retrieve video title.');
      }
    } catch (error: any) {
      console.error("Error fetching video title:", error);
      alert(`Could not fetch video details: ${error.message}. Please check the URL. A default name will be used.`);
    }

    const newVideo: Video = {
      id: `vid-${Date.now()}-${Math.random()}`,
      name: videoName,
      url: newVideoUrl.trim(),
      watched: false,
    };
    onUpdate({ ...playlist, videos: [...playlist.videos, newVideo] });
    setNewVideoUrl('');
    setShowAddForm(false);
    setIsAddingVideo(false);
  };
  
  const handleUpdateVideo = (videoId: string, name: string, url: string) => {
    const updatedVideos = playlist.videos.map(v => 
        v.id === videoId ? { ...v, name, url } : v
    );
    onUpdate({ ...playlist, videos: updatedVideos });
  };
  
  const handleDeleteVideo = (videoId: string) => {
    const updatedVideos = playlist.videos.filter(v => v.id !== videoId);
    onUpdate({ ...playlist, videos: updatedVideos });
    setVideoToDelete(null);
  };

  const handleToggleWatched = (videoId: string) => {
    const updatedVideos = playlist.videos.map(v =>
      v.id === videoId ? { ...v, watched: !v.watched } : v
    );
    onUpdate({ ...playlist, videos: updatedVideos });
  };
  
  // Video D&D handlers
  const handleVideoDragStart = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    draggedVideoIndex.current = idx;
    setDraggingVideo(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleVideoDragEnter = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    if (draggedVideoIndex.current !== idx) {
        dragOverVideoIndex.current = idx;
        setDragOverVideo(idx);
    }
  };

  const handleVideoDragLeave = () => {
    setDragOverVideo(null);
  }

  const handleVideoDragEnd = () => {
    if (draggedVideoIndex.current !== null && dragOverVideoIndex.current !== null) {
      const newVideos = [...playlist.videos];
      const [draggedItem] = newVideos.splice(draggedVideoIndex.current, 1);
      newVideos.splice(dragOverVideoIndex.current, 0, draggedItem);
      onUpdate({ ...playlist, videos: newVideos });
    }
    draggedVideoIndex.current = null;
    dragOverVideoIndex.current = null;
    setDraggingVideo(null);
    setDragOverVideo(null);
  };


  const watchedCount = playlist.videos.filter(v => v.watched).length;
  const totalCount = playlist.videos.length;
  const progress = totalCount > 0 ? (watchedCount / totalCount) * 100 : 0;

  return (
    <>
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl transition-all duration-300 relative
        ${isDragging ? 'opacity-20 scale-[0.98] blur-[1px]' : 'opacity-100 scale-100'} 
        ${hasDragOver ? 'ring-2 ring-indigo-500 bg-slate-800/50' : 'ring-0 shadow-indigo-950/20'}`}
    >
      {/* Playlist Drag Indicator Overlay */}
      {hasDragOver && (
        <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none rounded-2xl border-2 border-indigo-500/50 border-dashed z-0"></div>
      )}

      <div className="flex items-center gap-3 relative z-10">
        <div className="cursor-grab text-slate-600 touch-none active:cursor-grabbing hover:text-slate-300 transition-colors">
            <GripVerticalIcon className="h-6 w-6"/>
        </div>
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            onBlur={handleNameUpdate}
            onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
            className="text-xl font-semibold bg-slate-800 text-white px-3 py-1 rounded-lg flex-grow outline-none border border-indigo-500/50 shadow-[0_0_10px_rgba(79,70,229,0.1)]"
          />
        ) : (
          <h2 onDoubleClick={() => setIsEditingName(true)} className="text-xl font-semibold text-slate-100 flex-grow cursor-pointer select-none truncate hover:text-indigo-400 transition-colors">{playlist.name}</h2>
        )}
        <div className="flex items-center gap-3 px-3 py-1 bg-slate-950/50 rounded-lg border border-slate-800/50 flex-shrink-0">
            <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">{watchedCount}/{totalCount}</span>
            <span className="text-sm font-bold text-indigo-400">{Math.round(progress)}%</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" 
          aria-label={isOpen ? "Collapse playlist" : "Expand playlist"}
        >
          <ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>
        <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors" title="Delete Playlist">
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pt-5' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden space-y-6">
            {totalCount > 0 &&
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(79,70,229,0.6)]" style={{ width: `${progress}%` }}></div>
                </div>
            }

            <ul className="space-y-3" onDragLeave={handleVideoDragLeave}>
                {playlist.videos.map((video, idx) => (
                <VideoItem
                    key={video.id}
                    video={video}
                    index={idx}
                    onDelete={() => setVideoToDelete(video)}
                    onToggleWatched={() => handleToggleWatched(video.id)}
                    onUpdate={(name, url) => handleUpdateVideo(video.id, name, url)}
                    onPlay={() => onPlayVideo(video.url)}
                    onDragStart={handleVideoDragStart}
                    onDragEnter={handleVideoDragEnter}
                    onDragEnd={handleVideoDragEnd}
                    isDragging={draggingVideo === idx}
                    isDragOver={dragOverVideo === idx}
                />
                ))}
            </ul>
            
            {showAddForm ? (
                <form onSubmit={handleAddVideo} className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/50 space-y-4">
                    <input
                        ref={addVideoUrlInputRef}
                        type="url"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="YouTube Video URL..."
                        className="w-full bg-slate-900 text-white p-3 rounded-lg outline-none border border-slate-800 focus:border-indigo-500/50 transition-all text-sm"
                        required
                        disabled={isAddingVideo}
                    />
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors" disabled={isAddingVideo}>Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors flex items-center gap-2 min-w-[80px] justify-center" disabled={isAddingVideo}>
                        {isAddingVideo ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Add'}
                    </button>
                </div>
                </form>
            ) : (
                <button onClick={() => setShowAddForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300 transition-all duration-200 bg-slate-950/20 group">
                  <PlusIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Add Video</span>
                </button>
            )}
        </div>
      </div>
    </div>
    <ConfirmationModal
        isOpen={!!videoToDelete}
        onClose={() => setVideoToDelete(null)}
        onConfirm={() => videoToDelete && handleDeleteVideo(videoToDelete.id)}
        title="Remove Video"
        message={`Remove "${videoToDelete?.name}" from this playlist?`}
    />
    </>
  );
};

export default Playlist;
