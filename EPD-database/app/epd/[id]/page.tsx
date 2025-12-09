interface EpdPageProps {
  params: { id: string };
}

const sets = ['SBK_SET_1', 'SBK_SET_2', 'UNKNOWN'] as const;
const stages = ['A1', 'A2', 'A3', 'A1_A3', 'D'] as const;

const fetchEpd = async (id: string) => {
  const res = await fetch(`/api/epd/${id}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Kan EPD niet laden');
  return res.json();
};

export default async function EpdDetailPage({ params }: EpdPageProps) {
  const { epd, impacts } = await fetchEpd(params.id);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'epd-pdfs';

  const findImpact = (set: string, indicator: 'MKI' | 'CO2', stage: string) =>
    impacts.find((i: any) => i.set_type === set && i.indicator === indicator && i.stage === stage)?.value ?? '-';

  return (
    <div className="space-y-4">
      <div className="flex-between">
        <div>
          <h2 className="text-lg font-semibold">{epd.product_name}</h2>
          <p className="text-sm text-slate-600">{epd.producer_name ?? 'Onbekende producent'}</p>
        </div>
      </div>

      <div className="card grid-two">
        <div>
          <p className="text-sm text-slate-500">Functionele eenheid</p>
          <strong>{epd.functional_unit}</strong>
        </div>
        <div>
          <p className="text-sm text-slate-500">LCA-methode</p>
          <strong>{epd.lca_method ?? '-'}</strong>
        </div>
        <div>
          <p className="text-sm text-slate-500">PCR versie</p>
          <strong>{epd.pcr_version ?? '-'}</strong>
        </div>
        <div>
          <p className="text-sm text-slate-500">Database</p>
          <strong>{epd.database_name ?? '-'}</strong>
        </div>
        <div>
          <p className="text-sm text-slate-500">Publicatie</p>
          <strong>{epd.publication_date ?? '-'}</strong>
        </div>
        <div>
          <p className="text-sm text-slate-500">Einde geldigheid</p>
          <strong>{epd.expiration_date ?? '-'}</strong>
        </div>
        <div>
          <p className="text-sm text-slate-500">Verifier</p>
          <strong>{epd.verifier_name ?? '-'}</strong>
        </div>
        <div>
          <p className="text-sm text-slate-500">Set</p>
          <strong>{epd.standard_set}</strong>
        </div>
        {epd.epd_files?.storage_path && supabaseUrl && (
          <div>
            <p className="text-sm text-slate-500">Originele PDF</p>
            <a
              href={`${supabaseUrl}/storage/v1/object/public/${bucket}/${epd.epd_files.storage_path}`}
              target="_blank"
              rel="noreferrer"
            >
              Download
            </a>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sets.map((set) => (
          <div className="card" key={set}>
            <h3 className="text-md font-semibold">{set === 'UNKNOWN' ? 'Onbekend' : set}</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Fase</th>
                  <th>MKI</th>
                  <th>CO2</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage) => (
                  <tr key={`${set}-${stage}`}>
                    <td>{stage.replace('_', ' ')}</td>
                    <td>{findImpact(set, 'MKI', stage)}</td>
                    <td>{findImpact(set, 'CO2', stage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-md font-semibold">Extra velden</h3>
        {epd.custom_attributes && Object.keys(epd.custom_attributes).length > 0 ? (
          <ul>
            {Object.entries(epd.custom_attributes).map(([key, value]: [string, any]) => (
              <li key={key}>
                <strong>{key}</strong>: {String(value)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">Geen extra velden opgeslagen.</p>
        )}
      </div>
    </div>
  );
}
