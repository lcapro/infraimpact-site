import { Material, Project } from './types';

export function calculateMaterialTotals(material: Material) {
  const mki = (material.mkiPerUnit ?? 0) * (material.quantity ?? 0);
  const gwp = (material.gwpPerUnit ?? 0) * (material.quantity ?? 0);
  return { mki, gwp };
}

export function calculateProjectTotals(project?: Project) {
  if (!project) {
    return { mki: 0, gwp: 0 };
  }
  return project.materials.reduce(
    (acc, material) => {
      const totals = calculateMaterialTotals(material);
      return { mki: acc.mki + totals.mki, gwp: acc.gwp + totals.gwp };
    },
    { mki: 0, gwp: 0 }
  );
}
