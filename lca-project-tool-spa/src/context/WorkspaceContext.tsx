import { createContext, ReactNode, useContext } from 'react';
import { useWorkspaceStore } from '../hooks/useWorkspace';

const WorkspaceContext = createContext<ReturnType<typeof useWorkspaceStore> | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const value = useWorkspaceStore();
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return ctx;
}
