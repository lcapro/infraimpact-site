import { FormEvent, useEffect, useState } from 'react';
import { Material, PhaseValue } from '../../lib/types';

interface Props {
  onSubmit: (material: Omit<Material, 'id'>) => void;
  customColumns: string[];
  onAddColumn: (name: string) => void;
  parsed?: Partial<Material>;
}

const transportModes = ['Vrachtwagen', 'Schip', 'Trein'];
const fuelTypes = ['Diesel Euro 5', 'Elektrisch', 'HVO'];

export function MaterialForm({ onSubmit, customColumns, onAddColumn, parsed }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number | undefined>();
  const [unit, setUnit] = useState('ton');
  const [supplier, setSupplier] = useState('');
  const [transportDistance, setTransportDistance] = useState<number | undefined>();
  const [transportMode, setTransportMode] = useState('Vrachtwagen');
  const [fuelType, setFuelType] = useState('Diesel Euro 5');
  const [mkiPerUnit, setMkiPerUnit] = useState<number | undefined>();
  const [gwpPerUnit, setGwpPerUnit] = useState<number | undefined>();
  const [phases, setPhases] = useState<PhaseValue[]>([
    { phase: 'A1' },
    { phase: 'A2' },
    { phase: 'A3' },
    { phase: 'D' },
  ]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [newColumn, setNewColumn] = useState('');

  useEffect(() => {
    if (parsed?.mkiPerUnit !== undefined) setMkiPerUnit(parsed.mkiPerUnit);
    if (parsed?.gwpPerUnit !== undefined) setGwpPerUnit(parsed.gwpPerUnit);
    if (parsed?.phases) setPhases(parsed.phases as PhaseValue[]);
  }, [parsed]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      quantity,
      unit,
      supplier,
      transportDistance,
      transportMode,
      fuelType,
      mkiPerUnit,
      gwpPerUnit,
      phases,
      customFields: customValues,
    });
    setName('');
    setQuantity(undefined);
    setSupplier('');
  };

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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Gewapend beton"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Leverancier / herkomst
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Bijv. Heijmans"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Hoeveelheid
          <input
            type="number"
            min={0}
            value={quantity ?? ''}
            onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : undefined)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="0"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Eenheid
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="kg / ton / m2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Transportafstand (km)
          <input
            type="number"
            min={0}
            value={transportDistance ?? ''}
            onChange={(e) => setTransportDistance(e.target.value ? Number(e.target.value) : undefined)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="100"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-slate-700">
            Vervoer
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
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
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
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
            value={mkiPerUnit ?? ''}
            onChange={(e) => setMkiPerUnit(e.target.value ? Number(e.target.value) : undefined)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="€"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          CO₂ (GWP) per eenheid
          <input
            type="number"
            step="0.001"
            value={gwpPerUnit ?? ''}
            onChange={(e) => setGwpPerUnit(e.target.value ? Number(e.target.value) : undefined)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="kg CO₂"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {phases.map((phase, idx) => (
          <label key={phase.phase} className="text-sm font-medium text-slate-700">
            {phase.phase} (MKI)
            <input
              type="number"
              step="0.001"
              value={phase.mki ?? ''}
              onChange={(e) =>
                setPhases((prev) => {
                  const next = [...prev];
                  next[idx] = { ...next[idx], mki: e.target.value ? Number(e.target.value) : undefined };
                  return next;
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        ))}
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between">
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {customColumns.map((column) => (
            <label key={column} className="text-sm font-medium text-slate-700">
              {column}
              <input
                value={customValues[column] ?? ''}
                onChange={(e) => setCustomValues((prev) => ({ ...prev, [column]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          ))}
        </div>
      </div>
    </form>
  );
}
