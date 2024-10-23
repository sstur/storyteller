import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_BUCKET_NAME,
  CLOUDFLARE_PUBLIC_HOSTNAME,
} from '~/support/constants';

// A subset of what's accepted in fetch's body
type Payload =
  | ArrayBuffer
  | AsyncIterable<Uint8Array>
  | Blob
  | FormData
  | Iterable<Uint8Array>
  | NodeJS.ArrayBufferView
  | string;

export async function saveFile(
  filename: string,
  contentType: string,
  data: Payload,
) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${CLOUDFLARE_BUCKET_NAME}/objects/${filename}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': contentType,
      },
      body: data,
      duplex: 'half',
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to upload file to R2: ${response.status} ${response.statusText}`,
    );
  }

  const result = await response.json();

  if (Object(result).success !== true) {
    throw new Error(`Unsuccessful upload to R2: ${JSON.stringify(result)}`);
  }

  return `https://${CLOUDFLARE_PUBLIC_HOSTNAME}/${filename}`;
}

export async function saveFileFromUrl(filename: string, url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch "${url}": ${response.status}`);
  }
  if (response.body === null) {
    throw new Error(`No body received from "${url}"`);
  }
  const contentType =
    response.headers.get('content-type') ?? 'application/octet-stream';
  return await saveFile(filename, contentType, response.body);
}
