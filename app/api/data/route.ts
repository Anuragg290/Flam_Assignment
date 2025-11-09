import { NextRequest, NextResponse } from 'next/server';
import { DataGenerator } from '@/lib/dataGenerator';

// Configure Edge Runtime for lower latency
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const count = parseInt(searchParams.get('count') || '1000');
  const intervalMs = parseInt(searchParams.get('intervalMs') || '1000');

  const generator = new DataGenerator({
    baseValue: 100,
    trend: 0.1,
    noise: 5,
    seasonality: 10,
  });

  const startTime = Date.now() - count * intervalMs;
  const data = generator.generatePoints(count, startTime, intervalMs);

  return NextResponse.json({
    data,
    count: data.length,
    startTime,
    endTime: Date.now(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count = 1000, intervalMs = 1000, config } = body;

    const generator = new DataGenerator(config || {});
    const startTime = Date.now() - count * intervalMs;
    const data = generator.generatePoints(count, startTime, intervalMs);

    return NextResponse.json({
      data,
      count: data.length,
      startTime,
      endTime: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

