import { API_BASE_URL, APP_VERSION } from '~/support/constants';

type Init = Omit<RequestInit, 'method'>;

function createFetch(method: 'GET' | 'POST' = 'GET') {
  return async (path: string, init: Init = {}) => {
    const url = new URL(path, API_BASE_URL);

    const headers = new Headers(init.headers);
    headers.set('X-App-Version', APP_VERSION);

    const response = await fetch(url, {
      ...init,
      method,
      headers,
    });
    if (!response.ok) {
      throw new Error(
        `Error fetching "${method}:${path}"; Unexpected response status: ${response.status}`,
      );
    }
    return response;
  };
}

export const api = {
  get: createFetch('GET'),
  post: createFetch('POST'),
};
