import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none"
      />
    </label>
  );
}

export function AuthPage() {
  const { register, login, resendVerification, verifyEmail, requestReset, resetPassword, session } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'reset' | 'complete-reset' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [demoMailbox, setDemoMailbox] = useState<string[]>([]);

  const heading = useMemo(() => {
    switch (mode) {
      case 'register':
        return 'Account registreren';
      case 'reset':
      case 'complete-reset':
        return 'Wachtwoord resetten';
      case 'verify':
        return 'E-mail verifiëren';
      default:
        return 'Aanmelden';
    }
  }, [mode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (mode === 'register') {
        const verificationToken = register(email.trim(), password);
        setDemoMailbox((prev) => [
          `Verificatie voor ${email}: https://infraimpact.localhost/verify/${verificationToken}`,
          ...prev,
        ]);
        setMessage('We stuurden een verificatielink naar je mailbox.');
        setMode('verify');
      } else if (mode === 'login') {
        const verified = login(email.trim(), password);
        if (verified) {
          navigate('/workspace');
        } else {
          setMessage('Account nog niet geverifieerd. Check je mail of vraag een nieuwe link aan.');
          setMode('verify');
        }
      } else if (mode === 'verify') {
        verifyEmail(token.trim());
        setMessage('E-mail geverifieerd, je hebt toegang tot de workspace.');
        navigate('/workspace');
      } else if (mode === 'reset') {
        const resetToken = requestReset(email.trim());
        setDemoMailbox((prev) => [
          `Reset voor ${email}: https://infraimpact.localhost/reset/${resetToken}`,
          ...prev,
        ]);
        setMessage('We stuurden een resetlink naar je mailbox.');
        setMode('complete-reset');
      } else if (mode === 'complete-reset') {
        if (password !== confirm) throw new Error('Wachtwoorden komen niet overeen.');
        resetPassword(token.trim(), password);
        setMessage('Nieuw wachtwoord ingesteld.');
        navigate('/workspace');
      }
    } catch (err: any) {
      setError(err.message ?? 'Onbekende fout');
    }
  };

  const handleResend = () => {
    try {
      const verificationToken = resendVerification(email.trim());
      setDemoMailbox((prev) => [
        `Nieuwe verificatie voor ${email}: https://infraimpact.localhost/verify/${verificationToken}`,
        ...prev,
      ]);
      setMessage('Nieuwe verificatielink verstuurd.');
    } catch (err: any) {
      setError(err.message ?? 'Onbekende fout');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      <div className="space-y-6 border-r border-slate-100 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Inloggen & registreren</p>
        <h1 className="text-3xl font-bold text-slate-900">{heading}</h1>
        <p className="text-slate-600">
          SaaS-ready authenticatie voor infra teams: e-mailverificatie, reset-links en sessiebeheer via localStorage.
        </p>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Demo-mailbox</p>
          <p className="text-slate-600">Geautomatiseerde mails komen hier binnen zodat je flow direct te testen is.</p>
          <ul className="space-y-2">
            {demoMailbox.length === 0 && <li className="text-slate-500">Nog geen mails ontvangen.</li>}
            {demoMailbox.map((item, idx) => (
              <li key={idx} className="rounded bg-white px-3 py-2 text-slate-800 shadow-sm ring-1 ring-slate-200">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-4 flex gap-3 text-sm font-semibold text-slate-600">
          {['login', 'register', 'reset'].map((key) => (
            <button
              key={key}
              onClick={() => setMode(key as any)}
              className={`rounded-full px-4 py-2 ${mode === key ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}`}
            >
              {key === 'login' ? 'Inloggen' : key === 'register' ? 'Registreren' : 'Wachtwoord resetten'}
            </button>
          ))}
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode !== 'complete-reset' && mode !== 'verify' && (
            <Input
              label="E-mailadres"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voornaam@bedrijf.nl"
            />
          )}

          {(mode === 'register' || mode === 'login' || mode === 'complete-reset') && (
            <Input
              label={mode === 'complete-reset' ? 'Nieuw wachtwoord' : 'Wachtwoord'}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          )}

          {mode === 'register' && (
            <p className="text-xs text-slate-500">E-mailverificatie is verplicht voordat je de workspace kunt openen.</p>
          )}

          {mode === 'verify' && (
            <Input
              label="Verificatietoken"
              value={token}
              required
              onChange={(e) => setToken(e.target.value)}
              placeholder="bijv. verify-abcd1234"
            />
          )}

          {mode === 'complete-reset' && (
            <>
              <Input
                label="Reset token"
                value={token}
                required
                onChange={(e) => setToken(e.target.value)}
                placeholder="reset-..."
              />
              <Input
                label="Wachtwoord (nogmaals)"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </>
          )}

          {mode === 'reset' && (
            <p className="text-xs text-slate-500">We sturen je een link om een nieuw wachtwoord in te stellen.</p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}

          <div className="flex items-center justify-between text-sm text-slate-600">
            {mode !== 'verify' && (
              <button type="button" onClick={handleResend} className="text-brand-700 hover:underline">
                Nieuwe verificatie-link
              </button>
            )}
            {mode !== 'reset' && (
              <button type="button" onClick={() => setMode('reset')} className="text-brand-700 hover:underline">
                Wachtwoord vergeten?
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-white shadow-md transition hover:bg-brand-700"
          >
            {mode === 'login'
              ? 'Inloggen'
              : mode === 'register'
              ? 'Registreren'
              : mode === 'verify'
              ? 'Verifiëren'
              : 'Opslaan'}
          </button>
        </form>

        {session?.verified && (
          <button
            onClick={() => navigate('/workspace')}
            className="mt-6 w-full rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-brand-700"
          >
            Ga naar workspace
          </button>
        )}
      </div>
    </div>
  );
}
