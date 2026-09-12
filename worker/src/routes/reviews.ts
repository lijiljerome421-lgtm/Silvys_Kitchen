import { Hono } from 'hono';
import type { Bindings, Review } from '../types';
import { adminAuthMiddleware, type AuthVariables } from '../middleware/auth';

export const publicReviewRoutes = new Hono<{ Bindings: Bindings }>();
export const adminReviewRoutes = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

export function mapRowToReview(row: any): Review | null {
  if (!row) return null;
  const isApproved = row.approved === 1 || row.approved === true || row.approved === '1';

  return {
    id: row.id,
    customerName: row.customer_name ?? row.customerName ?? '',
    customer_name: row.customer_name ?? row.customerName ?? '',
    rating: Number(row.rating),
    reviewText: row.review_text ?? row.reviewText ?? '',
    review_text: row.review_text ?? row.reviewText ?? '',
    productName: row.product_name ?? row.productName ?? null,
    product_name: row.product_name ?? row.productName ?? null,
    approved: isApproved,
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
    const productName = (body.product_name ?? body.productName ?? '').toString().trim() || null;
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

    if (errors.length > 0) {
      return c.json({ success: false, error: errors.join(', ') }, 400);
    }

    // Force approved = 0 for public review submissions
    const query = `
      INSERT INTO reviews (customer_name, rating, review_text, product_name, approved, created_at)
      VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `;

    const result = await c.env.DB.prepare(query)
      .bind(customerName, ratingNum, reviewText, productName)
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
 */
publicReviewRoutes.get('/', async (c) => {
  try {
    const query = 'SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC, id DESC';
    const { results } = await c.env.DB.prepare(query).all();

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
