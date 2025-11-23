import { useSyncExternalStore, useMemo } from 'react';
import { Db, Session, User } from './types';
import { generateToken, readDb, setSession, subscribe, writeDb } from './db';

type Snapshot = {
  session: Session | null;
  users: User[];
};

function hydrate(): Snapshot {
  const db = readDb();
  const sessionUser = db.sessionEmail ? db.users.find((u) => u.email === db.sessionEmail) : undefined;
  return {
    session: sessionUser ? { email: sessionUser.email, verified: sessionUser.verified } : null,
    users: db.users,
  };
}

function upsertUser(next: (user: User) => User, matcher: (user: User) => boolean) {
  const db = readDb();
  db.users = db.users.map((user) => (matcher(user) ? next(user) : user));
  writeDb(db);
}

function addUser(user: User) {
  const db = readDb();
  db.users.push(user);
  writeDb(db);
}

export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, hydrate, hydrate);

  const actions = useMemo(() => ({
    register: (email: string, password: string) => {
      const existing = readDb().users.find((u) => u.email === email);
      if (existing) {
        throw new Error('Er bestaat al een account met dit e-mailadres.');
      }
      const verificationToken = generateToken('verify');
      addUser({
        id: crypto.randomUUID(),
        email,
        password,
        verified: false,
        verificationToken,
        settings: { language: 'nl' },
        projects: [],
      });
      setSession(email);
      return verificationToken;
    },
    login: (email: string, password: string) => {
      const db = readDb();
      const user = db.users.find((u) => u.email === email && u.password === password);
      if (!user) throw new Error('Onjuist e-mailadres of wachtwoord.');
      setSession(user.email);
      return user.verified;
    },
    logout: () => setSession(undefined),
    resendVerification: (email: string) => {
      const db = readDb();
      const user = db.users.find((u) => u.email === email);
      if (!user) throw new Error('Geen gebruiker gevonden.');
      const verificationToken = generateToken('verify');
      upsertUser((u) => ({ ...u, verificationToken }), (u) => u.email === email);
      return verificationToken;
    },
    verifyEmail: (token: string) => {
      const db = readDb();
      const user = db.users.find((u) => u.verificationToken === token);
      if (!user) throw new Error('Verificatielink ongeldig.');
      upsertUser(
        (u) => ({ ...u, verificationToken: undefined, verified: true }),
        (u) => u.id === user.id
      );
      setSession(user.email);
      return true;
    },
    requestReset: (email: string) => {
      const db = readDb();
      const user = db.users.find((u) => u.email === email);
      if (!user) throw new Error('Geen gebruiker gevonden.');
      const resetToken = generateToken('reset');
      upsertUser((u) => ({ ...u, resetToken }), (u) => u.id === user.id);
      return resetToken;
    },
    resetPassword: (token: string, password: string) => {
      const db = readDb();
      const user = db.users.find((u) => u.resetToken === token);
      if (!user) throw new Error('Ongeldige resetlink.');
      upsertUser(
        (u) => ({ ...u, password, resetToken: undefined }),
        (u) => u.id === user.id
      );
      setSession(user.email);
    },
  }), []);

  return { ...snapshot, bootstrap: true, ...actions } as const;
}
