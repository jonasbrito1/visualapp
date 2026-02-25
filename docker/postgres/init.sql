-- VisualApp - PostgreSQL Initialization
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for text search

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE visualapp_db TO visualapp;
