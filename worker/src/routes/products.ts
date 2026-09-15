import { Hono } from 'hono';
import type { Bindings, Product, WeightOption, NutritionInfo } from '../types';
import { adminAuthMiddleware, type AuthVariables } from '../middleware/auth';

export const productRoutes = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

const ALLOWED_CATEGORIES = new Set(['PICKLES', 'SNACKS']);

export function mapRowToProduct(row: any): Product | null {
  if (!row) return null;
  const isAvailable = row.available === 1 || row.available === true || row.available === '1';
  const isFeatured = row.featured === 1 || row.featured === true || row.featured === '1';

  const imageUrl1 = row.image_url ?? row.imageUrl ?? null;
  const imageUrl2 = row.image_url_2 ?? row.imageUrl2 ?? null;
  const imageUrl3 = row.image_url_3 ?? row.imageUrl3 ?? null;

  const imagesList: string[] = [];
  if (imageUrl1 && typeof imageUrl1 === 'string' && imageUrl1.trim()) imagesList.push(imageUrl1.trim());
  if (imageUrl2 && typeof imageUrl2 === 'string' && imageUrl2.trim()) imagesList.push(imageUrl2.trim());
  if (imageUrl3 && typeof imageUrl3 === 'string' && imageUrl3.trim()) imagesList.push(imageUrl3.trim());

  let parsedWeightOptions: WeightOption[] | null = null;
  if (row.weight_options || row.weightOptions) {
    const rawWo = row.weight_options ?? row.weightOptions;
    if (typeof rawWo === 'string') {
      try {
        parsedWeightOptions = JSON.parse(rawWo);
      } catch {
        parsedWeightOptions = null;
      }
    } else if (Array.isArray(rawWo)) {
      parsedWeightOptions = rawWo;
    }
  }

  let parsedNutritionInfo: NutritionInfo | null = null;
  if (row.nutrition_info || row.nutritionInfo) {
    const rawNi = row.nutrition_info ?? row.nutritionInfo;
    if (typeof rawNi === 'string') {
      try {
        parsedNutritionInfo = JSON.parse(rawNi);
      } catch {
        parsedNutritionInfo = null;
      }
    } else if (typeof rawNi === 'object' && rawNi !== null) {
      parsedNutritionInfo = rawNi;
    }
  }

  return {
    id: row.id,
    name: row.name,
    malayalamName: row.malayalam_name ?? row.malayalamName ?? null,
    malayalam_name: row.malayalam_name ?? row.malayalamName ?? null,
    description: row.description ?? null,
    price: Number(row.price),
    unit: row.unit ?? null,
    category: row.category,
    imageUrl: imageUrl1,
    image_url: imageUrl1,
    imageUrl2: imageUrl2,
    image_url_2: imageUrl2,
    imageUrl3: imageUrl3,
    image_url_3: imageUrl3,
    images: imagesList,
    imageKey: row.image_key ?? row.imageKey ?? null,
    image_key: row.image_key ?? row.imageKey ?? null,
    imageContentType: row.image_content_type ?? row.imageContentType ?? null,
    image_content_type: row.image_content_type ?? row.imageContentType ?? null,
    available: isAvailable,
    featured: isFeatured,
    preparationTime: row.preparation_time ?? row.preparationTime ?? null,
    preparation_time: row.preparation_time ?? row.preparationTime ?? null,
    weightOptions: parsedWeightOptions,
    weight_options: parsedWeightOptions,
    nutritionInfo: parsedNutritionInfo,
    nutrition_info: parsedNutritionInfo,
  };
}

