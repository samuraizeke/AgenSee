-- AgenSee Storage Bucket Setup
-- Run this in the Supabase SQL Editor AFTER running schema.sql

-- ============================================
-- CREATE STORAGE BUCKET
-- ============================================

-- Insert the documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,  -- Private bucket (requires auth)
    52428800,  -- 50MB max file size
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow authenticated users to read their files
CREATE POLICY "Allow authenticated reads from documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Policy: Allow authenticated users to update their files
CREATE POLICY "Allow authenticated updates to documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated deletes from documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
