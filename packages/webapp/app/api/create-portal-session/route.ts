import { NextRequest, NextResponse } from 'next/server';

/** Stripe billing portal has been disabled. */
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Billing is disabled' }, { status: 410 });
}
