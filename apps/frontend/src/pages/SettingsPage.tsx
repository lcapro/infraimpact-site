import AuthHero from '../sections/AuthHero';

const SettingsPage = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <AuthHero />
      <section className="card p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold">Persoonlijke instellingen</h2>
            <p className="text-sm text-gray-600">Koppelt aan backend settings endpoint en rolbeheer.</p>
          </div>
          <span className="text-sm text-brand-green font-semibold">Demo modus</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="grid-label">Naam</span>
            <input className="w-full border rounded-xl px-3 py-2" placeholder="Voor- en achternaam" />
          </label>
          <label className="space-y-1">
            <span className="grid-label">E-mail</span>
            <input className="w-full border rounded-xl px-3 py-2" placeholder="naam@bedrijf.nl" />
          </label>
          <label className="space-y-1">
            <span className="grid-label">Functie / rol</span>
            <input className="w-full border rounded-xl px-3 py-2" placeholder="Werkvoorbereider, aannemer..." />
          </label>
          <label className="space-y-1">
            <span className="grid-label">Voorkeurseenheid</span>
            <input className="w-full border rounded-xl px-3 py-2" placeholder="ton, m3, m2" />
          </label>
        </div>
        <button className="inline-flex justify-center px-4 py-2 rounded-xl bg-brand-green text-white font-semibold hover:bg-green-500">
          Instellingen opslaan
        </button>
      </section>
    </main>
  );
};

export default SettingsPage;
