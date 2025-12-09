import ExcelJS from 'exceljs';
import { EpdImpactStage, EpdSetType } from './types';

export interface ExportImpactShape {
  indicator: 'MKI' | 'CO2';
  set_type: EpdSetType;
  stage: EpdImpactStage;
  value: number | null;
}

export interface ExportEpdShape {
  id: string;
  epd_file_id?: string | null;
  product_name: string;
  functional_unit: string;
  producer_name?: string | null;
  lca_method?: string | null;
  pcr_version?: string | null;
  database_name?: string | null;
  publication_date?: string | null;
  expiration_date?: string | null;
  verifier_name?: string | null;
  standard_set: EpdSetType;
  custom_attributes: Record<string, string>;
  impacts: ExportImpactShape[];
}

const stageColumns: { indicator: 'MKI' | 'CO2'; set: EpdSetType; stage: EpdImpactStage; column: string }[] = [];
(['SBK_SET_1', 'SBK_SET_2'] as EpdSetType[]).forEach((set) => {
  (['A1', 'A2', 'A3', 'A1_A3', 'D'] as EpdImpactStage[]).forEach((stage) => {
    stageColumns.push({ indicator: 'MKI', set, stage, column: `MKI_${set}_${stage}`.replace('SBK_SET_', 'SET') });
    stageColumns.push({ indicator: 'CO2', set, stage, column: `CO2_${set}_${stage}`.replace('SBK_SET_', 'SET') });
  });
});

const columnOrder = [
  'id',
  'product_name',
  'producer_name',
  'functional_unit',
  'lca_method',
  'pcr_version',
  'database_name',
  'publication_date',
  'expiration_date',
  'verifier_name',
  'standard_set',
  ...stageColumns.map((c) => c.column),
  'custom_attributes_json'
];

const findImpactValue = (
  impacts: ExportImpactShape[],
  indicator: 'MKI' | 'CO2',
  set: EpdSetType,
  stage: EpdImpactStage
): number | null => {
  const found = impacts.find((i) => i.indicator === indicator && i.set_type === set && i.stage === stage);
  return found?.value ?? null;
};

export const buildExportRows = (epds: ExportEpdShape[]) => {
  return epds.map((epd) => {
    const row: Record<string, string | number | null> = {
      id: epd.id,
      product_name: epd.product_name,
      producer_name: epd.producer_name ?? null,
      functional_unit: epd.functional_unit,
      lca_method: epd.lca_method ?? null,
      pcr_version: epd.pcr_version ?? null,
      database_name: epd.database_name ?? null,
      publication_date: epd.publication_date ?? null,
      expiration_date: epd.expiration_date ?? null,
      verifier_name: epd.verifier_name ?? null,
      standard_set: epd.standard_set
    };

    stageColumns.forEach(({ indicator, set, stage, column }) => {
      row[column] = findImpactValue(epd.impacts, indicator, set, stage);
    });

    row.custom_attributes_json = JSON.stringify(epd.custom_attributes ?? {});
    return row;
  });
};

export const exportToCsv = (rows: Record<string, string | number | null>[]) => {
  const header = columnOrder.join(';');
  const body = rows
    .map((row) =>
      columnOrder
        .map((col) => {
          const value = row[col];
          if (value === undefined || value === null) return '';
          return String(value).replace(/;/g, ',');
        })
        .join(';')
    )
    .join('\n');
  return `${header}\n${body}`;
};

export const exportToWorkbook = async (rows: Record<string, string | number | null>[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('EPDs');
  sheet.addRow(columnOrder);
  rows.forEach((row) => {
    sheet.addRow(columnOrder.map((key) => row[key] ?? ''));
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
