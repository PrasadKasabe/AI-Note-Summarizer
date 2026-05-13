import { useState, useRef } from 'react';
import { UploadCloud, File, Loader2, Video, Link as LinkIcon } from 'lucide-react';
import { uploadNote } from '../services/api';

export default function Upload({ onUploadSuccess }) {
  const [activeTab, setActiveTab] = useState('file');
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (activeTab === 'file' && !file) return;
    if (activeTab === 'url' && !videoUrl.trim()) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    if (activeTab === 'file') {
      formData.append('file', file);
      formData.append('title', file.name);
    } else {
      formData.append('video_url', videoUrl.trim());
    }

    try {
      const response = await uploadNote(formData);
      if (activeTab === 'file') {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setVideoUrl('');
      }
      if (onUploadSuccess) onUploadSuccess(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to process. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel p-0 overflow-hidden border border-dark-600 transition-colors">
      <div className="flex border-b border-dark-600">
        <button 
          onClick={() => { setActiveTab('file'); setError(null); }}
          className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'file' ? 'bg-primary-600/10 text-primary-400 border-b-2 border-primary-500' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'}`}
        >
          <UploadCloud className="inline-block mr-2" size={18} />
          Upload File
        </button>
        <button 
          onClick={() => { setActiveTab('url'); setError(null); }}
          className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'url' ? 'bg-primary-600/10 text-primary-400 border-b-2 border-primary-500' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'}`}
        >
          <Video className="inline-block mr-2" size={18} />
          YouTube URL
        </button>
      </div>
      
      <div className="p-8 text-center">
        {activeTab === 'file' && (
          <div className="border-dashed border-2 border-primary-500/30 p-8 rounded-xl hover:border-primary-500/50 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.mp3,.wav,.m4a,.mp4,.webm"
            />
            
            {!file ? (
              <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="bg-primary-500/10 p-4 rounded-full mb-4 text-primary-500">
                  <UploadCloud size={40} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload your note</h3>
                <p className="text-dark-400">Drag and drop or click to browse</p>
                <p className="text-xs text-dark-500 mt-2">Supports PDF, Audio (MP3, WAV), Video (MP4)</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-primary-500/10 p-4 rounded-full mb-4 text-primary-500">
                  <File size={40} />
                </div>
                <h3 className="text-lg font-medium mb-1 truncate max-w-xs">{file.name}</h3>
                <p className="text-sm text-dark-400 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setFile(null)}
                    className="px-4 py-2 rounded-lg border border-dark-600 hover:bg-dark-800 transition-colors"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Processing AI...
                      </>
                    ) : 'Summarize Now'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'url' && (
          <div className="flex flex-col items-center">
            <div className="bg-primary-500/10 p-4 rounded-full mb-6 text-primary-500">
              <LinkIcon size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Summarize YouTube Video</h3>
            <p className="text-dark-400 mb-6">Paste a YouTube link to instantly generate a summary and notes.</p>
            
            <div className="w-full max-w-md mx-auto flex flex-col gap-4">
              <input 
                type="text" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors outline-none text-white placeholder-dark-400"
                disabled={isUploading}
              />
              <button 
                onClick={handleUpload}
                disabled={isUploading || !videoUrl.trim()}
                className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Extracting & Summarizing...
                  </>
                ) : 'Summarize Video'}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 mt-6 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}
      </div>
    </div>
  );
}
