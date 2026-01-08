import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Document, ApiResponse, PaginatedResponse } from '../types/index.js';

const router = Router();

// Validation schemas
const createDocumentSchema = z.object({
  client_id: z.string().uuid().optional().nullable(),
  policy_id: z.string().uuid().optional().nullable(),
  file_name: z.string().min(1).max(255),
  file_path: z.string().min(1),
  file_size: z.number().optional().nullable(),
  mime_type: z.string().max(100).optional().nullable(),
});

// GET /api/documents - List all documents
router.get('/', async (req: Request, res: Response<ApiResponse<PaginatedResponse<Document>>>) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const clientId = req.query.client_id as string | undefined;
  const policyId = req.query.policy_id as string | undefined;
  const sortBy = (req.query.sortBy as string) || 'uploaded_at';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

  const offset = (page - 1) * limit;

  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' });

  // Apply filters
  if (clientId) {
    query = query.eq('client_id', clientId);
  }
  if (policyId) {
    query = query.eq('policy_id', policyId);
  }

  // Apply sorting and pagination
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    data: {
      data: data as Document[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

// GET /api/documents/:id - Get single document
router.get('/:id', async (req: Request, res: Response<ApiResponse<Document>>) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError('Document not found', 404);
    }
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    data: data as Document,
  });
});

// GET /api/documents/:id/url - Get signed URL for document download
router.get('/:id/url', async (req: Request, res: Response<ApiResponse<{ url: string }>>) => {
  const { id } = req.params;
  const expiresIn = parseInt(req.query.expiresIn as string) || 3600; // Default 1 hour

  // Get document record
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .single();

  if (docError || !doc) {
    throw new AppError('Document not found', 404);
  }

  // Generate signed URL
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.file_path, expiresIn);

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    data: { url: data.signedUrl },
  });
});

// POST /api/documents/upload-url - Get signed URL for upload
router.post('/upload-url', async (req: Request, res: Response<ApiResponse<{ url: string; path: string }>>) => {
  const { fileName, contentType, clientId, policyId } = req.body;

  if (!fileName) {
    throw new AppError('fileName is required', 400);
  }

  // Generate unique file path
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  let path = '';

  if (clientId) {
    path = `clients/${clientId}/${timestamp}-${sanitizedFileName}`;
  } else if (policyId) {
    path = `policies/${policyId}/${timestamp}-${sanitizedFileName}`;
  } else {
    path = `general/${timestamp}-${sanitizedFileName}`;
  }

  // Generate signed upload URL
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUploadUrl(path);

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    data: {
      url: data.signedUrl,
      path,
    },
  });
});

// POST /api/documents - Create document record (after upload)
router.post('/', async (req: Request, res: Response<ApiResponse<Document>>) => {
  const validation = createDocumentSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0]?.message || 'Validation failed', 400);
  }

  const { data, error } = await supabase
    .from('documents')
    .insert(validation.data)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.status(201).json({
    success: true,
    data: data as Document,
    message: 'Document created successfully',
  });
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', async (req: Request, res: Response<ApiResponse<null>>) => {
  const { id } = req.params;

  // Get document to find file path
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .single();

  if (docError) {
    throw new AppError('Document not found', 404);
  }

  // Delete from storage
  if (doc?.file_path) {
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([doc.file_path]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
    }
  }

  // Delete from database
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    message: 'Document deleted successfully',
  });
});

export default router;
