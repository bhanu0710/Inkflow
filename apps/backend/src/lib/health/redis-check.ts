import net from "net";

/**
 * Checks Redis connectivity by attempting a lightweight TCP socket connection.
 * Parses the host and port from the provided Redis URL.
 *
 * @param redisUrl Connection string for Redis.
 * @param timeoutMs Timeout in milliseconds for the connection attempt.
 */
export const checkRedisHealth = (redisUrl: string, timeoutMs = 2000): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const url = new URL(redisUrl);
      const host = url.hostname || "127.0.0.1";
      const port = url.port ? parseInt(url.port, 10) : 6379;

      const socket = net.createConnection({ host, port });
      socket.setTimeout(timeoutMs);

      socket.on("connect", () => {
        socket.end();
        resolve(true);
      });

      socket.on("error", () => {
        socket.destroy();
        resolve(false);
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
};
