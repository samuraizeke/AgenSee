import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Client, Policy, CreateClientRequest, UpdateClientRequest, ApiResponse, PaginatedResponse } from '../types/index.js';

const router = Router();

// Extended client type with related data
interface ClientWithPolicies extends Client {
  policies: Policy[];
}

interface ClientWithStats extends Client {
  policy_count: number;
  active_policies: number;
  total_premium: number;
}

// Validation schemas
const createClientSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().optional().nullable(),
});

const updateClientSchema = createClientSchema.partial();

// GET /api/clients - List all clients with search support
router.get('/', async (req: Request, res: Response<ApiResponse<PaginatedResponse<ClientWithStats>>>) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const search = req.query.search as string | undefined;
  const sortBy = (req.query.sortBy as string) || 'created_at';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

  const offset = (page - 1) * limit;

  // Use the client_summary view for aggregated data
  let query = supabase
    .from('client_summary')
    .select('*', { count: 'exact' });

  // Apply search filter - search across multiple fields
  if (search) {
    const searchTerm = search.trim();
    query = query.or(
      `first_name.ilike.%${searchTerm}%,` +
      `last_name.ilike.%${searchTerm}%,` +
      `email.ilike.%${searchTerm}%,` +
      `phone.ilike.%${searchTerm}%`
    );
  }

  // Map sortBy to valid columns
  const validSortColumns: Record<string, string> = {
    created_at: 'created_at',
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    policy_count: 'policy_count',
    total_premium: 'total_premium',
  };

  const sortColumn = validSortColumns[sortBy] || 'created_at';

  // Apply sorting and pagination
  const { data, error, count } = await query
    .order(sortColumn, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch clients', 500);
  }

  res.json({
    success: true,
    data: {
      data: data as ClientWithStats[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

// GET /api/clients/:id - Get single client with their policies
router.get('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<ClientWithPolicies>>) => {
  const { id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError('Invalid client ID format', 400);
  }

  // Fetch client with joined policies using Supabase's select syntax
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      policies (
        id,
        carrier,
        policy_number,
        type,
        effective_date,
        expiration_date,
        premium,
        status,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError('Client not found', 404);
    }
    throw new AppError('Failed to fetch client', 500);
  }

  res.json({
    success: true,
    data: data as ClientWithPolicies,
  });
});

// POST /api/clients - Create new client
router.post('/', async (req: Request<unknown, unknown, CreateClientRequest>, res: Response<ApiResponse<Client>>) => {
  const validation = createClientSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = validation.error.errors
      .map(e => e.message)
      .join(', ');
    throw new AppError(errorMessage, 400);
  }

  // Check for duplicate email if provided
  if (validation.data.email) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('email', validation.data.email)
      .single();

    if (existing) {
      throw new AppError('A client with this email already exists', 409);
    }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert(validation.data)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new AppError('A client with this email already exists', 409);
    }
    throw new AppError('Failed to create client', 500);
  }

  res.status(201).json({
    success: true,
    data: data as Client,
    message: 'Client created successfully',
  });
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req: Request<{ id: string }, unknown, UpdateClientRequest>, res: Response<ApiResponse<Client>>) => {
  const { id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError('Invalid client ID format', 400);
  }

  const validation = updateClientSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = validation.error.errors
      .map(e => e.message)
      .join(', ');
    throw new AppError(errorMessage, 400);
  }

  // Check if client exists
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .single();

  if (!existingClient) {
    throw new AppError('Client not found', 404);
  }

  // Check for duplicate email if being updated
  if (validation.data.email) {
    const { data: duplicateEmail } = await supabase
      .from('clients')
      .select('id')
      .eq('email', validation.data.email)
      .neq('id', id)
      .single();

    if (duplicateEmail) {
      throw new AppError('A client with this email already exists', 409);
    }
  }

  const { data, error } = await supabase
    .from('clients')
    .update(validation.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update client', 500);
  }

  res.json({
    success: true,
    data: data as Client,
    message: 'Client updated successfully',
  });
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
  const { id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError('Invalid client ID format', 400);
  }

  // Check if client exists
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .single();

  if (!existingClient) {
    throw new AppError('Client not found', 404);
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError('Failed to delete client', 500);
  }

  res.json({
    success: true,
    message: 'Client deleted successfully',
  });
});

export default router;
