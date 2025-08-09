import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Length': '2',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
