import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseClient';
import { buildExportRows, exportToCsv, exportToWorkbook } from '@/lib/epdExport';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') ?? 'excel';

    const admin = getAdminClient();
    const { data, error } = await admin.from('epds').select('*, epd_impacts(*)');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const exportShapes = (data ?? []).map((row: any) => ({
      ...row,
      impacts: row.epd_impacts ?? [],
      custom_attributes: row.custom_attributes ?? {}
    }));

    const rows = buildExportRows(exportShapes);

    if (format === 'csv') {
      const csv = exportToCsv(rows);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="epds.csv"'
        }
      });
    }

    const buffer = await exportToWorkbook(rows);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="epds.xlsx"'
      }
    });
  } catch (error) {
    console.error('Export error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
