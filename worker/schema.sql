-- Cloudflare D1 (SQLite) Database Schema for Silvy's Kitchen
-- Derived from Spring Boot backend entities: Product, AdminUser, Review, SessionService

PRAGMA foreign_keys = ON;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    malayalam_name TEXT,
    description TEXT,
    price REAL NOT NULL CHECK(price > 0),
    unit TEXT,
    category TEXT NOT NULL,
    image_url TEXT,
    image_key TEXT,
    image_content_type TEXT DEFAULT 'image/jpeg',
    available INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    preparation_time TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_category_available ON products(category, available);

-- 2. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    product_name TEXT,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved_created_at ON reviews(approved, created_at DESC);

-- 4. Sessions Table (for Edge Worker admin session persistence)
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    expires_at TEXT,
    FOREIGN KEY (username) REFERENCES admin_users(username) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_username ON sessions(username);