function parseAndValidateWeightOptions(input: any): { isValid: boolean; error?: string; data?: WeightOption[] | null } {
  if (input === undefined || input === null || input === '') {
    return { isValid: true, data: null };
  }

  let rawList = input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed || trimmed === 'null' || trimmed === '[]') {
      return { isValid: true, data: null };
    }
    try {
      rawList = JSON.parse(trimmed);
    } catch {
      return { isValid: false, error: 'weight_options must be valid JSON' };
    }
  }

  if (!Array.isArray(rawList)) {
    return { isValid: false, error: 'weight_options must be an array' };
  }

  if (rawList.length === 0) {
    return { isValid: true, data: null };
  }

  if (rawList.length > 20) {
    return { isValid: false, error: 'Too many weight options (maximum 20)' };
  }

  const validated: WeightOption[] = [];
  const seenUnits = new Set<string>();

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (typeof item !== 'object' || item === null) {
      return { isValid: false, error: `Weight option at index ${i} must be an object` };
    }

    const unitRaw = item.unit;
    const priceRaw = item.price;

    if (unitRaw === undefined || unitRaw === null || String(unitRaw).trim() === '') {
      return { isValid: false, error: `Weight option at index ${i} has an empty or missing unit` };
    }

    const unitStr = String(unitRaw).trim();
    if (unitStr.length > 50) {
      return { isValid: false, error: `Weight option unit "${unitStr}" exceeds maximum length of 50 characters` };
    }

    const priceNum = Number(priceRaw);
    if (priceRaw === undefined || priceRaw === null || isNaN(priceNum) || priceNum <= 0) {
      return { isValid: false, error: `Weight option "${unitStr}" has an invalid price (must be a number > 0)` };
    }

    const unitNormalized = unitStr.toLowerCase();
    if (seenUnits.has(unitNormalized)) {
      return { isValid: false, error: `Duplicate weight option unit "${unitStr}" is not allowed` };
    }
    seenUnits.add(unitNormalized);

    validated.push({
      unit: unitStr,
      price: priceNum,
    });
  }

  return { isValid: true, data: validated };
}

