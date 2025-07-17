import { Outlet, useLocation, Link } from 'react-router-dom';
import { Suspense } from 'react';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/lobby" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-900">FHEVM GUESS</h1>
          </Link>

          <nav className="flex space-x-6">
            <Link
              to="/lobby"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/lobby'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Game Lobby
            </Link>
            <Link
              to="/create"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/create'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Game
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
