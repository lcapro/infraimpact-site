import { Db } from './types';

const DB_KEY = 'lca-project-tool-spa-db';

const defaultDb: Db = {
  users: [],
};

const listeners = new Set<() => void>();

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readDb(): Db {
  if (typeof window === 'undefined') return defaultDb;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return defaultDb;
    return { ...defaultDb, ...JSON.parse(raw) } as Db;
  } catch (err) {
    console.warn('Kon database niet laden', err);
    return defaultDb;
  }
}

export function writeDb(db: Db) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  listeners.forEach((cb) => cb());
}

export function setSession(email?: string) {
  const db = readDb();
  db.sessionEmail = email;
  writeDb(db);
}

export function generateToken(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
