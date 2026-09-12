import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import type { Bindings } from '../types';
import { adminAuthMiddleware, type AuthVariables } from '../middleware/auth';

export const authRoutes = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * POST /api/admin/login
 * Authenticates admin credentials, verifies BCrypt hash, and issues session token in D1.
 */
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const username = body?.username ? String(body.username).trim() : '';
    const password = body?.password ? String(body.password) : '';

    if (!username || !password) {
      return c.json({ status: 'error', message: 'Invalid username or password' }, 401);
    }

    const adminUser = await c.env.DB.prepare(
      'SELECT id, username, password, role FROM admin_users WHERE username = ?'
    )
      .bind(username)
      .first<{ id: number; username: string; password: string; role: string }>();

    if (!adminUser || !adminUser.password) {
      return c.json({ status: 'error', message: 'Invalid username or password' }, 401);
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return c.json({ status: 'error', message: 'Invalid username or password' }, 401);
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    await c.env.DB.prepare(
      'INSERT INTO sessions (token, username, created_at, expires_at) VALUES (?, ?, CURRENT_TIMESTAMP, ?)'
    )
      .bind(token, adminUser.username, expiresAt)
      .run();

    return c.json({
      status: 'success',
      message: 'Login successful',
      role: adminUser.role || 'ADMIN',
      username: adminUser.username,
      token,
    });
  } catch (err: any) {
    return c.json({ status: 'error', message: 'Authentication failed' }, 500);
  }
});

/**
 * POST /api/admin/logout
 * Invalidates and deletes session token from D1 database.
 */
authRoutes.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (authHeader && authHeader.trim()) {
      token = authHeader.trim();
    } else {
      token = c.req.header('X-Admin-Token')?.trim() || null;
    }

    if (token) {
      await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    }

    return c.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (err: any) {
    return c.json({ status: 'error', message: 'Logout failed' }, 500);
  }
});

/**
 * GET /api/admin/me
 * Returns current authenticated admin user details. Requires valid Bearer token.
 */
authRoutes.get('/me', adminAuthMiddleware, (c) => {
  const adminUser = c.get('adminUser');
  return c.json({
    status: 'success',
    username: adminUser.username,
    role: adminUser.role,
  });
});
