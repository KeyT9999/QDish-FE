export type RealtimeOrderTrace = {
  requestId: string;
  emittedAt: string;
};

export type RealtimeLatencySummary = {
  sampleCount: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
};

const MAX_SAMPLES = 100;
const SUMMARY_EVERY = 25;
const latencySamples: number[] = [];
let totalSamples = 0;

export function summarizeRealtimeLatency(samples: number[]): RealtimeLatencySummary | null {
  const validSamples = samples.filter((value) => Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  if (validSamples.length === 0) return null;

  const percentile = (fraction: number) => validSamples[Math.max(0, Math.ceil(validSamples.length * fraction) - 1)];
  return {
    sampleCount: validSamples.length,
    p50Ms: Math.round(percentile(0.5)),
    p95Ms: Math.round(percentile(0.95)),
    p99Ms: Math.round(percentile(0.99)),
  };
}

export function recordRealtimeOrderArrival(trace: RealtimeOrderTrace, clientReceivedAt = Date.now()) {
  if (!/^[A-Za-z0-9._-]{1,80}$/.test(trace.requestId)) return null;
  const emittedAt = Date.parse(trace.emittedAt);
  if (!Number.isFinite(emittedAt)) return null;

  const estimatedDeliveryMs = clientReceivedAt - emittedAt;
  // Drop negative/large values since clocks across devices may be skewed.
  if (estimatedDeliveryMs < 0 || estimatedDeliveryMs > 60_000) return null;

  const detail = { requestId: trace.requestId, estimatedDeliveryMs, emittedAt, clientReceivedAt };
  if (typeof performance !== 'undefined') {
    performance.clearMarks('qdish:realtime-order-arrival');
    performance.mark('qdish:realtime-order-arrival', { detail });
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('qdish:realtime-order-arrival', { detail }));
  }

  latencySamples.push(estimatedDeliveryMs);
  totalSamples += 1;
  if (latencySamples.length > MAX_SAMPLES) latencySamples.shift();
  if (totalSamples % SUMMARY_EVERY === 0) {
    const summary = summarizeRealtimeLatency(latencySamples);
    if (summary) {
      const summaryDetail = { ...summary, metric: 'socket_delivery_estimate_ms' };
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('qdish:realtime-order-latency-summary', { detail: summaryDetail }));
      }
      console.info('[qdish:realtime-order-latency-summary]', summaryDetail);
    }
  }

  return detail;
}
