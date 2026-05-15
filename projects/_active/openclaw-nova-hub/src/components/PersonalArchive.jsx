import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBytes, timeAgo } from '../lib/format.js';

const FILE_ICONS = {
  image: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  audio: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  video: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  document: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  unknown: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

const CATEGORY_COLORS = {
  image: 'from-cyan-500/20 to-cyan-400/5 border-cyan-500/30 text-cyan-400',
  audio: 'from-fuchsia-500/20 to-fuchsia-400/5 border-fuchsia-500/30 text-fuchsia-400',
  video: 'from-emerald-500/20 to-emerald-400/5 border-emerald-500/30 text-emerald-400',
  document: 'from-amber-500/20 to-amber-400/5 border-amber-500/30 text-amber-400',
  unknown: 'from-slate-500/20 to-slate-400/5 border-slate-500/30 text-slate-400',
};

function getFileCategory(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'].includes(ext)) return 'image';
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus'].includes(ext)) return 'audio';
  if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'].includes(ext)) return 'video';
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'json', 'csv', 'xlsx', 'pptx', 'html', 'xml'].includes(ext)) return 'document';
  return 'unknown';
}

function getFileIcon(category) {
  return FILE_ICONS[category] || FILE_ICONS.unknown;
}

// Separate Modal Component to prevent re-renders
function FileDetailModal({ file, onClose, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(file);
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="max-w-2xl w-full rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[file.category]} flex items-center justify-center border`}>
              {getFileIcon(file.category)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-nova-50 truncate max-w-md">{file.name}</h3>
              <p className="text-sm text-nova-200/50 capitalize">{file.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-nova-200/60"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview for images */}
        {file.category === 'image' && file.thumbnail && (
          <div className="mb-6 rounded-xl border border-white/10 overflow-hidden bg-black/50">
            <img 
              src={file.thumbnail} 
              alt={file.name}
              className="w-full max-h-48 object-contain"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className="text-[10px] uppercase tracking-wider text-nova-200/40 mb-1">File Size</div>
            <div className="text-lg text-nova-100 font-medium">{formatBytes(file.size)}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className="text-[10px] uppercase tracking-wider text-nova-200/40 mb-1">Received</div>
            <div className="text-lg text-nova-100 font-medium">{timeAgo(file.date)}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className="text-[10px] uppercase tracking-wider text-nova-200/40 mb-1">File Type</div>
            <div className="text-lg text-nova-100 font-medium uppercase">{file.name.split('.').pop()}</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className="text-[10px] uppercase tracking-wider text-nova-200/40 mb-1">Path</div>
            <div className="text-sm text-nova-100 font-mono truncate">~/.openclaw/media/inbound/</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-nova-200 hover:bg-white/5 transition-colors text-sm"
          >
            Close
          </button>
          <button 
            onClick={() => window.open(`file://${file.path}`, '_blank')}
            className="flex-1 px-4 py-3 rounded-xl bg-synapse-cyan/20 border border-synapse-cyan/30 text-synapse-cyan hover:bg-synapse-cyan/30 transition-colors text-sm font-medium"
          >
            Open File
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              showConfirm 
                ? 'bg-red-500/30 border border-red-500/50 text-red-400 hover:bg-red-500/40' 
                : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
            } disabled:opacity-50`}
          >
            {isDeleting ? 'Deleting...' : showConfirm ? 'Confirm Delete?' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PersonalArchive({ onClose }) {
  const [files, setFiles] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'youtube'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [sortKey, setSortKey] = useState('date');

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const [mediaRes, youtubeRes] = await Promise.all([
        fetch('/media-index.json'),
        fetch('/youtube-videos.json')
      ]);
      
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setFiles(mediaData.files || []);
      }
      
      if (youtubeRes.ok) {
        const youtubeData = await youtubeRes.json();
        setYoutubeVideos(youtubeData.videos || []);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load archive data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDelete = async (file) => {
    try {
      const res = await fetch('/api/archive/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path })
      });
      if (!res.ok) throw new Error('Delete failed');
      
      setFiles(prev => prev.filter(f => f.id !== file.id));
      // Re-scan media to update the json file in background
      fetch('/api/chat', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: 'scan media'}) }).catch(()=>console.log('bg scan trigger'));
    } catch (err) {
      console.error('Failed to move to trash:', err);
      alert('Failed to delete file. Is the voice server running?');
      throw err;
    }
  };

  const processedFiles = useMemo(() => {
    return files.map(file => ({
      ...file,
      category: getFileCategory(file.name),
    }));
  }, [files]);

  const categories = useMemo(() => {
    const counts = { all: processedFiles.length };
    processedFiles.forEach(f => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, [processedFiles]);

  const filteredFiles = useMemo(() => {
    let result = processedFiles;

    if (selectedCategory !== 'all') {
      result = result.filter(f => f.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      if (sortKey === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortKey === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortKey === 'size') {
        return b.size - a.size;
      }
      return 0;
    });

    return result;
  }, [processedFiles, selectedCategory, searchQuery, sortKey]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedFile) {
          setSelectedFile(null);
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, onClose]);

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-synapse-cyan/30 to-cyan-400/10 border border-synapse-cyan/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-synapse-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-nova-50">Personal Archive</h1>
                <p className="text-xs text-nova-200/50">Classified personal vault</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-nova-200/60"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 mb-4">
            {[
              { id: 'files', label: 'Media Files', count: files.length },
              { id: 'youtube', label: 'YouTube Videos', count: youtubeVideos.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-synapse-cyan/20 border border-synapse-cyan/40 text-synapse-cyan'
                    : 'bg-white/5 border border-white/10 text-nova-200/60 hover:bg-white/10'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-nova-50 placeholder:text-nova-200/30 focus:outline-none focus:border-synapse-cyan/50 transition-colors"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nova-200/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-nova-50 focus:outline-none focus:border-synapse-cyan/50"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-synapse-cyan/20 text-synapse-cyan' : 'text-nova-200/50 hover:text-nova-200'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-synapse-cyan/20 text-synapse-cyan' : 'text-nova-200/50 hover:text-nova-200'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category Filters - only show for files tab */}
          {activeTab === 'files' && (
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { id: 'all', label: 'All Files', count: categories.all },
                { id: 'image', label: 'Images', count: categories.image || 0 },
                { id: 'audio', label: 'Audio', count: categories.audio || 0 },
                { id: 'video', label: 'Videos', count: categories.video || 0 },
                { id: 'document', label: 'Documents', count: categories.document || 0 },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider border transition-all ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${CATEGORY_COLORS[cat.id]} shadow-glow`
                      : 'border-white/[0.08] bg-white/[0.03] text-nova-200/60 hover:text-nova-200 hover:border-white/20'
                  }`}
                >
                  <span className={selectedCategory === cat.id ? 'text-white' : ''}>{cat.label}</span>
                  <span className="ml-1.5 text-[10px] opacity-60">({cat.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-[1600px] mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-nova-200/50">
                <div className="w-5 h-5 border-2 border-synapse-cyan/30 border-t-synapse-cyan rounded-full animate-spin" />
                <span className="text-sm">Loading archive...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-nova-200 mb-2">{error}</p>
              <button
                onClick={loadFiles}
                className="px-4 py-2 rounded-lg bg-synapse-cyan/20 border border-synapse-cyan/30 text-synapse-cyan text-sm hover:bg-synapse-cyan/30 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : activeTab === 'youtube' ? (
            /* YouTube Videos */
            youtubeVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </div>
                <p className="text-nova-200/50 mb-1">No YouTube videos found</p>
                <p className="text-nova-200/30 text-sm">Videos appear here when you save transcripts with YouTube links</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {youtubeVideos.map(video => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all p-4"
                  >
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-red-500/20 to-red-400/5 border border-red-500/30 mb-3 overflow-hidden flex items-center justify-center relative">
                      {video.videoId ? (
                        <img 
                          src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 text-red-400/80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                      </div>
                      {video.hasTranscript && (
                        <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/70 text-[10px] text-white">Transcript</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-nova-50 font-medium line-clamp-2 mb-1">{video.title}</p>
                      <p className="text-xs text-nova-200/50">{video.channel}</p>
                      <div className="flex items-center gap-2 text-[10px] text-nova-200/40 mt-2">
                        {video.hasAnalysis && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Analyzed</span>
                        )}
                        <span>{timeAgo(video.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-nova-200/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-4-4m0 0l-4 4m4-4H4" />
                </svg>
              </div>
              <p className="text-nova-200/50 mb-1">No files found</p>
              <p className="text-nova-200/30 text-sm">{searchQuery ? 'Try a different search term' : 'Your vault is empty'}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4, transition: { duration: 0.15 } }}
                    onClick={() => setSelectedFile(file)}
                    className="group cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all p-4"
                  >
                    <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[file.category]} flex items-center justify-center border mb-3 overflow-hidden`}>
                      {file.category === 'image' && file.thumbnail ? (
                        <img src={file.thumbnail} alt="" className="w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="text-current opacity-60 group-hover:opacity-100 transition-opacity">
                          {getFileIcon(file.category)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-nova-50 truncate font-medium">{file.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-nova-200/40 mt-1">
                        <span>{formatBytes(file.size)}</span>
                        <span>·</span>
                        <span>{timeAgo(file.date)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => setSelectedFile(file)}
                    className="group cursor-pointer flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all px-4 py-3"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[file.category]} flex items-center justify-center border flex-shrink-0 overflow-hidden`}>
                      {file.category === 'image' && file.thumbnail ? (
                        <img src={file.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-current opacity-60">{getFileIcon(file.category)}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-nova-50 truncate font-medium">{file.name}</p>
                      <div className="flex items-center gap-3 text-[10px] text-nova-200/40">
                        <span className="uppercase">{file.category}</span>
                        <span>·</span>
                        <span>{file.name.split('.').pop()?.toUpperCase()}</span>
                        <span>·</span>
                        <span>{formatBytes(file.size)}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-nova-200/30 hidden sm:block">
                      {timeAgo(file.date)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* File Detail Modal */}
      <AnimatePresence>
        {selectedFile && (
          <FileDetailModal
            key={selectedFile.id}
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      {/* YouTube Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-6"
              onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-nova-50">{selectedVideo.title}</h3>
                  <button onClick={() => setSelectedVideo(null)} className="text-nova-200/50 hover:text-nova-100">×</button>
                </div>
                <p className="text-sm text-nova-200/70 mb-4">{selectedVideo.channel}</p>
                {selectedVideo.summary && (
                  <p className="text-xs text-nova-200/50 mb-4 line-clamp-4">{selectedVideo.summary}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-sm"
                  >
                    Close
                  </button>
                  {selectedVideo.videoId && (
                    <a
                      href={`https://youtube.com/watch?v=${selectedVideo.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-center text-sm hover:bg-red-500/30 transition-colors"
                    >
                      Watch on YouTube
                    </a>
                  )}
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
