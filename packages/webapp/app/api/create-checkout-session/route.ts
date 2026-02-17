import { NextRequest, NextResponse } from 'next/server';

/** Stripe checkout has been disabled. */
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Billing is disabled' }, { status: 410 });
}
