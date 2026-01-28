-- Run this in psql or pgAdmin to create the database
-- psql -U postgres -f scripts/create-database.sql

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE maxai'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'maxai')\gexec
