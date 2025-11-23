import { Router } from 'express';
import { authGuard, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

export const router = Router();
router.use(authGuard);

router.get('/', async (req: AuthRequest, res) => {
  const projects = await prisma.project.findMany({ where: { organizationId: req.user?.organizationId } });
  res.json(projects);
});

router.post('/', async (req: AuthRequest, res) => {
  const { name, description } = req.body;
  const project = await prisma.project.create({
    data: {
      name,
      description,
      organizationId: req.user!.organizationId,
      ownerId: req.user!.id,
    },
  });
  res.status(201).json(project);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, organizationId: req.user?.organizationId },
    include: { materials: true, customFields: true },
  });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

router.post('/:id/materials', async (req: AuthRequest, res) => {
  const project = await prisma.project.findFirst({ where: { id: req.params.id, organizationId: req.user?.organizationId } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const material = await prisma.projectMaterial.create({
    data: {
      projectId: project.id,
      name: req.body.name,
      supplier: req.body.supplier,
      quantity: req.body.quantity,
      unit: req.body.unit,
      distanceKm: req.body.distanceKm,
      transportMode: req.body.transportMode,
      transportFuel: req.body.transportFuel,
      installation: req.body.installation,
      phaseA1Mki: req.body.phaseA1Mki,
      phaseA1Gwp: req.body.phaseA1Gwp,
      phaseA2Mki: req.body.phaseA2Mki,
      phaseA2Gwp: req.body.phaseA2Gwp,
      phaseA3Mki: req.body.phaseA3Mki,
      phaseA3Gwp: req.body.phaseA3Gwp,
      phaseDMki: req.body.phaseDMki,
      phaseDGwp: req.body.phaseDGwp,
    },
  });
  res.status(201).json(material);
});

router.delete('/materials/:materialId', async (req: AuthRequest, res) => {
  await prisma.projectMaterial.delete({ where: { id: req.params.materialId } });
  res.status(204).send();
});

router.post('/:id/custom-fields', async (req: AuthRequest, res) => {
  const field = await prisma.projectCustomField.create({
    data: { projectId: req.params.id, label: req.body.label, type: req.body.type },
  });
  res.status(201).json(field);
});

router.delete('/custom-fields/:fieldId', async (req: AuthRequest, res) => {
  await prisma.projectCustomField.delete({ where: { id: req.params.fieldId } });
  res.status(204).send();
});

router.get('/:id/summary', async (req: AuthRequest, res) => {
  const materials = await prisma.projectMaterial.findMany({ where: { projectId: req.params.id } });
  const totals = materials.reduce(
    (acc, m) => {
      acc.A1 += m.phaseA1Mki * m.quantity;
      acc.A2 += m.phaseA2Mki * m.quantity;
      acc.A3 += m.phaseA3Mki * m.quantity;
      acc.D += m.phaseDMki * m.quantity;
      return acc;
    },
    { A1: 0, A2: 0, A3: 0, D: 0 },
  );
  res.json({ materialsCount: materials.length, totals });
});
