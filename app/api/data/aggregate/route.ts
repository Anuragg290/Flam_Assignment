import { NextRequest, NextResponse } from 'next/server';
import { DataGenerator } from '@/lib/dataGenerator';
import { DataPoint, AggregationPeriod } from '@/lib/types';

// Configure Edge Runtime
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, period }: { data: DataPoint[]; period: AggregationPeriod } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    if (!period || !period.milliseconds) {
      return NextResponse.json(
        { error: 'Invalid aggregation period' },
        { status: 400 }
      );
    }

    const generator = new DataGenerator();
    const aggregated = generator.aggregate(data, period);

    return NextResponse.json({
      data: aggregated,
      originalCount: data.length,
      aggregatedCount: aggregated.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

