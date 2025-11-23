import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PhaseInputs } from './PhaseInputs';
import { Material, PhaseValue } from '../../lib/types';

interface Props {
  onSubmit: (material: Omit<Material, 'id'>) => void;
  customColumns: string[];
  onAddColumn: (name: string) => void;
  parsed?: Partial<Material>;
}

const transportModes = ['Vrachtwagen', 'Schip', 'Trein'];
const fuelTypes = ['Diesel Euro 5', 'Elektrisch', 'HVO'];

const basePhases: PhaseValue[] = [
  { phase: 'A1' },
  { phase: 'A2' },
  { phase: 'A3' },
  { phase: 'D' },
];

export function MaterialForm({ onSubmit, customColumns, onAddColumn, parsed }: Props) {
  const [form, setForm] = useState<Omit<Material, 'id'>>({
    name: '',
    supplier: '',
    quantity: undefined,
    unit: 'ton',
    transportDistance: undefined,
    transportMode: 'Vrachtwagen',
    fuelType: 'Diesel Euro 5',
    mkiPerUnit: undefined,
    gwpPerUnit: undefined,
    phases: [...basePhases],
    customFields: {},
  });
  const [newColumn, setNewColumn] = useState('');

  useEffect(() => {
    if (!parsed) return;
    setForm((prev) => ({
      ...prev,
      mkiPerUnit: parsed.mkiPerUnit ?? prev.mkiPerUnit,
      gwpPerUnit: parsed.gwpPerUnit ?? prev.gwpPerUnit,
      phases: parsed.phases ? (parsed.phases as PhaseValue[]) : prev.phases,
    }));
  }, [parsed]);

  const handleChange = (key: keyof Omit<Material, 'id' | 'phases' | 'customFields'>, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const phaseChange = (index: number, value: Partial<PhaseValue>) => {
    setForm((prev) => {
      const next = [...prev.phases];
      next[index] = { ...next[index], ...value };
      return { ...prev, phases: next };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm((prev) => ({ ...prev, name: '', supplier: '', quantity: undefined }));
  };

  const hasCustomColumns = useMemo(() => customColumns.length > 0, [customColumns.length]);

  return (
    <form className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Materiaal</p>
          <p className="text-lg font-semibold text-slate-900">Toevoegen</p>
        </div>
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
        >
          Opslaan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Materiaalnaam
          <input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Gewapend beton"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Leverancier / herkomst
          <input
            value={form.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Bijv. Heijmans"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Hoeveelheid
          <input
            type="number"
            min={0}
            value={form.quantity ?? ''}
            onChange={(e) => handleChange('quantity', e.target.value ? Number(e.target.value) : undefined)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="0"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Eenheid
          <input
            value={form.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="kg / ton / m2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Transportafstand (km)
          <input
            type="number"
            min={0}
            value={form.transportDistance ?? ''}
            onChange={(e) => handleChange('transportDistance', e.target.value ? Number(e.target.value) : undefined)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="100"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-slate-700">
            Vervoer
            <select
              value={form.transportMode}
              onChange={(e) => handleChange('transportMode', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              {transportModes.map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Brandstof
            <select
              value={form.fuelType}
              onChange={(e) => handleChange('fuelType', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              {fuelTypes.map((fuel) => (
                <option key={fuel}>{fuel}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          MKI / ECI per eenheid
          <input
            type="number"
            step="0.001"
            value={form.mkiPerUnit ?? ''}
            onChange={(e) => handleChange('mkiPerUnit', e.target.value ? Number(e.target.value) : undefined)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="€"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          CO₂ (GWP) per eenheid
          <input
            type="number"
            step="0.001"
            value={form.gwpPerUnit ?? ''}
            onChange={(e) => handleChange('gwpPerUnit', e.target.value ? Number(e.target.value) : undefined)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="kg CO₂"
          />
        </label>
      </div>

      <PhaseInputs phases={form.phases} onChange={phaseChange} />

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-800">Eigen kolommen</p>
          <div className="flex gap-2">
            <input
              value={newColumn}
              onChange={(e) => setNewColumn(e.target.value)}
              placeholder="Bijv. CE-markering"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (!newColumn.trim()) return;
                onAddColumn(newColumn.trim());
                setNewColumn('');
              }}
              className="rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700"
            >
              Kolom toevoegen
            </button>
          </div>
        </div>
        {hasCustomColumns && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {customColumns.map((column) => (
              <label key={column} className="text-sm font-medium text-slate-700">
                {column}
                <input
                  value={form.customFields[column] ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customFields: { ...prev.customFields, [column]: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
