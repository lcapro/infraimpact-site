import { ChangeEvent } from 'react';

interface Props {
  onParse: (content: string) => void;
}

export function EpdUpload({ onParse }: Props) {
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onParse(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900">EPD upload</p>
          <p className="text-slate-600">Upload een .txt of .json EPD en we vullen MKI/GWP en fases voor je in.</p>
        </div>
        <label className="cursor-pointer rounded-md border border-brand-200 bg-brand-50 px-4 py-2 font-semibold text-brand-700">
          EPD kiezen
          <input type="file" accept=".txt,.json,.csv,.pdf" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Parser detecteert MKI/ECI en GWP velden plus fases A1, A2, A3 en D. Handmatig aanpassen blijft mogelijk.
      </p>
    </div>
  );
}
