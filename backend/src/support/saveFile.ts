import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_BUCKET_NAME,
  CLOUDFLARE_PUBLIC_HOSTNAME,
} from '~/support/constants';

export async function saveFile(
  filename: string,
  contentType: string,
  data: Buffer,
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
