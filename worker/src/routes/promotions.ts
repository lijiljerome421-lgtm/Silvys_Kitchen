import { Hono } from 'hono';
import type { Bindings, Promotion } from '../types';
import { adminAuthMiddleware, type AuthVariables } from '../middleware/auth';

export const publicPromotionRoutes = new Hono<{ Bindings: Bindings }>();
export const adminPromotionRoutes = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

export function mapRowToPromotion(row: any): Promotion | null {
  if (!row) return null;
  const isActive = row.active === 1 || row.active === true || row.active === '1';

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? null,
    imageUrl: row.image_url ?? row.imageUrl ?? '',
    image_url: row.image_url ?? row.imageUrl ?? '',
    linkType: row.link_type ?? row.linkType ?? 'NONE',
    link_type: row.link_type ?? row.linkType ?? 'NONE',
    linkValue: row.link_value ?? row.linkValue ?? null,
    link_value: row.link_value ?? row.linkValue ?? null,
    active: isActive,
    displayOrder: Number(row.display_order ?? row.displayOrder ?? 0),
    display_order: Number(row.display_order ?? row.displayOrder ?? 0),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    created_at: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

function validatePromotionInput(body: any, isUpdate = false) {
  const errors: string[] = [];

  const title = body.title !== undefined ? String(body.title).trim() : '';
  if (!isUpdate || body.title !== undefined) {
    if (!title) {
      errors.push('Promotion title is required');
    }
  }

  const imageUrl = (body.image_url ?? body.imageUrl !== undefined ? String(body.image_url ?? body.imageUrl).trim() : '');
  if (!isUpdate || (body.image_url !== undefined || body.imageUrl !== undefined)) {
    if (!imageUrl) {
      errors.push('Promotion image URL is required');
    }
  }

  const active = body.active !== undefined ? (body.active ? 1 : 0) : 1;
  const displayOrderNum = body.display_order !== undefined || body.displayOrder !== undefined
    ? Number(body.display_order ?? body.displayOrder)
    : 0;
  
  if (isNaN(displayOrderNum)) {
    errors.push('Display order must be a valid number');
  }

  const linkType = (body.link_type ?? body.linkType ?? 'NONE').toString().trim().toUpperCase();
  const linkValue = body.link_value ?? body.linkValue ?? null;

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      title,
      subtitle: body.subtitle !== undefined ? (body.subtitle ? String(body.subtitle).trim() : null) : null,
      image_url: imageUrl,
      link_type: linkType || 'NONE',
      link_value: linkValue ? String(linkValue).trim() : null,
      active,
      display_order: isNaN(displayOrderNum) ? 0 : displayOrderNum,
    },
  };
}

/**
 * PUBLIC ROUTE: GET /api/promotions
 * Retrieves only active promotions (active = 1), ordered by display_order ASC, then id ASC.
 */
