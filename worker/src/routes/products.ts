import { Hono } from 'hono';
import type { Bindings, Product } from '../types';
import { adminAuthMiddleware, type AuthVariables } from '../middleware/auth';

export const productRoutes = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

const ALLOWED_CATEGORIES = new Set(['PICKLES', 'SNACKS']);

export function mapRowToProduct(row: any): Product | null {
  if (!row) return null;
  const isAvailable = row.available === 1 || row.available === true || row.available === '1';
  const isFeatured = row.featured === 1 || row.featured === true || row.featured === '1';

  return {
    id: row.id,
    name: row.name,
    malayalamName: row.malayalam_name ?? row.malayalamName ?? null,
    malayalam_name: row.malayalam_name ?? row.malayalamName ?? null,
    description: row.description ?? null,
    price: Number(row.price),
    unit: row.unit ?? null,
    category: row.category,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    image_url: row.image_url ?? row.imageUrl ?? null,
    imageKey: row.image_key ?? row.imageKey ?? null,
    image_key: row.image_key ?? row.imageKey ?? null,
    imageContentType: row.image_content_type ?? row.imageContentType ?? null,
    image_content_type: row.image_content_type ?? row.imageContentType ?? null,
    available: isAvailable,
    featured: isFeatured,
    preparationTime: row.preparation_time ?? row.preparationTime ?? null,
    preparation_time: row.preparation_time ?? row.preparationTime ?? null,
  };
}

function validateProductInput(body: any, isUpdate = false) {
  const errors: string[] = [];

  const name = body.name !== undefined ? String(body.name).trim() : '';
  if (!isUpdate || body.name !== undefined) {
    if (!name) {
      errors.push('Product name is required');
    }
  }

  const categoryRaw = body.category !== undefined ? String(body.category).trim().toUpperCase() : '';
  if (!isUpdate || body.category !== undefined) {
    if (!categoryRaw) {
      errors.push('Category is required');
    } else if (!ALLOWED_CATEGORIES.has(categoryRaw)) {
      errors.push('Category must be either PICKLES or SNACKS');
    }
  }

  const priceNum = Number(body.price);
  if (!isUpdate || body.price !== undefined) {
    if (body.price === undefined || body.price === null || isNaN(priceNum)) {
      errors.push('Price is required and must be a number');
    } else if (priceNum <= 0) {
      errors.push('Price must be greater than zero');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      name,
      malayalam_name: body.malayalam_name ?? body.malayalamName ?? null,
      description: body.description ?? null,
      price: priceNum,
      unit: body.unit ?? null,
      category: categoryRaw,
      image_url: body.image_url ?? body.imageUrl ?? null,
      image_key: body.image_key ?? body.imageKey ?? null,
      image_content_type: body.image_content_type ?? body.imageContentType ?? null,
      available: body.available !== undefined ? (body.available ? 1 : 0) : 1,
      featured: body.featured !== undefined ? (body.featured ? 1 : 0) : 0,
      preparation_time: body.preparation_time ?? body.preparationTime ?? null,
    },
  };
}

/**
 * GET /api/products
 * Retrieves all products. Supports filtering by ?category=PICKLES or ?category=SNACKS and ?available=true
 */
productRoutes.get('/', async (c) => {
  try {
    const categoryParam = c.req.query('category')?.trim().toUpperCase();
    const availableParam = c.req.query('available');

    let query = 'SELECT * FROM products';
    const conditions: string[] = [];
    const params: any[] = [];

    if (categoryParam && categoryParam !== 'ALL') {
      conditions.push('UPPER(category) = ?');
      params.push(categoryParam);
    }

    if (availableParam !== undefined) {
      const isAvail = availableParam === 'true' || availableParam === '1';
      conditions.push('available = ?');
      params.push(isAvail ? 1 : 0);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';

    const stmt = c.env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    const products = (results || []).map(mapRowToProduct);

    return c.json({
      success: true,
      data: products,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to fetch products' }, 500);
  }
});

/**
 * GET /api/products/:id
 * Retrieves a single product by ID.
 */
productRoutes.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid product ID' }, 400);
    }

    const row = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!row) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }

    return c.json({
      success: true,
      data: mapRowToProduct(row),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to fetch product' }, 500);
  }
});

