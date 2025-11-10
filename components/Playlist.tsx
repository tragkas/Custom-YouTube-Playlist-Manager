
import React, { useState, useRef, useEffect } from 'react';
import { Playlist as PlaylistType, Video } from '../types';
import VideoItem from './VideoItem';
import { TrashIcon, PlusIcon, GripVerticalIcon } from './Icons';

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
  const [newVideoName, setNewVideoName] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const addVideoNameInputRef = useRef<HTMLInputElement>(null);
  
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
      addVideoNameInputRef.current?.focus();
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
  
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVideoName.trim() && newVideoUrl.trim()) {
      const newVideo: Video = {
        id: `vid-${Date.now()}-${Math.random()}`,
        name: newVideoName.trim(),
        url: newVideoUrl.trim(),
        watched: false,
      };
      onUpdate({ ...playlist, videos: [...playlist.videos, newVideo] });
      setNewVideoName('');
      setNewVideoUrl('');
      setShowAddForm(false);
    }
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
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`bg-gray-800 p-4 rounded-lg shadow-lg space-y-4 transition-all duration-300 ${isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'} ${hasDragOver ? 'border-2 border-dashed border-blue-500' : 'border-2 border-transparent'}`}
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
          <h2 onDoubleClick={() => setIsEditingName(true)} className="text-2xl font-bold flex-grow cursor-pointer">{playlist.name}</h2>
        )}
        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors" title="Delete Playlist">
          <TrashIcon />
        </button>
      </div>

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
            onDelete={() => handleDeleteVideo(video.id)}
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
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={addVideoNameInputRef}
              type="text"
              value={newVideoName}
              onChange={(e) => setNewVideoName(e.target.value)}
              placeholder="Video Name"
              className="flex-grow bg-gray-700 text-white p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="url"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="YouTube URL"
              className="flex-grow bg-gray-700 text-white p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Add</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="w-full flex items-center justify-center gap-2 bg-gray-700/50 text-gray-300 p-2 rounded-md hover:bg-gray-700 hover:text-white transition-colors">
          <PlusIcon className="h-5 w-5" />
          Add Video
        </button>
      )}
    </div>
  );
};

export default Playlist;
