import { PhaseValue } from './types';

export function parseEpdContent(content: string) {
  const lower = content.toLowerCase();
  const mkiMatch = /\b(mki|eci|€)\s*[:=]?\s*([0-9.,]+)/.exec(lower);
  const gwpMatch = /(gwp(?: total)?|gwp[ -]?t)\s*[:=]?\s*([0-9.,]+)/.exec(lower);

  const phases: PhaseValue[] = ['a1', 'a2', 'a3', 'd'].map((phase) => {
    const regex = new RegExp(`${phase}[^0-9]*([0-9.,]+)`, 'i');
    const value = regex.exec(content);
    return {
      phase: phase.toUpperCase() as PhaseValue['phase'],
      mki: value ? Number(value[1].replace(',', '.')) : undefined,
    };
  });

  return {
    mkiPerUnit: mkiMatch ? Number(mkiMatch[2].replace(',', '.')) : undefined,
    gwpPerUnit: gwpMatch ? Number(gwpMatch[2].replace(',', '.')) : undefined,
    phases,
  };
}
