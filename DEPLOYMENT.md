# Silvy's Kitchen — Production Deployment Guide

## System Architecture

Silvy's Kitchen consists of three decoupled components:
1. **Customer Web (`customer-web`)**: Vite + React SPA (Mobile-first customer website).
2. **Admin Web (`admin-web`)**: Vite + React SPA (Mobile-first admin panel).
3. **Backend (`backend`)**: Spring Boot REST API + JPA + PostgreSQL / H2 database.

---

## 1. Spring Boot Backend Deployment

Deploy the backend to any Java container host (e.g. Render, Railway, AWS Elastic Beanstalk, Heroku, or Docker).

### Required Environment Variables
| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC Connection String | `jdbc:postgresql://<host>:5432/<dbname>` |
| `SPRING_DATASOURCE_USERNAME` | Database User | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database Password | `<secure-db-password>` |
| `SPRING_DATASOURCE_DRIVER` | Driver Class | `org.postgresql.Driver` |
| `ADMIN_USERNAME` | Production Admin Username | `admin` |
| `ADMIN_PASSWORD` | Production Admin Password | `<secure-admin-password>` |
| `CORS_ALLOWED_ORIGINS` | Frontends allowed to access API | `https://customer.yourdomain.com,https://admin.yourdomain.com` |
| `SPRING_H2_CONSOLE_ENABLED` | H2 Console (Disable for prod) | `false` |
| `WHATSAPP_PHONE_NUMBER` | Official WhatsApp Contact Number | `917639164647` |

### Build Command
```bash
cd backend
../tools/maven/apache-maven-3.9.6/bin/mvn clean package -DskipTests
# Result artifact: backend/target/silvys-kitchen-backend-1.0.0.jar
```

---

## 2. Customer Web Deployment (`customer-web`)

Deploy to Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.

### Environment Variables
| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of deployed Spring Boot backend | `https://silvys-backend.onrender.com` |

### Build Command
```bash
cd customer-web
npm install
npm run build
# Deploy output folder: customer-web/dist
```

---

## 3. Admin Web Deployment (`admin-web`)

Deploy to Vercel, Netlify, Cloudflare Pages, or separate sub-domain.

### Environment Variables
| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of deployed Spring Boot backend | `https://silvys-backend.onrender.com` |

### Build Command
```bash
cd admin-web
npm install
npm run build
# Deploy output folder: admin-web/dist
```

---

## 4. PostgreSQL Database Setup

1. Provision a PostgreSQL instance (e.g. Supabase, Neon, Render Postgres, AWS RDS).
2. Set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, and `SPRING_DATASOURCE_DRIVER=org.postgresql.Driver`.
3. Hibernate automatically creates required tables (`products`, `admin_users`, `reviews`) and stores uploaded image byte streams cleanly in the database (`image_data` BYTEA column).
