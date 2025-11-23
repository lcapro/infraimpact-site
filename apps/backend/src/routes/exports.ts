import { Router } from 'express';
import ExcelJS from 'exceljs';
import puppeteer from 'puppeteer';
import { prisma } from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';

export const router = Router();
router.use(authGuard);

router.get('/projects/:id/export.xlsx', async (req: AuthRequest, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, organizationId: req.user?.organizationId },
    include: { materials: true },
  });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('MKI tender');
  sheet.addRow(['Project', project.name]);
  sheet.addRow(['Beschrijving', project.description || '' ]);
  sheet.addRow([]);
  sheet.addRow(['Materiaal', 'Hoeveelheid', 'A1 MKI', 'A2 MKI', 'A3 MKI', 'D MKI', 'Totaal MKI']);
  project.materials.forEach((m) => {
    const total = (m.phaseA1Mki + m.phaseA2Mki + m.phaseA3Mki + m.phaseDMki) * m.quantity;
    sheet.addRow([m.name, `${m.quantity} ${m.unit}`, m.phaseA1Mki, m.phaseA2Mki, m.phaseA3Mki, m.phaseDMki, total]);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=project-${project.id}.xlsx`);
  res.send(buffer);
});

router.get('/projects/:id/report.pdf', async (req: AuthRequest, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, organizationId: req.user?.organizationId },
    include: { materials: true },
  });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(`
    <html><body>
      <h1>InfraImpact - LCA rapport</h1>
      <p>Project: ${project.name}</p>
      <p>${project.description || ''}</p>
      <table border="1" cellpadding="4" cellspacing="0">
        <tr><th>Materiaal</th><th>Qty</th><th>A1</th><th>A2</th><th>A3</th><th>D</th></tr>
        ${project.materials
          .map(
            (m) => `<tr><td>${m.name}</td><td>${m.quantity} ${m.unit}</td><td>${m.phaseA1Mki}</td><td>${m.phaseA2Mki}</td><td>${m.phaseA3Mki}</td><td>${m.phaseDMki}</td></tr>`,
          )
          .join('')}
      </table>
    </body></html>`);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=project-${project.id}.pdf`);
  res.send(pdf);
});
