import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';

const buildToken = (user: { id: string; organizationId: string; role: string }) =>
  jwt.sign(user, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

export const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, name, organizationName } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });

  const hashed = await bcrypt.hash(password, 10);
  const organization = await prisma.organization.create({ data: { name: organizationName || 'Nieuwe organisatie' } });
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashed,
      name,
      organizationId: organization.id,
      role: 'org_admin',
    },
  });
  const token = buildToken({ id: user.id, organizationId: organization.id, role: user.role });
  res.json({ token, user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = buildToken({ id: user.id, organizationId: user.organizationId, role: user.role });
  res.json({ token, user });
});

router.post('/reset', async (req, res) => {
  // placeholder for reset flow
  res.json({ ok: true });
});

router.get('/me', authGuard, async (req: AuthRequest, res) => {
  const user = await prisma.user.findFirst({ where: { id: req.user?.id, organizationId: req.user?.organizationId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    settings: user.settings || {},
  });
});

router.patch('/me', authGuard, async (req: AuthRequest, res) => {
  const { name, settings } = req.body;
  const user = await prisma.user.findFirst({ where: { id: req.user?.id, organizationId: req.user?.organizationId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name || user.name,
      settings: settings ? { ...(user.settings as object), ...settings } : user.settings,
    },
  });
  res.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    organizationId: updated.organizationId,
    settings: updated.settings || {},
  });
});
