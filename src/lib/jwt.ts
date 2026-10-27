/**
 * JWT token utility functions
 */

export interface JWTPayload {
  sub: string;
  jti: string;
  name?: string;
  role?: string;
  SessionId?: string;
  exp: number;
  iss: string;
  aud: string;
  [key: string]: any;
}


export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      console.error('Invalid JWT: missing payload');
      return null;
    }
    const decoded = atob(payload);
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/**
 * Get time until token expiration in seconds
 */
export function getTokenExpiryTime(token: string): number | null {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now;
}
