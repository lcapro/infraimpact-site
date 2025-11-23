import { useEffect, useMemo, useState } from 'react';
import { CreateMaterialInput } from '../api/projects';
import { CustomField, MaterialPhases, PhaseKey } from '../types';

interface MaterialFormProps {
  customFields: CustomField[];
  onAddMaterial: (material: CreateMaterialInput) => void;
  onAddColumn: (label: string, type: 'text' | 'number') => void;
  message?: string;
  prefillPhases?: MaterialPhases;
}

const emptyPhases: MaterialPhases = {
  A1: { mki: 0, gwp: 0 },
  A2: { mki: 0, gwp: 0 },
  A3: { mki: 0, gwp: 0 },
  D: { mki: 0, gwp: 0 },
};

const MaterialForm = ({ customFields, onAddMaterial, onAddColumn, message, prefillPhases }: MaterialFormProps) => {
  const [form, setForm] = useState({
    name: '',
    supplier: '',
    quantity: 0,
    unit: '',
    distanceKm: 0,
    transportMode: 'Vrachtwagen - Diesel Euro 5',
    transportFuel: 'Diesel Euro 5',
    installation: 'Diesel',
  });
  const [phases, setPhases] = useState<MaterialPhases>(emptyPhases);
  const [customLabel, setCustomLabel] = useState('');
  const [customType, setCustomType] = useState<'text' | 'number'>('text');
  const [customValues, setCustomValues] = useState<Record<string, string | number>>({});

  useEffect(() => {
    if (prefillPhases) {
      setPhases((prev) => ({
        A1: prefillPhases.A1 || prev.A1,
        A2: prefillPhases.A2 || prev.A2,
        A3: prefillPhases.A3 || prev.A3,
        D: prefillPhases.D || prev.D,
      }));
    }
  }, [prefillPhases]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMaterial({
      ...form,
      phases,
      customValues,
    });
    setForm({
      name: '',
      supplier: '',
      quantity: 0,
      unit: '',
      distanceKm: 0,
      transportMode: 'Vrachtwagen - Diesel Euro 5',
      transportFuel: 'Diesel Euro 5',
      installation: 'Diesel',
    });
    setPhases(emptyPhases);
    setCustomValues({});
  };

  const updatePhase = (phase: PhaseKey, field: 'mki' | 'gwp', value: number) => {
    setPhases((prev) => ({ ...prev, [phase]: { ...prev[phase], [field]: value } }));
  };

  const customFieldsSorted = useMemo(() => customFields, [customFields]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h4 className="font-semibold">Product toevoegen aan project</h4>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="grid-label">Materiaal</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            type="text"
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Asfalt AC 16"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="grid-label">Leverancier (herkomst)</span>
          <input
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            type="text"
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Leverancier"
          />
        </label>
        <label className="space-y-1">
          <span className="grid-label">Hoeveelheid</span>
          <input
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            type="number"
            min="0"
            step="0.01"
            className="w-full border rounded-xl px-3 py-2"
            placeholder="0"
          />
        </label>
        <label className="space-y-1">
          <span className="grid-label">Eenheid</span>
          <input
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            type="text"
            className="w-full border rounded-xl px-3 py-2"
            placeholder="ton, m3, m2"
          />
        </label>
        <label className="space-y-1">
          <span className="grid-label">Transportafstand (km)</span>
          <input
            value={form.distanceKm}
            onChange={(e) => setForm({ ...form, distanceKm: Number(e.target.value) })}
            type="number"
            min="0"
            step="0.1"
            className="w-full border rounded-xl px-3 py-2"
            placeholder="0"
          />
        </label>
        <label className="space-y-1">
          <span className="grid-label">Vervoersmiddel</span>
          <select
            value={form.transportMode}
            onChange={(e) => setForm({ ...form, transportMode: e.target.value })}
            className="w-full border rounded-xl px-3 py-2"
          >
            <option>Vrachtwagen - Diesel Euro 5</option>
            <option>Vrachtwagen - Elektrisch</option>
            <option>Vrachtschip - Diesel</option>
            <option>Trein - Elektrisch</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="grid-label">Brandstof transport</span>
          <input
            value={form.transportFuel}
            onChange={(e) => setForm({ ...form, transportFuel: e.target.value })}
            type="text"
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Diesel Euro 5"
          />
        </label>
        <label className="space-y-1">
          <span className="grid-label">Brandstof aanleg</span>
          <input
            value={form.installation}
            onChange={(e) => setForm({ ...form, installation: e.target.value })}
            type="text"
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Diesel"
          />
        </label>
        <div className="col-span-2 grid grid-cols-2 gap-3 bg-gray-50 border rounded-xl p-3">
          <div className="font-semibold col-span-2">Fasewaarden (MKI / CO₂) per eenheid</div>
          {(['A1', 'A2', 'A3', 'D'] as PhaseKey[]).map((phase) => (
            <label className="space-y-1" key={phase}>
              <span className="grid-label">{phase}</span>
              <div className="flex gap-2">
                <input
                  value={phases[phase].mki}
                  onChange={(e) => updatePhase(phase, 'mki', Number(e.target.value))}
                  type="number"
                  step="0.0001"
                  className="w-1/2 border rounded-xl px-3 py-2"
                  placeholder="MKI"
                />
                <input
                  value={phases[phase].gwp}
                  onChange={(e) => updatePhase(phase, 'gwp', Number(e.target.value))}
                  type="number"
                  step="0.0001"
                  className="w-1/2 border rounded-xl px-3 py-2"
                  placeholder="CO2"
                />
              </div>
            </label>
          ))}
        </div>

        <div className="col-span-2 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h5 className="font-semibold">Eigen kolommen per project</h5>
            <div className="text-xs text-gray-500">Worden als velden in het formulier en in de tabel getoond.</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              type="text"
              className="border rounded-xl px-3 py-2 text-sm"
              placeholder="Kolomnaam"
            />
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as 'text' | 'number')}
              className="border rounded-xl px-3 py-2 text-sm"
            >
              <option value="text">Tekst</option>
              <option value="number">Getal</option>
            </select>
            <button
              type="button"
              onClick={() => {
                if (!customLabel) return;
                onAddColumn(customLabel, customType);
                setCustomLabel('');
              }}
              className="px-3 py-2 rounded-xl bg-blue-700 text-white text-sm hover:bg-blue-600"
            >
              Kolom toevoegen
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {customFieldsSorted.map((c) => (
              <label className="space-y-1" key={c.id}>
                <span className="grid-label">{c.label}</span>
                <input
                  className="w-full border rounded-xl px-3 py-2"
                  type={c.type === 'number' ? 'number' : 'text'}
                  value={customValues[c.id] ?? ''}
                  onChange={(e) =>
                    setCustomValues((prev) => ({ ...prev, [c.id]: c.type === 'number' ? Number(e.target.value) : e.target.value }))
                  }
                />
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="col-span-2 inline-flex justify-center px-4 py-2 rounded-xl bg-brand-green text-white font-semibold hover:bg-green-500"
        >
          Product opslaan in project
        </button>
        <div className="text-sm font-semibold col-span-2 text-brand-green">{message}</div>
      </div>
    </form>
  );
};

export default MaterialForm;
