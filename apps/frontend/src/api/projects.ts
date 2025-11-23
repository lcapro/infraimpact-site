import { api } from './client';
import { CustomField, Material, MaterialPhases, Project } from '../types';

export interface ProjectListItem {
  id: string;
  name: string;
  description?: string | null;
}

interface ApiMaterial {
  id: string;
  name: string;
  supplier?: string | null;
  quantity: number;
  unit: string;
  distanceKm: number;
  transportMode: string;
  transportFuel: string;
  installation: string;
  phaseA1Mki: number;
  phaseA1Gwp: number;
  phaseA2Mki: number;
  phaseA2Gwp: number;
  phaseA3Mki: number;
  phaseA3Gwp: number;
  phaseDMki: number;
  phaseDGwp: number;
  customValues?: { customFieldId: string; value: string }[];
}

interface ApiProject extends ProjectListItem {
  materials: ApiMaterial[];
  customFields: CustomField[];
}

export interface CreateMaterialInput {
  name: string;
  supplier?: string;
  quantity: number;
  unit: string;
  distanceKm: number;
  transportMode: string;
  transportFuel: string;
  installation: string;
  phases: MaterialPhases;
  customValues?: Record<string, string | number>;
}

export const getProjects = async () => {
  const { data } = await api.get<ProjectListItem[]>('/projects');
  return data;
};

export const createProject = async (payload: { name: string; description?: string }) => {
  const { data } = await api.post<ProjectListItem>('/projects', payload);
  return data;
};

export const getProject = async (id: string) => {
  const { data } = await api.get<ApiProject>(`/projects/${id}`);
  return mapProject(data);
};

export const deleteProject = async (id: string) => {
  await api.delete(`/projects/${id}`);
};

export const addMaterial = async (projectId: string, payload: CreateMaterialInput) => {
  await api.post(`/projects/${projectId}/materials`, {
    name: payload.name,
    supplier: payload.supplier,
    quantity: payload.quantity,
    unit: payload.unit,
    distanceKm: payload.distanceKm,
    transportMode: payload.transportMode,
    transportFuel: payload.transportFuel,
    installation: payload.installation,
    phaseA1Mki: payload.phases.A1.mki,
    phaseA1Gwp: payload.phases.A1.gwp,
    phaseA2Mki: payload.phases.A2.mki,
    phaseA2Gwp: payload.phases.A2.gwp,
    phaseA3Mki: payload.phases.A3.mki,
    phaseA3Gwp: payload.phases.A3.gwp,
    phaseDMki: payload.phases.D.mki,
    phaseDGwp: payload.phases.D.gwp,
    customValues: payload.customValues,
  });
};

export const deleteMaterial = async (materialId: string) => {
  await api.delete(`/projects/materials/${materialId}`);
};

export const addCustomField = async (projectId: string, label: string, type: 'text' | 'number') => {
  const { data } = await api.post<CustomField>(`/projects/${projectId}/custom-fields`, { label, type });
  return data;
};

export const deleteCustomField = async (fieldId: string) => {
  await api.delete(`/projects/custom-fields/${fieldId}`);
};

export const getSummary = async (projectId: string) => {
  const { data } = await api.get(`/projects/${projectId}/summary`);
  return data as {
    materialsCount: number;
    totals: { mki: Record<'A1' | 'A2' | 'A3' | 'D', number>; gwp: Record<'A1' | 'A2' | 'A3' | 'D', number> };
  };
};

const mapProject = (project: ApiProject): Project => {
  const materials: Material[] = project.materials.map((m) => ({
    id: m.id,
    name: m.name,
    supplier: m.supplier || undefined,
    quantity: m.quantity,
    unit: m.unit,
    distanceKm: m.distanceKm,
    transportMode: m.transportMode,
    transportFuel: m.transportFuel,
    installation: m.installation,
    phases: {
      A1: { mki: m.phaseA1Mki, gwp: m.phaseA1Gwp },
      A2: { mki: m.phaseA2Mki, gwp: m.phaseA2Gwp },
      A3: { mki: m.phaseA3Mki, gwp: m.phaseA3Gwp },
      D: { mki: m.phaseDMki, gwp: m.phaseDGwp },
    },
    customValues: Object.fromEntries((m.customValues || []).map((cv) => [cv.customFieldId, cv.value])),
  }));

  return {
    id: project.id,
    name: project.name,
    description: project.description || undefined,
    materials,
    customFields: project.customFields,
  };
};
