
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
  isDragOver: boolean;
}

const getYouTubeThumbnailUrl = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
    return 'https://placehold.co/120x90/0f172a/334155?text=Invalid+URL';
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
  isDragging,
  isDragOver
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
      className={`relative flex items-center gap-4 p-2 bg-slate-800/40 border border-slate-800/60 rounded-xl transition-all duration-200 group
        ${isDragging ? 'opacity-30 scale-[0.98] shadow-inner' : 'opacity-100 shadow-sm'}
        ${isDragOver ? 'border-t-2 border-indigo-500 pt-3' : 'border-t border-slate-800/60'}
        hover:bg-slate-800/80 hover:border-slate-700`}
    >
      {/* Drop Indicator Label */}
      {isDragOver && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10">
          INSERT
        </div>
      )}

      <div className="cursor-grab text-slate-600 hover:text-slate-400 touch-none px-1 active:cursor-grabbing">
        <GripVerticalIcon className="h-4 w-4" />
      </div>

      <div className="relative w-24 h-14 flex-shrink-0 group/thumb">
        <img
          src={thumbnailUrl}
          alt={`Thumbnail for ${video.name}`}
          className="w-full h-full object-cover rounded-lg bg-slate-900 border border-slate-800 transition-transform duration-300"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/120x90/0f172a/334155?text=...'; }}
        />
        <button 
          onClick={onPlay}
          className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
        >
          <PlayIcon className="h-6 w-6 text-white" />
        </button>
      </div>

      {isEditing ? (
        <div className="flex-grow flex flex-col gap-1 min-w-0">
            <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-900 text-white text-sm p-1 rounded-md outline-none border border-indigo-500/30"
                placeholder="Video Title"
            />
            <input
                type="text"
                value={editedUrl}
                onChange={(e) => setEditedUrl(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-900 text-slate-400 text-xs p-1 rounded-md outline-none border border-slate-800"
                placeholder="YouTube URL"
            />
        </div>
      ) : (
        <div className="flex-grow cursor-pointer min-w-0" onDoubleClick={() => setIsEditing(true)}>
          <p className={`text-sm font-medium ${video.watched ? 'text-slate-500' : 'text-slate-200'} truncate group-hover:text-indigo-300 transition-colors`} title={video.name}>{video.name}</p>
          <p className="text-[10px] text-slate-600 truncate mt-0.5" title={video.url}>{new URL(video.url).hostname}</p>
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto pr-1">
        <button
          onClick={onToggleWatched}
          className={`p-1.5 rounded-lg transition-all duration-200 ${video.watched ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
          title={video.watched ? "Watched" : "Unwatched"}
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors" title="Delete">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
};

export default VideoItem;
