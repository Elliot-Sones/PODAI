import { NextResponse } from 'next/server';

/** Stripe webhooks have been disabled. */
export async function POST(req: Request) {
  return NextResponse.json({ error: 'Billing is disabled' }, { status: 410 });
}
