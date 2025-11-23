import { useMemo, useSyncExternalStore } from 'react';
import { parseEpdContent } from '../lib/epdParser';
import { readDb, subscribe, writeDb } from '../lib/db';
import { Material, Project } from '../lib/types';

function hydrate() {
  const db = readDb();
  const sessionUser = db.sessionEmail ? db.users.find((u) => u.email === db.sessionEmail) : undefined;
  return {
    projects: sessionUser?.projects ?? [],
    userId: sessionUser?.id,
  };
}

function persistProjects(userId: string, projects: Project[]) {
  const db = readDb();
  db.users = db.users.map((u) => (u.id === userId ? { ...u, projects } : u));
  writeDb(db);
}

export function useWorkspaceStore() {
  const snapshot = useSyncExternalStore(subscribe, hydrate, hydrate);

  const actions = useMemo(() => {
    return {
      addProject: (name: string) => {
        if (!snapshot.userId) return;
        const projects: Project[] = [
          ...snapshot.projects,
          { id: crypto.randomUUID(), name, materials: [], customColumns: [] },
        ];
        persistProjects(snapshot.userId, projects);
      },
      renameProject: (projectId: string, name: string) => {
        if (!snapshot.userId) return;
        const projects = snapshot.projects.map((p) => (p.id === projectId ? { ...p, name } : p));
        persistProjects(snapshot.userId, projects);
      },
      addCustomColumn: (projectId: string, column: string) => {
        if (!snapshot.userId) return;
        const projects = snapshot.projects.map((p) =>
          p.id === projectId ? { ...p, customColumns: [...p.customColumns, column] } : p
        );
        persistProjects(snapshot.userId, projects);
      },
      addMaterial: (projectId: string, material: Omit<Material, 'id'>) => {
        if (!snapshot.userId) return;
        const projects = snapshot.projects.map((p) =>
          p.id === projectId
            ? { ...p, materials: [...p.materials, { ...material, id: crypto.randomUUID() }] }
            : p
        );
        persistProjects(snapshot.userId, projects);
      },
      updateMaterial: (projectId: string, materialId: string, patch: Partial<Material>) => {
        if (!snapshot.userId) return;
        const projects = snapshot.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                materials: p.materials.map((m) => (m.id === materialId ? { ...m, ...patch } : m)),
              }
            : p
        );
        persistProjects(snapshot.userId, projects);
      },
      removeMaterial: (projectId: string, materialId: string) => {
        if (!snapshot.userId) return;
        const projects = snapshot.projects.map((p) =>
          p.id === projectId ? { ...p, materials: p.materials.filter((m) => m.id !== materialId) } : p
        );
        persistProjects(snapshot.userId, projects);
      },
      parseEpd: parseEpdContent,
    };
  }, [snapshot.projects, snapshot.userId]);

  return { ...snapshot, ...actions };
}
