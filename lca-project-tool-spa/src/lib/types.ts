export type PhaseValue = {
  phase: 'A1' | 'A2' | 'A3' | 'D';
  mki?: number;
  gwp?: number;
};

export type Material = {
  id: string;
  name: string;
  supplier?: string;
  quantity?: number;
  unit?: string;
  transportDistance?: number;
  transportMode?: string;
  fuelType?: string;
  mkiPerUnit?: number;
  gwpPerUnit?: number;
  phases: PhaseValue[];
  customFields: Record<string, string>;
};

export type Project = {
  id: string;
  name: string;
  customColumns: string[];
  materials: Material[];
};

export type User = {
  id: string;
  email: string;
  password: string;
  verified: boolean;
  verificationToken?: string;
  resetToken?: string;
  settings: {
    language: string;
    organisation?: string;
  };
  projects: Project[];
};

export type Db = {
  users: User[];
  sessionEmail?: string;
};

export type Session = {
  email: string;
  verified: boolean;
};
