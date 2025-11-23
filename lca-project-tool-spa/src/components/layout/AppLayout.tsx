import { Navbar } from './Navbar';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 bg-grid">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="rounded-2xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          {children}
        </div>
      </main>
    </div>
  );
};
