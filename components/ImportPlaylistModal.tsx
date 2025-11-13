import React, { useState } from 'react';
import { Playlist } from '../types';
import { importYouTubePlaylist } from '../utils/youtube';
import { XIcon, ImportIcon } from './Icons';

interface ImportPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (playlist: Playlist) => void;
}

const ImportPlaylistModal: React.FC<ImportPlaylistModalProps> = ({ isOpen, onClose, onImport }) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!playlistUrl.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
        const newPlaylist = await importYouTubePlaylist(playlistUrl);
        onImport(newPlaylist);
        setPlaylistUrl('');
        onClose();
    } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setPlaylistUrl('');
    setError(null);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ImportIcon className="h-6 w-6"/> Import YouTube Playlist
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
            disabled={isLoading}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-400 mb-4">
            Paste the URL of a public YouTube playlist to import its videos.
        </p>

        <div className="space-y-4">
            <input
                type="url"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=..."
                className="w-full bg-gray-700 text-white p-2 rounded-md outline-none border-2 border-transparent focus:border-blue-500 transition-colors"
                disabled={isLoading}
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="text-xs text-gray-500 bg-gray-900 p-2 rounded-md">
                <strong>Note:</strong> Due to YouTube's RSS feed limitations, only the 10 most recent videos of a playlist can be imported.
            </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 flex items-center justify-center w-28 disabled:opacity-50"
            disabled={isLoading || !playlistUrl.trim()}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPlaylistModal;
