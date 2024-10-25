import { HttpError } from './HttpError';

export function getSessionId(request: Request): string {
  // For now we're using the client-generated installation ID as the session identifier
  const sessionId = request.headers.get('x-installation-id') ?? '';
  if (!sessionId.length) {
    throw new HttpError(401, 'Invalid Session ID');
  }
  return sessionId;
}
