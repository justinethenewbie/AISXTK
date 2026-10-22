/**
 * Utility helper for AI API calls in EDT Application
 * Communicates with server-side Gemini proxy endpoints.
 */

export const STORAGE_KEY_GEMINI_MODEL = 'edt_gemini_model';

export function getSavedModel(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GEMINI_MODEL);
    if (!saved || saved.includes('3.8') || saved.includes('3.5') || saved === 'gemini-pro') {
      return 'gemini-2.5-flash';
    }
    return saved;
  } catch {
    return 'gemini-2.5-flash';
  }
}

export function setSavedModel(model: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, model.trim());
  } catch (err) {
    console.error('Failed to save Model:', err);
  }
}

/**
 * Enhanced fetch wrapper that attaches x-gemini-model header for backend proxy routes
 */
export async function aiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const model = getSavedModel();

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (model) {
    headers.set('x-gemini-model', model);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