function parseAndValidateNutritionInfo(input: any): { isValid: boolean; error?: string; data?: NutritionInfo | null } {
  if (input === undefined || input === null || input === '') {
    return { isValid: true, data: null };
  }

  let rawObj = input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed || trimmed === 'null' || trimmed === '{}') {
      return { isValid: true, data: null };
    }
    try {
      rawObj = JSON.parse(trimmed);
    } catch {
      return { isValid: false, error: 'nutrition_info must be valid JSON' };
    }
  }

  if (typeof rawObj !== 'object' || rawObj === null || Array.isArray(rawObj)) {
    return { isValid: false, error: 'nutrition_info must be an object' };
  }

  const keys = Object.keys(rawObj);
  if (keys.length === 0) {
    return { isValid: true, data: null };
  }

  const numericFields = [
    'energy_kcal', 'energyKcal',
    'protein_g', 'proteinG',
    'carbohydrate_g', 'carbohydrateG',
    'total_sugar_g', 'totalSugarG',
    'added_sugar_g', 'addedSugarG',
    'dietary_fibre_g', 'dietaryFibreG',
    'total_fat_g', 'totalFatG',
    'saturated_fat_g', 'saturatedFatG',
    'trans_fat_g', 'transFatG',
    'cholesterol_mg', 'cholesterolMg',
    'sodium_mg', 'sodiumMg'
  ];

  for (const field of numericFields) {
    if (rawObj[field] !== undefined && rawObj[field] !== null) {
      const val = Number(rawObj[field]);
      if (isNaN(val) || val < 0) {
        return { isValid: false, error: `Nutrition info field ${field} must be a number >= 0` };
      }
    }
  }

  return { isValid: true, data: rawObj };
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

  // Multi-image parsing
  let img1: string | null = body.image_url ?? body.imageUrl ?? null;
  let img2: string | null = body.image_url_2 ?? body.imageUrl2 ?? null;
  let img3: string | null = body.image_url_3 ?? body.imageUrl3 ?? null;

  if (Array.isArray(body.images)) {
    const validImages = body.images.filter((img: any) => typeof img === 'string' && img.trim() !== '').map((img: string) => img.trim());
    if (validImages.length > 3) {
      errors.push('Maximum 3 product images allowed');
    } else {
      if (validImages.length > 0) img1 = validImages[0];
      if (validImages.length > 1) img2 = validImages[1];
      if (validImages.length > 2) img3 = validImages[2];
    }
  } else {
    let count = 0;
    if (img1 && String(img1).trim()) count++;
    if (img2 && String(img2).trim()) count++;
    if (img3 && String(img3).trim()) count++;
    if (count > 3) {
      errors.push('Maximum 3 product images allowed');
    }
  }

  // Weight options validation
  const woValidation = parseAndValidateWeightOptions(body.weight_options ?? body.weightOptions);
  if (!woValidation.isValid) {
    errors.push(woValidation.error!);
  }

  // Nutrition info validation
  const niValidation = parseAndValidateNutritionInfo(body.nutrition_info ?? body.nutritionInfo);
  if (!niValidation.isValid) {
    errors.push(niValidation.error!);
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
      image_url: img1 ? String(img1).trim() : null,
      image_url_2: img2 ? String(img2).trim() : null,
      image_url_3: img3 ? String(img3).trim() : null,
      image_key: body.image_key ?? body.imageKey ?? null,
      image_content_type: body.image_content_type ?? body.imageContentType ?? null,
      available: body.available !== undefined ? (body.available ? 1 : 0) : 1,
      featured: body.featured !== undefined ? (body.featured ? 1 : 0) : 0,
      preparation_time: body.preparation_time ?? body.preparationTime ?? null,
      weight_options: woValidation.data ? JSON.stringify(woValidation.data) : null,
      nutrition_info: niValidation.data ? JSON.stringify(niValidation.data) : null,
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
        image_url, image_url_2, image_url_3, image_key, image_content_type,
        available, featured, preparation_time, weight_options, nutrition_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        d.image_url_2,
        d.image_url_3,
        d.image_key,
        d.image_content_type,
        d.available,
        d.featured,
        d.preparation_time,
        d.weight_options,
        d.nutrition_info
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

    const existing: any = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
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
    const name = body.name !== undefined ? d.name : existing.name;
    const malayalam_name = (body.malayalam_name !== undefined || body.malayalamName !== undefined) ? d.malayalam_name : existing.malayalam_name;
    const description = body.description !== undefined ? d.description : existing.description;
    const price = body.price !== undefined ? d.price : existing.price;
    const unit = body.unit !== undefined ? d.unit : existing.unit;
    const category = body.category !== undefined ? d.category : existing.category;
    const image_url = (body.image_url !== undefined || body.imageUrl !== undefined || body.images !== undefined) ? d.image_url : existing.image_url;
    const image_url_2 = (body.image_url_2 !== undefined || body.imageUrl2 !== undefined || body.images !== undefined) ? d.image_url_2 : existing.image_url_2;
    const image_url_3 = (body.image_url_3 !== undefined || body.imageUrl3 !== undefined || body.images !== undefined) ? d.image_url_3 : existing.image_url_3;
    const image_key = (body.image_key !== undefined || body.imageKey !== undefined) ? d.image_key : existing.image_key;
    const image_content_type = (body.image_content_type !== undefined || body.imageContentType !== undefined) ? d.image_content_type : existing.image_content_type;
    const available = body.available !== undefined ? d.available : existing.available;
    const featured = body.featured !== undefined ? d.featured : existing.featured;
    const preparation_time = (body.preparation_time !== undefined || body.preparationTime !== undefined) ? d.preparation_time : existing.preparation_time;
    const weight_options = (body.weight_options !== undefined || body.weightOptions !== undefined) ? d.weight_options : existing.weight_options;
    const nutrition_info = (body.nutrition_info !== undefined || body.nutritionInfo !== undefined) ? d.nutrition_info : existing.nutrition_info;

    const query = `
      UPDATE products SET
        name = ?,
        malayalam_name = ?,
        description = ?,
        price = ?,
        unit = ?,
        category = ?,
        image_url = ?,
        image_url_2 = ?,
        image_url_3 = ?,
        image_key = ?,
        image_content_type = ?,
        available = ?,
        featured = ?,
        preparation_time = ?,
        weight_options = ?,
        nutrition_info = ?
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
        image_url_2,
        image_url_3,
        image_key,
        image_content_type,
        available,
        featured,
        preparation_time,
        weight_options,
        nutrition_info,
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