/**
 * POST /api/products
 * Creates a new product. (Protected: Requires Admin Authentication)
 */
productRoutes.post('/', adminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ success: false, error: 'Invalid or missing JSON request body' }, 400);
    }

    const validation = validateProductInput(body);
    if (!validation.isValid) {
      return c.json({ success: false, error: validation.errors.join(', ') }, 400);
    }

    const d = validation.data;

    const query = `
      INSERT INTO products (
        name, malayalam_name, description, price, unit, category,
        image_url, image_key, image_content_type, available, featured, preparation_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await c.env.DB.prepare(query)
      .bind(
        d.name,
        d.malayalam_name,
        d.description,
        d.price,
        d.unit,
        d.category,
        d.image_url,
        d.image_key,
        d.image_content_type,
        d.available,
        d.featured,
        d.preparation_time
      )
      .run();

    const newId = result.meta.last_row_id;
    const createdRow = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(newId).first();

    return c.json(
      {
        success: true,
        data: mapRowToProduct(createdRow),
      },
      201
    );
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to create product' }, 500);
  }
});

/**
 * PUT /api/products/:id
 * Updates an existing product. (Protected: Requires Admin Authentication)
 */
productRoutes.put('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid product ID' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }

    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ success: false, error: 'Invalid or missing JSON request body' }, 400);
    }

    const validation = validateProductInput(body, true);
    if (!validation.isValid) {
      return c.json({ success: false, error: validation.errors.join(', ') }, 400);
    }

    const d = validation.data;
    const name = body.name !== undefined ? d.name : (existing as any).name;
    const malayalam_name = body.malayalam_name !== undefined || body.malayalamName !== undefined ? d.malayalam_name : (existing as any).malayalam_name;
    const description = body.description !== undefined ? d.description : (existing as any).description;
    const price = body.price !== undefined ? d.price : (existing as any).price;
    const unit = body.unit !== undefined ? d.unit : (existing as any).unit;
    const category = body.category !== undefined ? d.category : (existing as any).category;
    const image_url = body.image_url !== undefined || body.imageUrl !== undefined ? d.image_url : (existing as any).image_url;
    const image_key = body.image_key !== undefined || body.imageKey !== undefined ? d.image_key : (existing as any).image_key;
    const image_content_type = body.image_content_type !== undefined || body.imageContentType !== undefined ? d.image_content_type : (existing as any).image_content_type;
    const available = body.available !== undefined ? d.available : (existing as any).available;
    const featured = body.featured !== undefined ? d.featured : (existing as any).featured;
    const preparation_time = body.preparation_time !== undefined || body.preparationTime !== undefined ? d.preparation_time : (existing as any).preparation_time;

    const query = `
      UPDATE products SET
        name = ?,
        malayalam_name = ?,
        description = ?,
        price = ?,
        unit = ?,
        category = ?,
        image_url = ?,
        image_key = ?,
        image_content_type = ?,
        available = ?,
        featured = ?,
        preparation_time = ?
      WHERE id = ?
    `;

    await c.env.DB.prepare(query)
      .bind(
        name,
        malayalam_name,
        description,
        price,
        unit,
        category,
        image_url,
        image_key,
        image_content_type,
        available,
        featured,
        preparation_time,
        id
      )
      .run();

    const updatedRow = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();

    return c.json({
      success: true,
      data: mapRowToProduct(updatedRow),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to update product' }, 500);
  }
});

/**
 * DELETE /api/products/:id
 * Deletes a product by ID. (Protected: Requires Admin Authentication)
 */
productRoutes.delete('/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid product ID' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to delete product' }, 500);
  }
});
