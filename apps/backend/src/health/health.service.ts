export interface HealthStatus {
  status: "ok";
}

export const getHealthStatus = (): HealthStatus => ({
  status: "ok"
});

export const getReadinessStatus = (): HealthStatus => ({
  status: "ok"
});

export const getLivenessStatus = (): HealthStatus => ({
  status: "ok"
});
