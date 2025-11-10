
import React from 'react';
import { XIcon } from './Icons';

interface VideoPlayerProps {
  videoUrl: string | null;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;

  const getYouTubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    } else {
      return null;
    }
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) {
    // A simple alert for invalid URLs, could be a more sophisticated UI
    alert("Invalid YouTube URL provided.");
    onClose();
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl aspect-video relative mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 z-10"
          aria-label="Close video player"
        >
          <XIcon className="h-5 w-5" />
        </button>
        <iframe
          className="w-full h-full rounded-lg"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;
