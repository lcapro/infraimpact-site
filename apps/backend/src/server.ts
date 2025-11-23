import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { json } from 'body-parser';
import { router as authRoutes } from './routes/auth';
import { router as projectRoutes } from './routes/projects';
import { router as epdRoutes } from './routes/epds';
import { router as exportRoutes } from './routes/exports';

const app = express();
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/epds', epdRoutes);
app.use('/exports', exportRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
