/* ============================================================================
 * ADMIN SIGN-IN — one password, one signed session cookie.
 * ----------------------------------------------------------------------------
 * ADMIN_PASSWORD   the password (required; sign-in is refused without it)
 * ADMIN_SECRET     signs the cookie. Optional: when unset a random secret is
 *                  made at start-up, so sessions end when the server restarts.
 * ========================================================================== */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const SESSION_COOKIE = 'vpv_admin';
const SESSION_HOURS = 12;
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export class AdminAuth {
  private readonly secret: Buffer;
  private readonly attempts = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly password: string | undefined,
    secret: string | undefined,
  ) {
    this.secret = secret ? Buffer.from(secret) : randomBytes(32);
  }

  get configured(): boolean {
    return !!this.password;
  }

  /** Constant-time comparison of a sign-in attempt. */
  checkPassword(attempt: unknown): boolean {
    if (!this.password || typeof attempt !== 'string') return false;
    return timingSafeEqual(sha256(attempt), sha256(this.password));
  }

  /** False once an address has used up its attempts for the window. */
  allowAttempt(key: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(key);
    if (!entry || entry.resetAt < now) {
      this.attempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
      return true;
    }
    entry.count += 1;
    return entry.count <= MAX_ATTEMPTS;
  }

  clearAttempts(key: string): void {
    this.attempts.delete(key);
  }

  issue(res: Response, secure: boolean): void {
    const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
    const token = `${expires}.${this.sign(String(expires))}`;
    res.setHeader('Set-Cookie', cookie(token, SESSION_HOURS * 3600, secure));
  }

  clear(res: Response, secure: boolean): void {
    res.setHeader('Set-Cookie', cookie('', 0, secure));
  }

  isSignedIn(req: Request): boolean {
    const token = readCookie(req, SESSION_COOKIE);
    if (!token) return false;
    const [expires, signature] = token.split('.');
    if (!expires || !signature || Number(expires) < Date.now()) return false;
    const expected = Buffer.from(this.sign(expires));
    const given = Buffer.from(signature);
    return expected.length === given.length && timingSafeEqual(expected, given);
  }

  /** Express middleware: 401 unless signed in. */
  readonly require = (req: Request, res: Response, next: NextFunction): void => {
    if (this.isSignedIn(req)) {
      next();
      return;
    }
    res.status(401).json({ error: 'Please sign in again.' });
  };

  private sign(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }
}

/** Behind a proxy that terminates TLS, trust its X-Forwarded-Proto header. */
export function isSecure(req: Request): boolean {
  return req.secure || req.get('x-forwarded-proto')?.split(',')[0]?.trim() === 'https';
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function cookie(value: string, maxAge: number, secure: boolean): string {
  return [
    `${SESSION_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    ...(secure ? ['Secure'] : []),
  ].join('; ');
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}
