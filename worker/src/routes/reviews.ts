import { Hono } from 'hono';
import type { Bindings, Review } from '../types';
import { adminAuthMiddleware, type AuthVariables } from '../middleware/auth';

export const publicReviewRoutes = new Hono<{ Bindings: Bindings }>();
export const adminReviewRoutes = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

export function mapRowToReview(row: any): Review | null {
  if (!row) return null;
  const isApproved = row.approved === 1 || row.approved === true || row.approved === '1';
  const isFeatured = row.is_featured === 1 || row.is_featured === true || row.is_featured === '1';

  return {
    id: row.id,
    customerName: row.customer_name ?? row.customerName ?? '',
    customer_name: row.customer_name ?? row.customerName ?? '',
    rating: Number(row.rating),
    reviewText: row.review_text ?? row.reviewText ?? '',
    review_text: row.review_text ?? row.reviewText ?? '',
    productName: row.product_name ?? row.productName ?? null,
    product_name: row.product_name ?? row.productName ?? null,
    productId: row.product_id ?? row.productId ?? null,
    product_id: row.product_id ?? row.productId ?? null,
    approved: isApproved,
    isFeatured: isFeatured,
    is_featured: isFeatured,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    created_at: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

/**
 * PUBLIC ROUTE: POST /api/reviews
 * Submits a new customer review. (Always defaults to unapproved state: approved = 0)
 */
publicReviewRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ success: false, error: 'Invalid or missing JSON request body' }, 400);
    }

    const customerName = (body.customer_name ?? body.customerName ?? '').toString().trim();
    const reviewText = (body.review_text ?? body.reviewText ?? '').toString().trim();
    let productName = (body.product_name ?? body.productName ?? '').toString().trim() || null;
    let productId = body.product_id !== undefined || body.productId !== undefined
      ? Number(body.product_id ?? body.productId)
      : null;

    if (productId !== null && isNaN(productId)) {
      return c.json({ success: false, error: 'Invalid product ID' }, 400);
    }

    const ratingNum = Number(body.rating);
    const errors: string[] = [];

    if (!customerName) {
      errors.push('Customer name is required');
    }

    if (body.rating === undefined || body.rating === null || isNaN(ratingNum)) {
      errors.push('Rating is required and must be a number');
    } else if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      errors.push('Rating must be an integer between 1 and 5');
    }

    if (!reviewText) {
      errors.push('Review text is required');
    }

    if (productId !== null) {
      const productRow: any = await c.env.DB.prepare('SELECT id, name FROM products WHERE id = ?').bind(productId).first();
      if (!productRow) {
        return c.json({ success: false, error: 'Product not found' }, 404);
      }
      if (!productName) {
        productName = productRow.name;
      }
    }

    if (errors.length > 0) {
      return c.json({ success: false, error: errors.join(', ') }, 400);
    }

    // Force approved = 0, is_featured = 0 for public review submissions
    const query = `
      INSERT INTO reviews (customer_name, rating, review_text, product_name, product_id, approved, is_featured, created_at)
      VALUES (?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)
    `;

    const result = await c.env.DB.prepare(query)
      .bind(customerName, ratingNum, reviewText, productName, productId)
      .run();

    const newId = result.meta.last_row_id;
    const createdRow = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(newId).first();

    return c.json(
      {
        success: true,
        data: mapRowToReview(createdRow),
      },
      201
    );
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to submit review' }, 500);
  }
});

/**
 * PUBLIC ROUTE: GET /api/reviews
 * Retrieves only approved customer reviews (approved = 1), ordered newest first.
 * Supports optional ?product_id=123 filter to return approved reviews for a specific product.
 */
