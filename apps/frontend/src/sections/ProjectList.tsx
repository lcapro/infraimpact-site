import { useState } from 'react';
import { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  activeId?: string;
  onAdd: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectList = ({ projects, activeId, onAdd, onDelete }: ProjectListProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const addProject = () => {
    if (!name) return;
    onAdd({ id: crypto.randomUUID(), name, description, customColumns: [], materials: [] });
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Projectenoverzicht</h3>
        <p className="text-sm text-gray-600">Maak meerdere projecten aan en wissel per project.</p>
      </div>
      <div className="grid gap-3">
        <label className="space-y-1 block">
          <span className="grid-label">Projectnaam</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Bijv. Verbreding N210"
          />
        </label>
        <label className="space-y-1 block">
          <span className="grid-label">Beschrijving</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Fase, opdrachtgever..."
          />
        </label>
        <button
          onClick={addProject}
          className="inline-flex justify-center px-4 py-2 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-600"
        >
          Project toevoegen
        </button>
      </div>
      <div className="grid gap-3" aria-label="project-list">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-xl p-3 flex items-start gap-3 justify-between">
            <div>
              <div className="font-semibold">{project.name}</div>
              <div className="text-sm text-gray-600">{project.description || 'Geen beschrijving'}</div>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-sm ${project.id === activeId ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-700'}`}
              >
                {project.id === activeId ? 'Actief' : 'Selecteer via router'}
              </span>
              <button
                onClick={() => onDelete(project.id)}
                className="px-3 py-1 rounded-xl text-sm bg-red-50 text-red-700 hover:bg-red-100"
              >
                Verwijderen
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div className="text-sm text-gray-600">Nog geen projecten. Voeg er hierboven een toe.</div>}
      </div>
    </div>
  );
};

export default ProjectList;