publicPromotionRoutes.get('/', async (c) => {
  try {
    const query = 'SELECT * FROM promotions WHERE active = 1 ORDER BY display_order ASC, id ASC';
    const { results } = await c.env.DB.prepare(query).all();

    const promotions = (results || []).map(mapRowToPromotion);

    return c.json({
      success: true,
      data: promotions,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to fetch promotions' }, 500);
  }
});

// ADMIN ROUTES - Require Admin Authentication
adminPromotionRoutes.use('*', adminAuthMiddleware);

/**
 * ADMIN ROUTE: GET /api/admin/promotions
 * Retrieves all promotions (active & inactive), ordered by display_order ASC, then id ASC.
 */
adminPromotionRoutes.get('/', async (c) => {
  try {
    const query = 'SELECT * FROM promotions ORDER BY display_order ASC, id ASC';
    const { results } = await c.env.DB.prepare(query).all();

    const promotions = (results || []).map(mapRowToPromotion);

    return c.json({
      success: true,
      data: promotions,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to fetch admin promotions' }, 500);
  }
});

/**
 * ADMIN ROUTE: POST /api/admin/promotions
 * Creates a new promotion.
 */
adminPromotionRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ success: false, error: 'Invalid or missing JSON request body' }, 400);
    }

    const validation = validatePromotionInput(body);
    if (!validation.isValid) {
      return c.json({ success: false, error: validation.errors.join(', ') }, 400);
    }

    const d = validation.data;

    const query = `
      INSERT INTO promotions (title, subtitle, image_url, link_type, link_value, active, display_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const result = await c.env.DB.prepare(query)
      .bind(d.title, d.subtitle, d.image_url, d.link_type, d.link_value, d.active, d.display_order)
      .run();

    const newId = result.meta.last_row_id;
    const createdRow = await c.env.DB.prepare('SELECT * FROM promotions WHERE id = ?').bind(newId).first();

    return c.json(
      {
        success: true,
        data: mapRowToPromotion(createdRow),
      },
      201
    );
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to create promotion' }, 500);
  }
});

/**
 * ADMIN ROUTE: PUT /api/admin/promotions/:id
 * Updates an existing promotion by ID.
 */
adminPromotionRoutes.put('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid promotion ID' }, 400);
    }

    const existing: any = await c.env.DB.prepare('SELECT * FROM promotions WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Promotion not found' }, 404);
    }

    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ success: false, error: 'Invalid or missing JSON request body' }, 400);
    }

    const validation = validatePromotionInput(body, true);
    if (!validation.isValid) {
      return c.json({ success: false, error: validation.errors.join(', ') }, 400);
    }

    const d = validation.data;
    const title = body.title !== undefined ? d.title : existing.title;
    const subtitle = body.subtitle !== undefined ? d.subtitle : existing.subtitle;
    const image_url = (body.image_url !== undefined || body.imageUrl !== undefined) ? d.image_url : existing.image_url;
    const link_type = (body.link_type !== undefined || body.linkType !== undefined) ? d.link_type : existing.link_type;
    const link_value = (body.link_value !== undefined || body.linkValue !== undefined) ? d.link_value : existing.link_value;
    const active = body.active !== undefined ? d.active : existing.active;
    const display_order = (body.display_order !== undefined || body.displayOrder !== undefined) ? d.display_order : existing.display_order;

    const query = `
      UPDATE promotions SET
        title = ?,
        subtitle = ?,
        image_url = ?,
        link_type = ?,
        link_value = ?,
        active = ?,
        display_order = ?
      WHERE id = ?
    `;

    await c.env.DB.prepare(query)
      .bind(title, subtitle, image_url, link_type, link_value, active, display_order, id)
      .run();

    const updatedRow = await c.env.DB.prepare('SELECT * FROM promotions WHERE id = ?').bind(id).first();

    return c.json({
      success: true,
      data: mapRowToPromotion(updatedRow),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to update promotion' }, 500);
  }
});

/**
 * ADMIN ROUTE: PATCH /api/admin/promotions/:id/toggle
 * Toggles active status of a promotion.
 */
adminPromotionRoutes.patch('/:id/toggle', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid promotion ID' }, 400);
    }

    const existing: any = await c.env.DB.prepare('SELECT * FROM promotions WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Promotion not found' }, 404);
    }

    const newActiveState = existing.active === 1 ? 0 : 1;

    await c.env.DB.prepare('UPDATE promotions SET active = ? WHERE id = ?').bind(newActiveState, id).run();
    const updatedRow = await c.env.DB.prepare('SELECT * FROM promotions WHERE id = ?').bind(id).first();

    return c.json({
      success: true,
      data: mapRowToPromotion(updatedRow),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to toggle promotion active status' }, 500);
  }
});

/**
 * ADMIN ROUTE: DELETE /api/admin/promotions/:id
 * Deletes a promotion by ID.
 */
adminPromotionRoutes.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid promotion ID' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT * FROM promotions WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Promotion not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM promotions WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'Promotion deleted successfully',
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to delete promotion' }, 500);
  }
});