publicReviewRoutes.get('/', async (c) => {
  try {
    const productIdParam = c.req.query('product_id') ?? c.req.query('productId');
    const featuredParam = c.req.query('featured') ?? c.req.query('is_featured') ?? c.req.query('isFeatured');
    let query = 'SELECT * FROM reviews WHERE approved = 1';
    const params: any[] = [];

    if (productIdParam !== undefined && productIdParam !== null && productIdParam !== '') {
      const pId = Number(productIdParam);
      if (isNaN(pId)) {
        return c.json({ success: false, error: 'Invalid product ID filter' }, 400);
      }
      query += ' AND product_id = ?';
      params.push(pId);
    }

    if (featuredParam === 'true' || featuredParam === '1') {
      query += ' AND is_featured = 1';
    }

    query += ' ORDER BY created_at DESC, id DESC';

    const stmt = c.env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    const reviews = (results || []).map(mapRowToReview);

    return c.json({
      success: true,
      data: reviews,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to fetch reviews' }, 500);
  }
});

// ADMIN ROUTES - Require Admin Authentication
adminReviewRoutes.use('*', adminAuthMiddleware);

/**
 * ADMIN ROUTE: GET /api/admin/reviews
 * Retrieves all reviews (approved & unapproved) for moderation, ordered newest first.
 */
adminReviewRoutes.get('/', async (c) => {
  try {
    const query = 'SELECT * FROM reviews ORDER BY created_at DESC, id DESC';
    const { results } = await c.env.DB.prepare(query).all();

    const reviews = (results || []).map(mapRowToReview);

    return c.json({
      success: true,
      data: reviews,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to fetch admin reviews' }, 500);
  }
});

/**
 * ADMIN ROUTE: PUT/PATCH /api/admin/reviews/:id/approve
 * Approves a review (sets approved = 1).
 */
const handleApprove = async (c: any) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid review ID' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Review not found' }, 404);
    }

    await c.env.DB.prepare('UPDATE reviews SET approved = 1 WHERE id = ?').bind(id).run();
    const updatedRow = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();

    return c.json({
      success: true,
      data: mapRowToReview(updatedRow),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to approve review' }, 500);
  }
};

adminReviewRoutes.put('/:id/approve', handleApprove);
adminReviewRoutes.patch('/:id/approve', handleApprove);

/**
 * ADMIN ROUTE: PUT/PATCH /api/admin/reviews/:id/reject & /hide
 * Rejects/hides a review (sets approved = 0).
 */
const handleReject = async (c: any) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid review ID' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Review not found' }, 404);
    }

    await c.env.DB.prepare('UPDATE reviews SET approved = 0 WHERE id = ?').bind(id).run();
    const updatedRow = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();

    return c.json({
      success: true,
      data: mapRowToReview(updatedRow),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to reject review' }, 500);
  }
};

adminReviewRoutes.put('/:id/reject', handleReject);
adminReviewRoutes.patch('/:id/reject', handleReject);
adminReviewRoutes.put('/:id/hide', handleReject);
adminReviewRoutes.patch('/:id/hide', handleReject);

/**
 * ADMIN ROUTE: PUT/PATCH /api/admin/reviews/:id/feature
 * Toggles featured status (is_featured = 1 / 0) for "Try Our New Flavours" / homepage featured reviews.
 */
const handleFeatureToggle = async (c: any) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid review ID' }, 400);
    }

    const existing: any = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Review not found' }, 404);
    }

    const newFeaturedState = existing.is_featured === 1 ? 0 : 1;

    await c.env.DB.prepare('UPDATE reviews SET is_featured = ? WHERE id = ?').bind(newFeaturedState, id).run();
    const updatedRow = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();

    return c.json({
      success: true,
      data: mapRowToReview(updatedRow),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to toggle review featured status' }, 500);
  }
};

adminReviewRoutes.put('/:id/feature', handleFeatureToggle);
adminReviewRoutes.patch('/:id/feature', handleFeatureToggle);

/**
 * ADMIN ROUTE: DELETE /api/admin/reviews/:id
 * Deletes a review by ID.
 */
adminReviewRoutes.delete('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid review ID' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, error: 'Review not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to delete review' }, 500);
  }
});
