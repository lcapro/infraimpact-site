import { api } from './client';
import { MaterialPhases } from '../types';

interface UploadResponse {
  epdId: string;
  indicatorsFound: number;
  phases: MaterialPhases;
}

export const uploadEpd = async (projectId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  form.append('projectId', projectId);
  const { data } = await api.post<UploadResponse>('/epds/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const phases: MaterialPhases = {
    A1: { mki: data.phases.A1?.mki ?? 0, gwp: data.phases.A1?.gwp ?? 0 },
    A2: { mki: data.phases.A2?.mki ?? 0, gwp: data.phases.A2?.gwp ?? 0 },
    A3: { mki: data.phases.A3?.mki ?? 0, gwp: data.phases.A3?.gwp ?? 0 },
    D: { mki: data.phases.D?.mki ?? 0, gwp: data.phases.D?.gwp ?? 0 },
  };
  const filled = Object.values(data.phases).reduce(
    (acc, phase) => (phase && (phase.mki != null || phase.gwp != null) ? acc + 1 : acc),
    0,
  );
  return { ...data, phases, indicatorsFound: filled };
};
