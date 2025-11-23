import { Project } from '../types';

interface MaterialsTableProps {
  project: Project;
  onDelete: (id: string) => void;
}

const calcTotalMki = (quantity: number, phases: Project['materials'][number]['phases']) => {
  const sum = Object.values(phases).reduce((acc, value) => acc + (value.mki || 0), 0);
  return sum * (quantity || 0);
};

const MaterialsTable = ({ project, onDelete }: MaterialsTableProps) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm" id="materialsTable">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="px-3 py-2">Materiaal</th>
            <th className="px-3 py-2">Leverancier</th>
            <th className="px-3 py-2">Hoeveelheid</th>
            <th className="px-3 py-2">Transport</th>
            <th className="px-3 py-2">Aanleg</th>
            <th className="px-3 py-2">A1 MKI / GWP</th>
            <th className="px-3 py-2">A2 MKI / GWP</th>
            <th className="px-3 py-2">A3 MKI / GWP</th>
            <th className="px-3 py-2">D MKI / GWP</th>
            <th className="px-3 py-2">Totaal MKI</th>
            {project.customFields.map((c) => (
              <th key={c.id} className="px-3 py-2">
                {c.label}
              </th>
            ))}
            <th className="px-3 py-2">Opties</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {project.materials.map((entry) => (
            <tr key={entry.id}>
              <td className="px-3 py-2 align-top">{entry.name || '–'}</td>
              <td className="px-3 py-2 align-top">{entry.supplier || '–'}</td>
              <td className="px-3 py-2 align-top">{`${entry.quantity || 0} ${entry.unit || ''}`}</td>
              <td className="px-3 py-2 align-top">{`${entry.distanceKm || 0} km • ${entry.transportMode}`}</td>
              <td className="px-3 py-2 align-top">{entry.installation || 'Diesel'}</td>
              <td className="px-3 py-2 align-top">{`${entry.phases.A1.mki} / ${entry.phases.A1.gwp} kg`}</td>
              <td className="px-3 py-2 align-top">{`${entry.phases.A2.mki} / ${entry.phases.A2.gwp} kg`}</td>
              <td className="px-3 py-2 align-top">{`${entry.phases.A3.mki} / ${entry.phases.A3.gwp} kg`}</td>
              <td className="px-3 py-2 align-top">{`${entry.phases.D.mki} / ${entry.phases.D.gwp} kg`}</td>
              <td className="px-3 py-2 align-top">{calcTotalMki(entry.quantity, entry.phases).toFixed(4)}</td>
              {project.customFields.map((c) => (
                <td key={c.id} className="px-3 py-2 align-top">
                  {entry.customValues?.[c.id] ?? ''}
                </td>
              ))}
              <td className="px-3 py-2">
                <button onClick={() => onDelete(entry.id)} className="text-red-700 hover:underline text-sm">
                  Verwijderen
                </button>
              </td>
            </tr>
          ))}
          {project.materials.length === 0 && (
            <tr>
              <td colSpan={11 + project.customFields.length} className="px-3 py-6 text-center text-gray-600">
                Nog geen materialen toegevoegd.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialsTable;
