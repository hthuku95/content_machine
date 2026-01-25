/**
 * Response validation helpers for API responses
 * These helpers ensure type safety and provide fallbacks for malformed responses
 */

/**
 * Validates and extracts an array from an API response
 * @param data - The response data to validate
 * @param key - The key containing the array in the response
 * @param context - Context string for error logging (e.g., "listSourceChannels")
 * @returns The validated array or empty array as fallback
 */
export function validateArrayResponse<T>(
  data: unknown,
  key: string,
  context: string
): T[] {
  if (typeof data !== 'object' || data === null) {
    console.error(`${context}: Invalid response format`, data);
    return [];
  }

  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj[key])) {
    console.error(`${context}: Expected array in ${key}, got`, typeof obj[key]);
    return [];
  }

  return obj[key] as T[];
}

/**
 * Validates and extracts an object from an API response
 * @param data - The response data to validate
 * @param key - The key containing the object in the response
 * @param context - Context string for error logging (e.g., "getClipDetails")
 * @returns The validated object or null as fallback
 */
export function validateObjectResponse<T>(
  data: unknown,
  key: string,
  context: string
): T | null {
  if (typeof data !== 'object' || data === null) {
    console.error(`${context}: Invalid response format`, data);
    return null;
  }

  const obj = data as Record<string, unknown>;
  if (!obj[key]) {
    console.error(`${context}: Missing ${key} in response`);
    return null;
  }

  return obj[key] as T;
}

/**
 * Validates a response wrapper with success flag
 * @param data - The response data to validate
 * @param context - Context string for error logging
 * @returns True if response has success: true, false otherwise
 */
export function validateSuccessResponse(data: unknown, context: string): boolean {
  if (typeof data !== 'object' || data === null) {
    console.error(`${context}: Invalid response format`, data);
    return false;
  }

  const obj = data as Record<string, unknown>;
  if (obj.success !== true) {
    console.warn(`${context}: Response success is not true`, obj.success);
    return false;
  }

  return true;
}
