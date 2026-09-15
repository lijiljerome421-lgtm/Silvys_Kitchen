-- Non-destructive local D1 Migration for Silvy's Kitchen post-launch improvements

PRAGMA foreign_keys = ON;

-- 1. Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_type TEXT DEFAULT 'NONE',
    link_value TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_promotions_active_order ON promotions(active, display_order ASC, id ASC);

-- 2. Product Multi-Image, Weight Options & Nutrition Info
ALTER TABLE products ADD COLUMN image_url_2 TEXT;
ALTER TABLE products ADD COLUMN image_url_3 TEXT;
ALTER TABLE products ADD COLUMN weight_options TEXT;
ALTER TABLE products ADD COLUMN nutrition_info TEXT;

-- 3. Product-Specific Reviews & Featured Reviews
ALTER TABLE reviews ADD COLUMN product_id INTEGER REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN is_featured INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_featured ON reviews(is_featured);

-- 4. Map existing reviews to product IDs
UPDATE reviews SET product_id = 1 WHERE id = 2 AND (product_name LIKE '%Chicken%' OR product_id IS NULL);
UPDATE reviews SET product_id = 4 WHERE id = 3 AND (product_name LIKE '%Achappam%' OR product_id IS NULL);
UPDATE reviews SET product_id = 2 WHERE id = 4 AND (product_name LIKE '%Beef%' OR product_id IS NULL);
