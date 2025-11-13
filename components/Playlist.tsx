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
  const [isOpen, setIsOpen] = useState(true);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);


  const nameInputRef = useRef<HTMLInputElement>(null);
  const addVideoUrlInputRef = useRef<HTMLInputElement>(null);
  
  // D&D state for videos
  const draggedVideoIndex = useRef<number | null>(null);
  const dragOverVideoIndex = useRef<number | null>(null);
  const [draggingVideo, setDraggingVideo] = useState<number | null>(null);


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
      // Using noembed.com as a proxy to fetch video metadata without CORS issues.
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
  const handleVideoDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    draggedVideoIndex.current = index;
    setDraggingVideo(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleVideoDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    dragOverVideoIndex.current = index;
  };

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
      className={`bg-gray-800 p-4 rounded-lg shadow-lg transition-all duration-300 ${isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'} ${hasDragOver ? 'border-2 border-dashed border-blue-500' : 'border-2 border-transparent'}`}
    >
      <div className="flex items-center gap-3">
        <div className="cursor-grab text-gray-500 touch-none">
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
            className="text-2xl font-bold bg-gray-700 text-white p-1 rounded-md flex-grow outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <h2 onDoubleClick={() => setIsEditingName(true)} className="text-2xl font-bold flex-grow cursor-pointer select-none">{playlist.name}</h2>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-gray-400 hover:bg-gray-700 rounded-full transition-colors" 
          aria-label={isOpen ? "Collapse playlist" : "Expand playlist"}
        >
          <ChevronDownIcon className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>
        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors" title="Delete Playlist">
          <TrashIcon />
        </button>
      </div>

      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden space-y-4">
            <div>
                <div className="flex justify-between items-center mb-1 text-sm text-gray-400">
                    <span>Progress ({watchedCount}/{totalCount})</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <ul className="space-y-2">
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
                />
                ))}
            </ul>
            
            {showAddForm ? (
                <form onSubmit={handleAddVideo} className="space-y-3 pt-2">
                    <input
                        ref={addVideoUrlInputRef}
                        type="url"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="Paste a YouTube URL"
                        className="w-full bg-gray-700 text-white p-2 rounded-md outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors"
                        required
                        disabled={isAddingVideo}
                    />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50" disabled={isAddingVideo}>Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center w-[76px] disabled:opacity-50" disabled={isAddingVideo}>
                        {isAddingVideo ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Add'}
                    </button>
                </div>
                </form>
            ) : (
                <button onClick={() => setShowAddForm(true)} className="w-full flex items-center justify-center gap-2 bg-gray-700/50 text-gray-300 p-2 rounded-md hover:bg-gray-700 hover:text-white transition-colors">
                <PlusIcon className="h-5 w-5" />
                Add Video
                </button>
            )}
        </div>
      </div>
    </div>
    <ConfirmationModal
        isOpen={!!videoToDelete}
        onClose={() => setVideoToDelete(null)}
        onConfirm={() => videoToDelete && handleDeleteVideo(videoToDelete.id)}
        title="Delete Video?"
        message={`Are you sure you want to delete "${videoToDelete?.name}"? This action cannot be undone.`}
    />
    </>
  );
};

export default Playlist;