import { useState } from 'react';

interface EpdUploadProps {
  onParsed: (filled: number) => void;
}

const EpdUpload = ({ onParsed }: EpdUploadProps) => {
  const [status, setStatus] = useState<string>('');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus('Lezen...');
    // Placeholder for backend PDF parsing call
    setTimeout(() => {
      setStatus('EPD gelezen (demo). Handmatige velden worden ingevuld wanneer de backend live is.');
      onParsed(4);
    }, 600);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">EPD inlezen</h4>
      <p className="text-sm text-gray-600">
        Sleep een EPD (PDF) hierheen. We detecteren indicatoren zoals MKI/ECI (€) en GWP (CO₂) met synoniemen en fasen A1-A3 of D.
      </p>
      <label className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-gray-400 transition dropzone">
        <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
        <div className="space-y-2">
          <p className="font-semibold">Upload EPD (PDF)</p>
          <p className="text-sm text-gray-600">Automatisch vullen met detectie van MKI/ECI en GWP per fase.</p>
        </div>
      </label>
      {status && <div className="text-sm text-gray-700 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">{status}</div>}
    </div>
  );
};

export default EpdUpload;
