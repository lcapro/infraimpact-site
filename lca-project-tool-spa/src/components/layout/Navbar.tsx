import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { session, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white font-semibold">II</span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700">InfraImpact</p>
            <p className="text-lg font-semibold text-slate-900">LCA project tool</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link
            to="/"
            className={`rounded-md px-3 py-2 transition hover:text-brand-700 ${location.pathname === '/' ? 'bg-brand-50 text-brand-700' : ''}`}
          >
            Aanmelden
          </Link>
          <Link
            to="/workspace"
            className={`rounded-md px-3 py-2 transition hover:text-brand-700 ${
              location.pathname === '/workspace' ? 'bg-brand-50 text-brand-700' : ''
            } ${!session?.verified ? 'pointer-events-none opacity-40' : ''}`}
          >
            Workspace
          </Link>
          {session && (
            <button
              onClick={logout}
              className="rounded-md px-3 py-2 text-slate-500 transition hover:bg-slate-100"
            >
              Uitloggen
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
