import { Material } from '../../lib/types';

interface Props {
  materials: Material[];
  customColumns: string[];
  onRemove: (id: string) => void;
}

export function MaterialsTable({ materials, customColumns, onRemove }: Props) {
  const totalMki = materials.reduce((sum, m) => sum + (m.mkiPerUnit ?? 0) * (m.quantity ?? 0), 0);
  const totalGwp = materials.reduce((sum, m) => sum + (m.gwpPerUnit ?? 0) * (m.quantity ?? 0), 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Registraties</p>
          <p className="text-lg font-semibold text-slate-900">Materialen</p>
        </div>
        <div className="text-right text-sm text-slate-600">
          <p>Totaal MKI: <span className="font-semibold text-brand-700">€ {totalMki.toFixed(2)}</span></p>
          <p>Totaal CO₂: <span className="font-semibold text-brand-700">{totalGwp.toFixed(2)} kg</span></p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Materiaal</th>
              <th className="px-4 py-3">Leverancier</th>
              <th className="px-4 py-3">Hoeveelheid</th>
              <th className="px-4 py-3">MKI/eenh.</th>
              <th className="px-4 py-3">CO₂/eenh.</th>
              <th className="px-4 py-3">Totaal MKI</th>
              <th className="px-4 py-3">Totaal CO₂</th>
              {customColumns.map((col) => (
                <th key={col} className="px-4 py-3">{col}</th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.length === 0 && (
              <tr>
                <td colSpan={7 + customColumns.length} className="px-4 py-6 text-center text-slate-500">
                  Nog geen materialen toegevoegd.
                </td>
              </tr>
            )}
            {materials.map((material) => {
              const totalMaterialMki = (material.mkiPerUnit ?? 0) * (material.quantity ?? 0);
              const totalMaterialGwp = (material.gwpPerUnit ?? 0) * (material.quantity ?? 0);
              return (
                <tr key={material.id} className="hover:bg-brand-50/30">
                  <td className="px-4 py-3 font-semibold text-slate-900">{material.name}</td>
                  <td className="px-4 py-3 text-slate-600">{material.supplier || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {material.quantity ?? '—'} {material.unit ?? ''}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{material.mkiPerUnit ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{material.gwpPerUnit ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">€ {totalMaterialMki.toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{totalMaterialGwp.toFixed(2)} kg</td>
                  {customColumns.map((col) => (
                    <td key={col} className="px-4 py-3 text-slate-600">
                      {material.customFields[col] ?? '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onRemove(material.id)}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
