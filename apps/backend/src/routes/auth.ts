import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

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
  const token = jwt.sign({ id: user.id, organizationId: organization.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1h',
  });
  res.json({ token, user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, organizationId: user.organizationId, role: user.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1h',
  });
  res.json({ token });
});

router.post('/reset', async (req, res) => {
  // placeholder for reset flow
  res.json({ ok: true });
});
