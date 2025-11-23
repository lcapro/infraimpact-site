import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectList from '../sections/ProjectList';
import ProjectDetail from '../sections/ProjectDetail';
import { Project } from '../types';
import AuthHero from '../sections/AuthHero';

const seedProject = (): Project => ({
  id: 'project-demo',
  name: 'Demo project',
  description: 'Voorbeeld uit de statische HTML demo',
  customColumns: [],
  materials: [],
});

const WorkspacePage = () => {
  const params = useParams();
  const [projects, setProjects] = useState<Project[]>([seedProject()]);
  const activeProjectId = params.id || projects[0]?.id;

  const activeProject = useMemo(() => projects.find((p) => p.id === activeProjectId) || projects[0], [projects, activeProjectId]);

  const handleAddProject = (project: Project) => setProjects((prev) => [...prev, project]);
  const handleUpdateProject = (project: Project) => setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
  const handleDeleteProject = (id: string) => setProjects((prev) => prev.filter((p) => p.id !== id));

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <AuthHero />
      <section className="card p-6 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Persoonlijke omgeving</h2>
            <p className="text-sm text-gray-600">Beheer je instellingen en projecten. Multi-tenant wordt via orgs en users beheerd.</p>
          </div>
          <div className="text-sm text-brand-green font-semibold">Ingelogd als demo@infraimpact.nl</div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProjectList
              projects={projects}
              activeId={activeProject?.id}
              onAdd={handleAddProject}
              onDelete={handleDeleteProject}
            />
          </div>
          <div className="md:col-span-2">
            {activeProject ? (
              <ProjectDetail project={activeProject} onChange={handleUpdateProject} />
            ) : (
              <div className="text-sm text-gray-600">Geen project geselecteerd.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default WorkspacePage;
