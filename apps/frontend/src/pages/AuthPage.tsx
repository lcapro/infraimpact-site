import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthHero from '../sections/AuthHero';
import Mailbox from '../sections/Mailbox';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage = ({ mode }: AuthPageProps) => {
  const [message, setMessage] = useState<string>('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('Demo: wire dit formulier aan de backend auth endpoints.');
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <AuthHero />
      <section className="card p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold">{mode === 'register' ? 'Registreren' : 'Inloggen'}</h2>
            <p className="text-sm text-gray-600">
              Beveiligde toegang met e-mailverificatie en herstel voor wachtwoordbeheer.
            </p>
          </div>
          <div className="text-sm font-semibold text-brand-green">{message}</div>
        </div>

        <form className="grid md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <h3 className="font-semibold">{mode === 'register' ? 'Nieuw account' : 'Aanmelden'}</h3>
            <p className="text-sm text-gray-600">
              {mode === 'register'
                ? 'Registratie op e-mailbasis. Verifieer via de ontvangen link voor volledige toegang.'
                : 'Log in met een geverifieerd account om je persoonlijke omgeving te openen.'}
            </p>
            <div className="grid gap-3">
              {mode === 'register' && (
                <label className="space-y-1">
                  <span className="grid-label">Naam</span>
                  <input
                    type="text"
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="Voor- en achternaam"
                    required
                  />
                </label>
              )}
              <label className="space-y-1">
                <span className="grid-label">E-mail</span>
                <input
                  type="email"
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="naam@bedrijf.nl"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="grid-label">Wachtwoord</span>
                <input
                  type="password"
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Minimaal 8 tekens"
                  required
                />
              </label>
              <button className="inline-flex justify-center px-4 py-2 rounded-xl bg-brand-green text-white font-semibold hover:bg-green-500">
                {mode === 'register' ? 'Account aanmaken' : 'Inloggen'}
              </button>
              {mode === 'login' ? (
                <div className="text-sm text-gray-600">
                  Nog geen account?{' '}
                  <Link to="/register" className="text-brand-green font-semibold hover:underline">
                    Registreer hier.
                  </Link>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Heb je al een account?{' '}
                  <Link to="/login" className="text-brand-green font-semibold hover:underline">
                    Log hier in.
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Wachtwoordbeheer</h3>
            <p className="text-sm text-gray-600">
              Demo van herstel- en verificatiestromen. Deze pagina koppelt straks met de backend mailer.
            </p>
            <div className="grid gap-3">
              <label className="space-y-1">
                <span className="grid-label">E-mail</span>
                <input type="email" className="w-full border rounded-xl px-3 py-2" placeholder="naam@bedrijf.nl" />
              </label>
              <div className="flex gap-3 items-center">
                <button className="inline-flex justify-center px-4 py-2 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-600" type="button">
                  Verstuur herstel-link
                </button>
                <button className="inline-flex justify-center px-4 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300" type="button">
                  Verificatiemail opnieuw versturen
                </button>
              </div>
              <p className="text-xs text-gray-500">Mails verschijnen in de demobox hieronder.</p>
            </div>
          </div>
        </form>

        <div className="border-t pt-4 grid md:grid-cols-3 gap-6">
          <div className="space-y-3 md:col-span-1">
            <h3 className="font-semibold">Demo mailbox</h3>
            <p className="text-sm text-gray-600">
              Verificatie- en herstelmails verschijnen hieronder zodat je ze direct kunt openen.
            </p>
          </div>
          <div className="md:col-span-2">
            <Mailbox />
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
