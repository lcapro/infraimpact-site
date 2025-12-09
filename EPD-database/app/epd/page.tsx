'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface EpdSummary {
  id: string;
  product_name: string;
  producer_name?: string | null;
  functional_unit: string;
  publication_date?: string | null;
  expiration_date?: string | null;
  standard_set: string;
}

interface ListResponse {
  items: EpdSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export default function EpdListPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const fetchData = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q: query });
    const res = await fetch(`/api/epd/list?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-4">
      <div className="flex-between">
        <div>
          <h2 className="text-lg font-semibold">EPD overzicht</h2>
          <p className="text-sm text-slate-600">Zoek op productnaam of producent.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/api/epd/export?format=excel" className="button button-secondary">
            Exporteer naar Excel
          </Link>
          <Link href="/epd/upload" className="button button-primary">
            Nieuwe EPD uploaden
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-2 mb-3">
          <input
            className="input"
            placeholder="Zoek..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="button button-secondary" onClick={() => fetchData()}>Zoeken</button>
        </div>

        {loading && <p>Bezig met laden...</p>}

        {data && (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Productnaam</th>
                  <th>Producent</th>
                  <th>Functionele eenheid</th>
                  <th>Publicatie</th>
                  <th>Einde geldigheid</th>
                  <th>Set</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/epd/${item.id}`}>{item.product_name}</Link>
                    </td>
                    <td>{item.producer_name ?? '-'}</td>
                    <td>{item.functional_unit}</td>
                    <td>{item.publication_date ?? '-'}</td>
                    <td>{item.expiration_date ?? '-'}</td>
                    <td>{item.standard_set}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex-between mt-3">
              <div>Pagina {data.page} van {totalPages}</div>
              <div className="flex gap-2">
                <button
                  className="button button-secondary"
                  disabled={data.page <= 1}
                  onClick={() => fetchData(data.page - 1)}
                >
                  Vorige
                </button>
                <button
                  className="button button-secondary"
                  disabled={data.page >= totalPages}
                  onClick={() => fetchData(data.page + 1)}
                >
                  Volgende
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
