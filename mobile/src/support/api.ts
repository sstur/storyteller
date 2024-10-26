import { API_BASE_URL, APP_VERSION } from '~/support/constants';

import { getInstallationId } from './getInstallationId';

type Init = Omit<RequestInit, 'method' | 'body'> & {
  body?: undefined;
};

type InitWithBody = Omit<RequestInit, 'method' | 'body'> & {
  body?: unknown;
};

type Method = 'GET' | 'POST';

function createFetch<T extends Method>(method: T) {
  return async (
    path: string,
    init?: T extends 'POST' ? InitWithBody : Init,
  ) => {
    const url = new URL(path, API_BASE_URL);

    const headers = new Headers(init?.headers);
    headers.set('X-App-Version', APP_VERSION);
    headers.set('X-Installation-ID', await getInstallationId());

    const response = await fetch(url, {
      ...init,
      method,
      headers,
      body:
        method === 'POST'
          ? serializeBody(headers, init?.body ?? null)
          : undefined,
    });
    if (!response.ok) {
      throw new Error(
        `Error fetching "${method}:${path}"; Unexpected response status: ${response.status}`,
      );
    }
    return response;
  };
}

function serializeBody(headers: Headers, body: unknown) {
  if (body === null || typeof body === 'string') {
    return body;
  }
  headers.set('Content-Type', 'application/json');
  return JSON.stringify(body);
}

export const api = {
  get: createFetch('GET'),
  post: createFetch('POST'),
};
