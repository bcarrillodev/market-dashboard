export class FinnhubError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'FinnhubError';
  }
}

export async function safeFetch<T>(
  fetchFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    console.error('Finnhub API Error:', error);
    return fallback;
  }
}
