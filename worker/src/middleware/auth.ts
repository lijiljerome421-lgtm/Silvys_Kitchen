import type { Context, Next } from 'hono';
import type { Bindings } from '../types';

export interface AuthVariables {
  adminUser: {
    username: string;
    role: string;
  };
}

export async function adminAuthMiddleware(
  c: Context<{ Bindings: Bindings; Variables: AuthVariables }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (authHeader && authHeader.trim()) {
    token = authHeader.trim();
  } else {
    token = c.req.header('X-Admin-Token')?.trim() || null;
  }

  if (!token) {
    return c.json({ status: 'error', message: 'Unauthorized: Missing authentication token' }, 401);
  }

  try {
    const session = await c.env.DB.prepare(
      'SELECT token, username, expires_at FROM sessions WHERE token = ?'
    )
      .bind(token)
      .first<{ token: string; username: string; expires_at: string }>();

    if (!session) {
      return c.json({ status: 'error', message: 'Unauthorized: Invalid or expired session token' }, 401);
    }

    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      c.executionCtx.waitUntil(
        c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
      );
      return c.json({ status: 'error', message: 'Unauthorized: Session has expired' }, 401);
    }

    const adminUser = await c.env.DB.prepare(
      'SELECT username, role FROM admin_users WHERE username = ?'
    )
      .bind(session.username)
      .first<{ username: string; role: string }>();

    if (!adminUser) {
      return c.json({ status: 'error', message: 'Unauthorized: Admin user no longer exists' }, 401);
    }

    c.set('adminUser', {
      username: adminUser.username,
      role: adminUser.role || 'ADMIN',
    });

    await next();
  } catch (err: any) {
    return c.json({ status: 'error', message: 'Unauthorized: Authentication check failed' }, 401);
  }
}
