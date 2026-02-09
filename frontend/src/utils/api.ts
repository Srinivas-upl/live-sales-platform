// API utility functions

/**
 * Get the full API URL for a given endpoint
 * @param endpoint The API endpoint (e.g., '/api/products')
 * @returns Full URL including the base API URL
 */
export function getApiUrl(endpoint: string): string {
  // If endpoint already starts with http, return as-is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Get API URL from environment or use relative URL
  const API_URL = import.meta.env.VITE_API_URL;
  
  // If API_URL is set, use it
  if (API_URL) {
    // Ensure API_URL doesn't end with slash
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return `${baseUrl}/${cleanEndpoint}`;
  }
  
  // Fallback to relative URL
  return `/${cleanEndpoint}`;
}

/**
 * Make a fetch request with proper error handling
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(endpoint);
  
  // Add publishable API key header for store routes
  const publishableApiKey = import.meta.env.VITE_PUBLISHABLE_API_KEY;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Always add publishable API key if available for store API calls
  if (publishableApiKey) {
    headers['x-publishable-api-key'] = publishableApiKey;
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
}

/**
 * Make a fetch request with authentication
 */
export async function authFetch(endpoint: string, token: string, options: RequestInit = {}): Promise<Response> {
  return apiFetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
}
