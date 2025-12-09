import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseClient';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const admin = getAdminClient();
    const { data: epd, error } = await admin
      .from('epds')
      .select('*, epd_files(storage_path)')
      .eq('id', params.id)
      .single();

    if (error || !epd) {
      return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 });
    }

    const { data: impacts, error: impactError } = await admin
      .from('epd_impacts')
      .select('*')
      .eq('epd_id', params.id);

    if (impactError) {
      return NextResponse.json({ error: impactError.message }, { status: 500 });
    }

    return NextResponse.json({ epd, impacts });
  } catch (error) {
    console.error('Detail error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
