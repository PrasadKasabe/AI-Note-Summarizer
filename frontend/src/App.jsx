import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NoteDetail from './pages/NoteDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-dark-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Smart Notes AI
        </h1>
        {user && (
          <div className="flex items-center gap-6">
            <span className="text-dark-300 text-sm">Hello, <span className="text-white font-medium">{user.username}</span></span>
            <button 
              onClick={logout}
              className="text-dark-400 hover:text-white text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-900 selection:bg-primary-500/30">
          <Header />
          
          <main className="max-w-6xl mx-auto px-6 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/note/:id" 
                element={
                  <ProtectedRoute>
                    <NoteDetail />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
