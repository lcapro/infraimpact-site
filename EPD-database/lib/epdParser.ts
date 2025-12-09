import { ParsedEpd, ParsedImpact, EpdImpactStage, EpdSetType } from './types';

const whitespaceNormalized = (text: string) => text.replace(/\r\n?/g, '\n');

const labelMatch = (text: string, labels: string[]): string | undefined => {
  for (const label of labels) {
    const inline = new RegExp(`${label}\\s*[:\\-]\\s*([^\\n\\r]+)`, 'i');
    const inlineMatch = text.match(inline);
    if (inlineMatch?.[1]) return inlineMatch[1].trim();

    const nextLine = new RegExp(`${label}\\s*[:\\-]?\\s*$\\s*([^\\n\\r]+)`, 'im');
    const nextLineMatch = text.match(nextLine);
    if (nextLineMatch?.[1]) return nextLineMatch[1].trim();
  }
  return undefined;
};

const dateFromText = (text: string, labels: string[]): string | undefined => {
  const value = labelMatch(text, labels);
  if (!value) return undefined;
  const dateMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (!dateMatch) return undefined;
  const [_, dd, mm, yyyy] = dateMatch;
  const iso = new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toISOString().substring(0, 10);
  return iso;
};

const detectStandardSet = (textLower: string): EpdSetType => {
  const hasSet2 = /(sbk\s*set\s*2|en\s*15804\s*\+?a2)/i.test(textLower);
  const hasSet1 = /(sbk\s*set\s*1|en\s*15804\s*\+?a1)/i.test(textLower);
  if (hasSet2) return 'SBK_SET_2';
  if (hasSet1) return 'SBK_SET_1';
  return 'UNKNOWN';
};

const numericFromString = (input: string): number | undefined => {
  const cleaned = input.replace(/\./g, '').replace(',', '.');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : undefined;
};

const stagePatterns: Record<EpdImpactStage, string[]> = {
  A1: ['A1'],
  A2: ['A2'],
  A3: ['A3'],
  A1_A3: ['A1-A3', 'A1 – A3', 'A1–A3', 'A1_A3', 'A1 A3'],
  D: ['D']
};

const findImpactValue = (
  text: string,
  indicatorLabels: string[],
  stage: EpdImpactStage
): number | undefined => {
  for (const indicator of indicatorLabels) {
    for (const stageLabel of stagePatterns[stage]) {
      const combined = new RegExp(`${indicator}[^\\n\\r]{0,12}${stageLabel}[^\\n\\r]{0,20}?(-?[0-9]+(?:[\\.,][0-9]+)?)`, 'i');
      const matchInline = text.match(combined);
      if (matchInline?.[1]) {
        const parsed = numericFromString(matchInline[1]);
        if (parsed !== undefined) return parsed;
      }
      const reversed = new RegExp(`${stageLabel}[^\\n\\r]{0,12}${indicator}[^\\n\\r]{0,20}?(-?[0-9]+(?:[\\.,][0-9]+)?)`, 'i');
      const reversedMatch = text.match(reversed);
      if (reversedMatch?.[1]) {
        const parsed = numericFromString(reversedMatch[1]);
        if (parsed !== undefined) return parsed;
      }
    }
  }
  return undefined;
};

const extractImpactsForSet = (
  text: string,
  setType: EpdSetType,
  indicator: 'MKI' | 'CO2'
): ParsedImpact[] => {
  const indicatorLabels =
    indicator === 'MKI'
      ? ['mki']
      : setType === 'SBK_SET_2'
        ? ['co2 tot', 'co2-tot', 'gwp tot', 'gwp-total', 'gwp total']
        : ['co2', 'gwp'];

  const impacts: ParsedImpact[] = [];
  (['A1', 'A2', 'A3', 'A1_A3', 'D'] as EpdImpactStage[]).forEach((stage) => {
    const value = findImpactValue(text, indicatorLabels, stage);
    if (value !== undefined) {
      impacts.push({ indicator, setType, stage, value });
    }
  });

  const hasA1A3 = impacts.some((i) => i.stage === 'A1_A3');
  if (!hasA1A3) {
    const a1 = impacts.find((i) => i.stage === 'A1')?.value;
    const a2 = impacts.find((i) => i.stage === 'A2')?.value;
    const a3 = impacts.find((i) => i.stage === 'A3')?.value;
    if (a1 !== undefined && a2 !== undefined && a3 !== undefined) {
      impacts.push({ indicator, setType, stage: 'A1_A3', value: a1 + a2 + a3 });
    }
  }

  return impacts;
};

export function parseEpd(raw: string): ParsedEpd {
  const text = whitespaceNormalized(raw);
  const lower = text.toLowerCase();

  const productName = labelMatch(text, ['Productnaam', 'Product name', 'Product']);
  const functionalUnit = labelMatch(text, [
    'Functionele eenheid',
    'Functional unit',
    'FE',
    'Eenheid',
    'Unit'
  ]);
  const producerName = labelMatch(text, ['Producent', 'Fabrikant', 'Leverancier', 'Manufacturer', 'Producer']);
  const lcaMethod = labelMatch(text, ['LCA standaard', 'Bepalingsmethode', 'Bepalingsmethode NMD', 'Berekeningsmethodiek']);
  const pcrVersion = labelMatch(text, ['PCR', 'PCR versie', 'PCR version']);
  const databaseName = labelMatch(text, ['Database', 'Standaard database', 'Background database']);
  const publicationDate = dateFromText(text, [
    'Datum publicatie',
    'Datum van publicatie',
    'Datum getoetst',
    'Datum geverifieerd',
    'Verification date'
  ]);
  const expirationDate = dateFromText(text, ['Einde geldigheid', 'Geldig tot', 'Validity end date']);
  const verifierName = labelMatch(text, ['Naam toetser', 'Naam verificateur', 'Verifier', 'Verificateur']);

  const detectedStandardSet = detectStandardSet(lower);
  const setTypes: EpdSetType[] = detectedStandardSet === 'UNKNOWN' ? ['SBK_SET_1', 'SBK_SET_2'] : [detectedStandardSet];

  const impacts: ParsedImpact[] = [];
  setTypes.forEach((set) => {
    impacts.push(...extractImpactsForSet(text, set, 'MKI'));
    impacts.push(...extractImpactsForSet(text, set, 'CO2'));
  });

  let derivedExpiration = expirationDate;
  if (!derivedExpiration && publicationDate) {
    const d = new Date(publicationDate);
    d.setFullYear(d.getFullYear() + 5);
    derivedExpiration = d.toISOString().substring(0, 10);
  }

  return {
    productName,
    functionalUnit,
    producerName,
    lcaMethod,
    pcrVersion,
    databaseName,
    publicationDate,
    expirationDate: derivedExpiration,
    verifierName,
    standardSet: detectedStandardSet,
    impacts
  };
}
