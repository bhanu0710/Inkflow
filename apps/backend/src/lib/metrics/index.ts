import client from "prom-client";

// Global Prometheus metrics registry
export const registry = new client.Registry();

// Enable default system metrics collection (CPU, Memory, Event Loop, etc.)
client.collectDefaultMetrics({ register: registry });

// HTTP request counter metric
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests processed",
  labelNames: ["method", "route", "status_code"],
  registers: [registry],
});

// HTTP request duration histogram metric
export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // seconds
  registers: [registry],
});
