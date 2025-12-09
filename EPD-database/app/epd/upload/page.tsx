'use client';

import { useState, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ParsedImpact, ParsedEpd, EpdSetType, EpdImpactStage } from '@/lib/types';

const stages: EpdImpactStage[] = ['A1', 'A2', 'A3', 'A1_A3', 'D'];
const setTypes: EpdSetType[] = ['SBK_SET_1', 'SBK_SET_2'];

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsed, setParsed] = useState<ParsedEpd | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [form, setForm] = useState({
    productName: '',
    functionalUnit: '',
    producerName: '',
    lcaMethod: '',
    pcrVersion: '',
    databaseName: '',
    publicationDate: '',
    expirationDate: '',
    verifierName: '',
    standardSet: 'UNKNOWN' as EpdSetType
  });
  const [impacts, setImpacts] = useState<ParsedImpact[]>([]);
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
  const router = useRouter();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (file.type !== 'application/pdf') {
      alert('Alleen PDF bestanden zijn toegestaan');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/epd/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? 'Upload mislukt');
      setUploading(false);
      return;
    }

    const json = await res.json();
    setUploading(false);
    setParsed(json.parsedEpd);
    setFileId(json.fileId);
    setForm({
      productName: json.parsedEpd.productName ?? '',
      functionalUnit: json.parsedEpd.functionalUnit ?? '',
      producerName: json.parsedEpd.producerName ?? '',
      lcaMethod: json.parsedEpd.lcaMethod ?? '',
      pcrVersion: json.parsedEpd.pcrVersion ?? '',
      databaseName: json.parsedEpd.databaseName ?? '',
      publicationDate: json.parsedEpd.publicationDate ?? '',
      expirationDate: json.parsedEpd.expirationDate ?? '',
      verifierName: json.parsedEpd.verifierName ?? '',
      standardSet: json.parsedEpd.standardSet ?? 'UNKNOWN'
    });
    setImpacts(json.parsedEpd.impacts ?? []);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const updateImpact = (setType: EpdSetType, indicator: 'MKI' | 'CO2', stage: EpdImpactStage, value: string) => {
    const numeric = value === '' ? NaN : Number(value);
    setImpacts((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((i) => i.setType === setType && i.indicator === indicator && i.stage === stage);
      if (idx >= 0) {
        if (Number.isNaN(numeric)) {
          copy.splice(idx, 1);
        } else {
          copy[idx] = { ...copy[idx], value: numeric };
        }
      } else if (!Number.isNaN(numeric)) {
        copy.push({ indicator, setType, stage, value: numeric });
      }
      return copy;
    });
  };

  const getImpactValue = (setType: EpdSetType, indicator: 'MKI' | 'CO2', stage: EpdImpactStage) => {
    return impacts.find((i) => i.setType === setType && i.indicator === indicator && i.stage === stage)?.value ?? '';
  };

  const addCustomField = () => setCustomFields((prev) => [...prev, { key: '', value: '' }]);

  const handleSave = async () => {
    if (!form.productName || !form.functionalUnit) {
      alert('Productnaam en functionele eenheid zijn verplicht');
      return;
    }

    const customAttributes: Record<string, string> = {};
    customFields.forEach((row) => {
      if (row.key) customAttributes[row.key] = row.value;
    });

    const payload = {
      ...form,
      fileId,
      impacts,
      customAttributes
    };

    const res = await fetch('/api/epd/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? 'Opslaan mislukt');
      return;
    }

    const json = await res.json();
    router.push(`/epd/${json.id}`);
  };

  const renderImpactTable = (setType: EpdSetType) => (
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
          <tr key={`${setType}-${stage}`}>
            <td>{stage.replace('_', ' ')}</td>
            <td>
              <input
                className="input"
                type="number"
                value={getImpactValue(setType, 'MKI', stage)}
                onChange={(e) => updateImpact(setType, 'MKI', stage, e.target.value)}
              />
            </td>
            <td>
              <input
                className="input"
                type="number"
                value={getImpactValue(setType, 'CO2', stage)}
                onChange={(e) => updateImpact(setType, 'CO2', stage, e.target.value)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-4">
      <div className="flex-between">
        <div>
          <h2 className="text-lg font-semibold">EPD uploaden</h2>
          <p className="text-sm text-slate-600">Upload een PDF en controleer de voorgestelde gegevens.</p>
        </div>
        <Link href="/epd" className="button button-secondary">Terug naar overzicht</Link>
      </div>

      <div
        className="card"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${dragOver ? 'border-sky-400 bg-sky-50' : 'border-slate-300'}`}
        >
          <p className="font-semibold">Sleep een PDF hierheen of kies een bestand</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
            className="mt-3"
          />
          {uploading && <p>Uploaden en analyseren...</p>}
        </div>
      </div>

      {parsed && (
        <div className="space-y-3">
          <div className="card space-y-3">
            <h3 className="text-md font-semibold">Basisgegevens</h3>
            <div className="grid-two">
              <label className="space-y-1">
                <span>Productnaam</span>
                <input className="input" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span>Functionele eenheid</span>
                <input className="input" value={form.functionalUnit} onChange={(e) => setForm({ ...form, functionalUnit: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span>Producent</span>
                <input className="input" value={form.producerName} onChange={(e) => setForm({ ...form, producerName: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span>LCA-methode</span>
                <input className="input" value={form.lcaMethod} onChange={(e) => setForm({ ...form, lcaMethod: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span>PCR-versie</span>
                <input className="input" value={form.pcrVersion} onChange={(e) => setForm({ ...form, pcrVersion: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span>Database</span>
                <input className="input" value={form.databaseName} onChange={(e) => setForm({ ...form, databaseName: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span>Datum publicatie</span>
                <input className="input" type="date" value={form.publicationDate} onChange={(e) => setForm({ ...form, publicationDate: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span>Einde geldigheid</span>
                <input className="input" type="date" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span>Naam toetser / verificateur</span>
                <input className="input" value={form.verifierName} onChange={(e) => setForm({ ...form, verifierName: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span>SBK set</span>
                <select
                  className="select"
                  value={form.standardSet}
                  onChange={(e) => setForm({ ...form, standardSet: e.target.value as EpdSetType })}
                >
                  <option value="UNKNOWN">Onbekend</option>
                  <option value="SBK_SET_1">SBK set 1 / EN15804 +A1</option>
                  <option value="SBK_SET_2">SBK set 2 / EN15804 +A2</option>
                </select>
              </label>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="text-md font-semibold">MKI en CO2 waarden</h3>
            <div className="grid-two">
              {setTypes.map((setType) => (
                <div key={setType}>
                  <p className="font-semibold mb-2">{setType === 'SBK_SET_1' ? 'SBK set 1 (+A1)' : 'SBK set 2 (+A2)'}</p>
                  {renderImpactTable(setType)}
                </div>
              ))}
            </div>
          </div>

          <div className="card space-y-2">
            <div className="flex-between">
              <h3 className="text-md font-semibold">Extra velden</h3>
              <button className="button button-secondary" onClick={addCustomField}>Extra veld toevoegen</button>
            </div>
            {customFields.length === 0 && <p className="text-sm text-slate-600">Geen extra velden toegevoegd.</p>}
            {customFields.map((row, idx) => (
              <div className="grid-two" key={`custom-${idx}`}>
                <input
                  className="input"
                  placeholder="naam"
                  value={row.key}
                  onChange={(e) => {
                    const next = [...customFields];
                    next[idx] = { ...row, key: e.target.value };
                    setCustomFields(next);
                  }}
                />
                <input
                  className="input"
                  placeholder="waarde"
                  value={row.value}
                  onChange={(e) => {
                    const next = [...customFields];
                    next[idx] = { ...row, value: e.target.value };
                    setCustomFields(next);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="button button-primary" onClick={handleSave}>Opslaan in database</button>
            <Link href="/epd" className="button button-secondary">Annuleren</Link>
          </div>
        </div>
      )}
    </div>
  );
}
