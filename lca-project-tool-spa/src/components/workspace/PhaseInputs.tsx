import { PhaseValue } from '../../lib/types';

interface Props {
  phases: PhaseValue[];
  onChange: (index: number, value: Partial<PhaseValue>) => void;
}

export function PhaseInputs({ phases, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {phases.map((phase, idx) => (
        <label key={phase.phase} className="text-sm font-medium text-slate-700">
          {phase.phase} (MKI)
          <input
            type="number"
            step="0.001"
            value={phase.mki ?? ''}
            onChange={(e) => onChange(idx, { mki: e.target.value ? Number(e.target.value) : undefined })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
      ))}
    </div>
  );
}
