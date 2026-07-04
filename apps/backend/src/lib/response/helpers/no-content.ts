/**
 * Builds a standard no-content envelope indicator.
 * Since 204 has no body, this helper returns void.
 *
 * Responsibilities:
 * - Indicate success path execution without data content.
 *
 * Non-responsibilities:
 * - Directly sending status codes.
 */
export const noContent = (): void => {
  return;
};
