import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ProjectList from '../sections/ProjectList';
import ProjectDetail from '../sections/ProjectDetail';
import { Project } from '../types';
import AuthHero from '../sections/AuthHero';
import {
  addCustomField,
  addMaterial,
  createProject,
  deleteMaterial,
  deleteProject,
  getProject,
  getProjects,
} from '../api/projects';
import { useAuth } from '../context/AuthContext';

const WorkspacePage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: getProjects });
  const projectId = params.id || projectsQuery.data?.[0]?.id;

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId as string),
    enabled: !!projectId,
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (proj) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/app/projects/${proj.id}`);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/app');
    },
  });

  const addMaterialMutation = useMutation({
    mutationFn: (payload: Parameters<typeof addMaterial>[1]) => addMaterial(projectId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setMessage('Materiaal opgeslagen.');
    },
    onError: () => setMessage('Opslaan van materiaal is mislukt.'),
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  });

  const addCustomFieldMutation = useMutation({
    mutationFn: (payload: { label: string; type: 'text' | 'number' }) =>
      addCustomField(projectId as string, payload.label, payload.type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  });

  const activeProject: Project | undefined = useMemo(() => projectQuery.data, [projectQuery.data]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <AuthHero />
      <section className="card p-6 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Persoonlijke omgeving</h2>
            <p className="text-sm text-gray-600">Beheer je instellingen en projecten. Multi-tenant wordt via orgs en users beheerd.</p>
          </div>
          <div className="text-sm text-brand-green font-semibold">
            {user ? `Ingelogd als ${user.name} (${user.email})` : 'Laden...'}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProjectList
              loading={projectsQuery.isLoading}
              projects={projectsQuery.data || []}
              activeId={activeProject?.id}
              onAdd={(payload) => createProjectMutation.mutate(payload)}
              onDelete={(id) => deleteProjectMutation.mutate(id)}
              onSelect={(id) => navigate(`/app/projects/${id}`)}
            />
          </div>
          <div className="md:col-span-2">
            {activeProject ? (
              <ProjectDetail
                project={activeProject}
                onAddMaterial={(material) => addMaterialMutation.mutate(material)}
                onDeleteMaterial={(id) => deleteMaterialMutation.mutate(id)}
                onAddColumn={(label, type) => addCustomFieldMutation.mutate({ label, type })}
                message={message}
              />
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
