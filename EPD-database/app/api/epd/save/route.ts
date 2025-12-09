import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseClient';
import { ParsedImpact, EpdSetType } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fileId,
      productName,
      functionalUnit,
      producerName,
      lcaMethod,
      pcrVersion,
      databaseName,
      publicationDate,
      expirationDate,
      verifierName,
      standardSet,
      customAttributes,
      impacts
    } = body;

    if (!productName || !functionalUnit) {
      return NextResponse.json({ error: 'productName and functionalUnit are required' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: epd, error } = await admin
      .from('epds')
      .insert({
        epd_file_id: fileId ?? null,
        product_name: productName,
        functional_unit: functionalUnit,
        producer_name: producerName ?? null,
        lca_method: lcaMethod ?? null,
        pcr_version: pcrVersion ?? null,
        database_name: databaseName ?? null,
        publication_date: publicationDate ?? null,
        expiration_date: expirationDate ?? null,
        verifier_name: verifierName ?? null,
        standard_set: (standardSet as EpdSetType) ?? 'UNKNOWN',
        custom_attributes: customAttributes ?? {}
      })
      .select('id')
      .single();

    if (error || !epd) {
      return NextResponse.json({ error: error?.message ?? 'Failed to insert EPD' }, { status: 500 });
    }

    if (Array.isArray(impacts) && impacts.length > 0) {
      const sanitizedImpacts = impacts.map((impact: ParsedImpact) => ({
        epd_id: epd.id,
        indicator: impact.indicator,
        set_type: impact.setType,
        stage: impact.stage,
        value: typeof impact.value === 'number' ? impact.value : null
      }));

      const { error: impactError } = await admin.from('epd_impacts').insert(sanitizedImpacts);
      if (impactError) {
        return NextResponse.json({ error: impactError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id: epd.id });
  } catch (error) {
    console.error('Save error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
