import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNote, exportNote } from '../services/api';
import Chatbot from '../components/Chatbot';
import { ArrowLeft, FileText, Download, Tag, FileAudio, FileVideo, FileDown } from 'lucide-react';

export default function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const { data } = await getNote(id);
        setNote(data);
      } catch (error) {
        console.error('Failed to fetch note:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await exportNote(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${note.title || 'note'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export note:', error);
      alert('Failed to export note. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
  }

  if (!note) {
    return <div className="text-center py-12"><p className="text-xl">Note not found.</p><Link to="/" className="text-primary-500 mt-4 inline-block">Return Home</Link></div>;
  }

  const getFileIcon = (type) => {
    if (['mp3', 'wav', 'm4a'].includes(type)) return <FileAudio size={20} />;
    if (['mp4', 'webm'].includes(type)) return <FileVideo size={20} />;
    return <FileText size={20} />;
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-white px-4 py-2 rounded-xl border border-dark-700 transition-all disabled:opacity-50"
        >
          <FileDown size={18} className="text-primary-400" />
          {isExporting ? 'Exporting...' : 'Export as PDF'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="lg:w-2/3 space-y-6">
          <div className="glass-panel p-8 border-t-4 border-t-primary-500">
            <div className="flex items-center gap-3 mb-4 text-primary-400">
              {getFileIcon(note.file_type)}
              <span className="uppercase tracking-wider text-sm font-semibold">{note.file_type}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
            <p className="text-dark-400 text-sm mb-6 flex items-center justify-between border-b border-dark-700 pb-4">
              <span>{new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}</span>
              {note.original_file && (
                <a href={note.original_file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors">
                  <Download size={16} /> Original File
                </a>
              )}
            </p>

            {note.keywords && note.keywords.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag size={16} /> Key Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {note.keywords.map((kw, i) => (
                    <span key={i} className="bg-primary-500/10 text-primary-400 border border-primary-500/20 px-3 py-1 rounded-full text-xs font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">AI Summary</h2>
                <div className="prose prose-invert max-w-none text-dark-200">
                  <p className="whitespace-pre-wrap leading-relaxed">{note.summary}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4 text-white">Full Transcript</h2>
                <div className="bg-dark-900/50 p-6 rounded-xl border border-dark-700 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <p className="whitespace-pre-wrap text-sm text-dark-300 leading-relaxed font-mono">
                    {note.transcript}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Chatbot */}
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <Chatbot noteId={note.id} initialMessages={note.chat_messages} />
          </div>
        </div>
      </div>
    </div>
  );
}
