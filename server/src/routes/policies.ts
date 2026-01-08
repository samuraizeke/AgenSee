import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Policy, CreatePolicyRequest, UpdatePolicyRequest, ApiResponse, PaginatedResponse } from '../types/index.js';

const router = Router();

// Validation schemas
const policyTypeEnum = z.enum(['auto', 'home', 'life', 'health', 'business', 'umbrella', 'other']);
const policyStatusEnum = z.enum(['active', 'expired', 'cancelled', 'pending']);

const createPolicySchema = z.object({
  client_id: z.string().uuid(),
  carrier: z.string().min(1).max(255),
  policy_number: z.string().min(1).max(100),
  type: policyTypeEnum,
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  premium: z.number().min(0),
  details: z.record(z.unknown()).optional(),
  status: policyStatusEnum.optional(),
});

const updatePolicySchema = createPolicySchema.partial().omit({ client_id: true });

// GET /api/policies - List all policies
router.get('/', async (req: Request, res: Response<ApiResponse<PaginatedResponse<Policy>>>) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const clientId = req.query.client_id as string | undefined;
  const status = req.query.status as string | undefined;
  const type = req.query.type as string | undefined;
  const sortBy = (req.query.sortBy as string) || 'created_at';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

  const offset = (page - 1) * limit;

  let query = supabase
    .from('policies')
    .select(`
      *,
      clients (
        first_name,
        last_name
      )
    `, { count: 'exact' });

  // Apply filters
  if (clientId) {
    query = query.eq('client_id', clientId);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (type) {
    query = query.eq('type', type);
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
      data: data as Policy[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

// GET /api/policies/expiring - Get expiring policies
router.get('/expiring', async (req: Request, res: Response<ApiResponse<Policy[]>>) => {
  const days = parseInt(req.query.days as string) || 30;
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('status', 'active')
    .gte('expiration_date', today)
    .lte('expiration_date', futureDateStr)
    .order('expiration_date', { ascending: true });

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    data: data as Policy[],
  });
});

// GET /api/policies/:id - Get single policy
router.get('/:id', async (req: Request, res: Response<ApiResponse<Policy>>) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError('Policy not found', 404);
    }
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    data: data as Policy,
  });
});

// POST /api/policies - Create new policy
router.post('/', async (req: Request<unknown, unknown, CreatePolicyRequest>, res: Response<ApiResponse<Policy>>) => {
  const validation = createPolicySchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0]?.message || 'Validation failed', 400);
  }

  // Verify client exists
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', validation.data.client_id)
    .single();

  if (!client) {
    throw new AppError('Client not found', 404);
  }

  const { data, error } = await supabase
    .from('policies')
    .insert(validation.data)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.status(201).json({
    success: true,
    data: data as Policy,
    message: 'Policy created successfully',
  });
});

// PUT /api/policies/:id - Update policy
router.put('/:id', async (req: Request<{ id: string }, unknown, UpdatePolicyRequest>, res: Response<ApiResponse<Policy>>) => {
  const { id } = req.params;

  const validation = updatePolicySchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0]?.message || 'Validation failed', 400);
  }

  const { data, error } = await supabase
    .from('policies')
    .update(validation.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError('Policy not found', 404);
    }
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    data: data as Policy,
    message: 'Policy updated successfully',
  });
});

// DELETE /api/policies/:id - Delete policy
router.delete('/:id', async (req: Request, res: Response<ApiResponse<null>>) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('policies')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    message: 'Policy deleted successfully',
  });
});

export default router;
