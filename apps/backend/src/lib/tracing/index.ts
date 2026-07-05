import { trace } from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { AlwaysOnSampler, ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";

// Isolated sampling configuration, allowing easy replacement later
const sampler = new AlwaysOnSampler();

let sdk: NodeSDK | null = null;
let isInitialized = false;

/**
 * Initializes the OpenTelemetry SDK with HTTP and Express instrumentations
 * and registers ConsoleSpanExporter.
 */
export const initTelemetry = (): void => {
  if (isInitialized) {
    return;
  }
  isInitialized = true;

  sdk = new NodeSDK({
    sampler,
    spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
    ],
  });


  sdk.start();
};

/**
 * Safely retrieves the active span's Trace ID if OpenTelemetry is active.
 */
export const getActiveTraceId = (): string | undefined => {
  const activeSpan = trace.getActiveSpan();
  const traceId = activeSpan?.spanContext().traceId;
  return traceId && traceId !== "" ? traceId : undefined;
};
