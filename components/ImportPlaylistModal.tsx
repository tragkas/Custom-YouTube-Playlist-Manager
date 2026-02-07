
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
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[60] transition-opacity duration-300"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 mx-4 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <ImportIcon className="h-5 w-5 text-indigo-400"/>
            </div>
            <h3 className="text-xl font-bold text-white">Import Playlist</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close"
            disabled={isLoading}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Enter a public YouTube playlist URL. Our systems will automatically fetch titles and thumbnails to build your curated path.
        </p>

        <div className="space-y-4">
            <div className="relative">
              <input
                  type="url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-600 shadow-inner"
                  disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}

            <div className="text-[11px] leading-relaxed text-slate-500 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 italic">
                <span className="text-indigo-400 font-bold not-italic mr-1">Note:</span> Due to YouTube's RSS limitations, imports are currently capped at the 10 most recent videos per request. Full sync support is coming in next update.
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all duration-200 flex items-center justify-center min-w-[120px] disabled:opacity-50"
            disabled={isLoading || !playlistUrl.trim()}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Fetch Playlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPlaylistModal;
