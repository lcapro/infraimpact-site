export type PhaseKey = 'A1' | 'A2' | 'A3' | 'D';

export interface PhaseValues {
  mki: number;
  gwp: number;
}

export type MaterialPhases = Record<PhaseKey, PhaseValues>;

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number';
}

export interface Material {
  id: string;
  name: string;
  supplier?: string;
  quantity: number;
  unit: string;
  distanceKm: number;
  transportMode: string;
  transportFuel: string;
  installation: string;
  phases: MaterialPhases;
  customValues?: Record<string, string>;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string | null;
}

export interface Project extends ProjectSummary {
  customFields: CustomField[];
  materials: Material[];
}

export interface UserSettings {
  preferredUnit?: string;
  roleDescription?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  settings?: UserSettings;
}
