export type PhaseKey = 'A1' | 'A2' | 'A3' | 'D';

export interface PhaseValues {
  mki: number;
  gwp: number;
}

export interface CustomColumn {
  id: string;
  label: string;
  type: 'text' | 'number';
}

export interface Material {
  id: string;
  material: string;
  supplier?: string;
  quantity: number;
  unit: string;
  distance: number;
  transportMode: string;
  transportFuel: string;
  installationFuel: string;
  phases: Record<PhaseKey, PhaseValues>;
  custom: Record<string, string | number>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  customColumns: CustomColumn[];
  materials: Material[];
}
