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
  const buffer = fs.readFileSync(req.file!.path);
  const parsed = await pdf(buffer);
  const text = parsed.text;
  const indicators = ['MKI', 'ECI', 'GWP'];
  const counts = indicators.reduce((acc, key) => acc + (text.includes(key) ? 1 : 0), 0);

  const record = await prisma.epdDocument.create({
    data: {
      projectId: req.body.projectId,
      uploaderId: req.user!.id,
      filePath: req.file!.path,
      parsedJson: { indicatorsFound: counts },
    },
  });
  res.json({ epdId: record.id, indicatorsFound: counts });
});
