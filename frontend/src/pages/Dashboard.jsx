import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotes } from '../services/api';
import Upload from '../components/Upload';
import { FileText, Clock, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await getNotes();
        setNotes(data);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const handleUploadSuccess = (newNote) => {
    setNotes([newNote, ...notes]);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <section>
        <h2 className="text-3xl font-bold mb-6">Create New Summary</h2>
        <Upload onUploadSuccess={handleUploadSuccess} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Clock className="text-primary-500" /> Recent Notes
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 glass-panel"></div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 glass-panel">
            <p className="text-dark-400 text-lg">No notes yet. Upload a file to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Link to={`/note/${note.id}`} key={note.id} className="group">
                <div className="glass-panel p-6 h-full flex flex-col hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-dark-700/50 rounded-lg text-primary-400 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
                      <FileText size={24} />
                    </div>
                    <span className="text-xs font-medium text-dark-400 uppercase tracking-wider bg-dark-800 px-2 py-1 rounded">
                      {note.file_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-sm text-dark-300 line-clamp-2 mb-4 flex-grow">
                    {note.summary || 'Processing summary...'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-dark-400 mt-auto pt-4 border-t border-dark-700/50">
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center group-hover:text-primary-400 transition-colors">
                      View details <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
