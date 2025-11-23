import { Router } from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { prisma } from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';

const upload = multer({ dest: path.join(process.cwd(), 'uploads') });
export const router = Router();
router.use(authGuard);

router.post('/upload', upload.single('file'), async (req: AuthRequest, res) => {
  const project = await prisma.project.findFirst({ where: { id: req.body.projectId, organizationId: req.user?.organizationId } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const buffer = fs.readFileSync(req.file!.path);
  const parsed = await pdf(buffer);
  const text = parsed.text;
  const indicators = ['MKI', 'ECI', 'GWP'];
  const counts = indicators.reduce((acc, key) => acc + (text.includes(key) ? 1 : 0), 0);

  const phaseLabels = ['A1', 'A2', 'A3', 'D'] as const;
  const phases: Record<(typeof phaseLabels)[number], { mki: number | null; gwp: number | null }> = {
    A1: { mki: null, gwp: null },
    A2: { mki: null, gwp: null },
    A3: { mki: null, gwp: null },
    D: { mki: null, gwp: null },
  };

  // Basic regex-based extraction (TODO: improve robustness with structured PDF parsing)
  phaseLabels.forEach((phase) => {
    const mkiMatch = text.match(new RegExp(`${phase}[^\n]{0,80}?((?:MKI|ECI))[^\d-]*([-+]?[\d.,]+)`, 'i'));
    const gwpMatch = text.match(new RegExp(`${phase}[^\n]{0,80}?(GWP)[^\d-]*([-+]?[\d.,]+)`, 'i'));
    if (mkiMatch) phases[phase].mki = parseFloat(mkiMatch[2].replace(',', '.'));
    if (gwpMatch) phases[phase].gwp = parseFloat(gwpMatch[2].replace(',', '.'));
  });

  const record = await prisma.epdDocument.create({
    data: {
      projectId: project.id,
      uploaderId: req.user!.id,
      filePath: req.file!.path,
      parsedJson: { indicatorsFound: counts, phases },
    },
  });

  res.json({
    epdId: record.id,
    indicatorsFound: counts,
    phases,
  });
});
