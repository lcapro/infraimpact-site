import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pdf from 'pdf-parse';
import { getAdminClient } from '@/lib/supabaseClient';
import { parseEpd } from '@/lib/epdParser';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF uploads are allowed' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'epd-pdfs';
    const admin = getAdminClient();
    const storagePath = `epd/${uuidv4()}-${file.name}`;

    const uploadResult = await admin.storage.from(bucket).upload(storagePath, buffer, {
      contentType: 'application/pdf',
      upsert: false
    });

    if (uploadResult.error) {
      return NextResponse.json({ error: uploadResult.error.message }, { status: 500 });
    }

    const parsedPdf = await pdf(buffer);
    const rawText = parsedPdf.text || '';
    const parsedEpd = parseEpd(rawText);

    const { data, error } = await admin
      .from('epd_files')
      .insert({ storage_path: storagePath, original_filename: file.name, raw_text: rawText })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      fileId: data.id,
      storagePath,
      rawText,
      parsedEpd
    });
  } catch (error) {
    console.error('Upload error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
