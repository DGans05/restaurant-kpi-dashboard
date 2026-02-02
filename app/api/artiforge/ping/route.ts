import { NextResponse } from 'next/server';
import { pingArtiforge } from '@/lib/artiforge';

export async function GET() {
  try {
    const result = await pingArtiforge();
    return NextResponse.json({ connected: true, result });
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
