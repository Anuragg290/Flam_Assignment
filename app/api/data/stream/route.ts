import { NextRequest } from 'next/server';
import { DataGenerator } from '@/lib/dataGenerator';

// Configure Edge Runtime for real-time streaming
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const count = parseInt(searchParams.get('count') || '10');
  const intervalMs = parseInt(searchParams.get('intervalMs') || '100');

  const generator = new DataGenerator({
    baseValue: 100,
    trend: 0.1,
    noise: 5,
    seasonality: 10,
  });

  // Generate streaming data
  const startTime = Date.now();
  const data = generator.generatePoints(count, startTime - count * intervalMs, intervalMs);

  // Return as streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const point of data) {
        const chunk = JSON.stringify(point) + '\n';
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

