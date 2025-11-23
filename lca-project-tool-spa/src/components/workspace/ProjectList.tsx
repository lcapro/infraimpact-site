import { useState } from 'react';
import { Project } from '../../lib/types';

interface Props {
  projects: Project[];
  activeId?: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
}

export function ProjectList({ projects, activeId, onSelect, onAdd }: Props) {
  const [name, setName] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Projecten</p>
          <p className="text-lg font-semibold text-slate-900">Overzicht</p>
        </div>
      </div>
      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelect(project.id)}
            className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
              project.id === activeId
                ? 'border-brand-300 bg-brand-50 text-brand-800'
                : 'border-slate-200 bg-white hover:border-brand-200'
            }`}
          >
            <span className="font-semibold">{project.name}</span>
            <span className="text-xs text-slate-500">{project.materials.length} materialen</span>
          </button>
        ))}
        <form
          className="flex gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onAdd(name.trim());
            setName('');
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nieuw projectnaam"
            className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            Toevoegen
          </button>
        </form>
      </div>
    </div>
  );
}
