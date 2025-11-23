import { useMemo, useSyncExternalStore } from 'react';
import { generateToken, readDb, subscribe, writeDb } from './db';
import { Material, Project } from './types';

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

export function useWorkspace() {
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
      parseEpd: (content: string) => {
        const lower = content.toLowerCase();
        const mkiMatch = /\b(mki|eci|€)\s*[:=]?\s*([0-9.,]+)/.exec(lower);
        const gwpMatch = /(gwp(?: total)?|gwp[ -]?t)\s*[:=]?\s*([0-9.,]+)/.exec(lower);
        const perPhase = ['a1', 'a2', 'a3', 'd'].map((phase) => {
          const regex = new RegExp(`${phase}[^0-9]*([0-9.,]+)`, 'i');
          const value = regex.exec(content);
          return {
            phase: phase.toUpperCase() as 'A1' | 'A2' | 'A3' | 'D',
            mki: value ? Number(value[1].replace(',', '.')) : undefined,
          };
        });
        return {
          mkiPerUnit: mkiMatch ? Number(mkiMatch[2].replace(',', '.')) : undefined,
          gwpPerUnit: gwpMatch ? Number(gwpMatch[2].replace(',', '.')) : undefined,
          phases: perPhase,
        };
      },
    };
  }, [snapshot.projects, snapshot.userId]);

  return { ...snapshot, ...actions };
}
