import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Bindings } from './types';
import { validateImageFile, uploadToCloudinary } from './services/cloudinary';
import { productRoutes } from './routes/products';
import { authRoutes } from './routes/auth';
import { publicReviewRoutes, adminReviewRoutes } from './routes/reviews';
import { adminAuthMiddleware, type AuthVariables } from './middleware/auth';

const app = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

app.use('*', async (c, next) => {
  const allowedOrigins = c.env?.CORS_ALLOWED_ORIGINS
    ? c.env.CORS_ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : [
        'https://silvys-kitchen.pages.dev',
        'https://silvys-kitchen-admin.pages.dev',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:4173',
        'http://127.0.0.1:8080',
      ];

  const corsMiddleware = cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.silvys-kitchen.pages.dev') ||
        origin.endsWith('.silvys-kitchen-admin.pages.dev') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return origin;
      }
      return allowedOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['*'],
    credentials: true,
  });
  return corsMiddleware(c, next);
});

app.get('/', (c) => {
  return c.json({ message: "Silvy's Kitchen Cloudflare Worker API is online" });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'silvys-kitchen-api' });
});

app.route('/api/products', productRoutes);
app.route('/api/admin', authRoutes);
app.route('/api/reviews', publicReviewRoutes);
app.route('/api/admin/reviews', adminReviewRoutes);

const handleImageUpload = async (c: any) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['file'] || formData['image'];

    const validatedFile = validateImageFile(file);

    const result = await uploadToCloudinary(validatedFile, {
      cloudName: c.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: c.env.CLOUDINARY_API_KEY || '',
      apiSecret: c.env.CLOUDINARY_API_SECRET || '',
    });

    return c.json({
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      },
    });
  } catch (err: any) {
    const errorMessage = err.message || 'Image upload failed';
    const isValidationError =
      errorMessage.includes('No image file') ||
      errorMessage.includes('Unsupported image format') ||
      errorMessage.includes('exceeds maximum limit');

    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      isValidationError ? 400 : 500
    );
  }
};

/**
 * PRODUCTION ADMIN ENDPOINT: POST /api/admin/upload-image
 * Protected: Requires Admin Authentication.
 * Uploads an image to Cloudinary and returns safe metadata.
 */
app.post('/api/admin/upload-image', adminAuthMiddleware, handleImageUpload);

/**
 * TEMPORARY / TEST-ONLY ENDPOINT: POST /api/test/cloudinary-upload
 * Retained for backward test suite compatibility.
 * Protected: Requires Admin Authentication.
 */
app.post('/api/test/cloudinary-upload', adminAuthMiddleware, handleImageUpload);

export default app;

