import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';
import { TrashIcon, CheckIcon, PlayIcon, GripVerticalIcon } from './Icons';

interface VideoItemProps {
  video: Video;
  index: number;
  onDelete: () => void;
  onToggleWatched: () => void;
  onUpdate: (name: string, url: string) => void;
  onPlay: () => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragEnter: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const getYouTubeThumbnailUrl = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
    return 'https://placehold.co/120x90/1f2937/7ca3f5?text=Invalid+URL';
};

const VideoItem: React.FC<VideoItemProps> = ({
  video,
  index,
  onDelete,
  onToggleWatched,
  onUpdate,
  onPlay,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(video.name);
  const [editedUrl, setEditedUrl] = useState(video.url);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleUpdate = () => {
    if (editedName.trim() && editedUrl.trim()) {
      onUpdate(editedName.trim(), editedUrl.trim());
      setIsEditing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setEditedName(video.name);
      setEditedUrl(video.url);
      setIsEditing(false);
    }
  };
  
  const thumbnailUrl = getYouTubeThumbnailUrl(video.url);

  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`flex items-start gap-4 p-3 bg-gray-700 rounded-md transition-all duration-300 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="cursor-grab text-gray-400 touch-none pt-1">
        <GripVerticalIcon />
      </div>

      <img
        src={thumbnailUrl}
        alt={`Thumbnail for ${video.name}`}
        className="w-32 h-18 object-cover rounded-md flex-shrink-0 bg-gray-800 border border-gray-600"
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/120x90/1f2937/7ca3f5?text=Invalid+URL'; }}
      />

      {isEditing ? (
        <div className="flex-grow flex flex-col gap-2 min-w-0">
            <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-600 text-white p-1 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Video Name"
            />
            <input
                type="text"
                value={editedUrl}
                onChange={(e) => setEditedUrl(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-600 text-white p-1 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="YouTube URL"
            />
        </div>
      ) : (
        <div className="flex-grow cursor-pointer min-w-0 pt-1" onDoubleClick={() => setIsEditing(true)}>
          <p className={`font-medium ${video.watched ? 'line-through text-gray-400' : ''}`} title={video.name}>{video.name}</p>
          <p className="text-xs text-gray-500 truncate" title={video.url}>{video.url}</p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-shrink-0 ml-auto pt-1">
        <button onClick={onPlay} className="p-1 text-gray-300 hover:text-white transition-colors" title="Play Video">
          <PlayIcon />
        </button>
        <button
          onClick={onToggleWatched}
          className={`p-1.5 rounded-full transition-colors ${video.watched ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-green-600'}`}
          title={video.watched ? "Mark as Unwatched" : "Mark as Watched"}
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500 transition-colors" title="Delete Video">
          <TrashIcon />
        </button>
      </div>
    </li>
  );
};

export default VideoItem;
