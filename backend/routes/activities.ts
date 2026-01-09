import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Activity, CreateActivityRequest, UpdateActivityRequest, ApiResponse, PaginatedResponse } from '../types/index.js';

const router = Router();

// Validation schemas
const activityTypeEnum = z.enum(['call', 'email', 'task', 'meeting', 'note']);

const createActivitySchema = z.object({
  type: activityTypeEnum,
  description: z.string().min(1),
  client_id: z.string().uuid().optional().nullable(),
  policy_id: z.string().uuid().optional().nullable(),
  due_date: z.string().datetime().optional().nullable(),
});

const updateActivitySchema = createActivitySchema.partial().extend({
  completed: z.boolean().optional(),
});

// GET /api/activities - List all activities
router.get('/', async (req: Request, res: Response<ApiResponse<PaginatedResponse<Activity>>>) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const clientId = req.query.client_id as string | undefined;
  const policyId = req.query.policy_id as string | undefined;
  const type = req.query.type as string | undefined;
  const completed = req.query.completed as string | undefined;
  const sortBy = (req.query.sortBy as string) || 'due_date';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

  const offset = (page - 1) * limit;

  let query = supabase
    .from('activities')
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
  if (policyId) {
    query = query.eq('policy_id', policyId);
  }
  if (type) {
    query = query.eq('type', type);
  }
  if (completed !== undefined) {
    query = query.eq('completed', completed === 'true');
  }

  // Apply sorting and pagination
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc', nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(error.message, 500);
  }

  // Transform data to include client_name for frontend display
  const transformedData = (data || []).map((activity: any) => ({
    ...activity,
    client_name: activity.clients
      ? `${activity.clients.first_name} ${activity.clients.last_name}`
      : null,
    clients: undefined, // Remove nested object
  }));

  res.json({
    success: true,
    data: {
      data: transformedData as Activity[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

// GET /api/activities/upcoming - Get upcoming activities
router.get('/upcoming', async (req: Request, res: Response<ApiResponse<Activity[]>>) => {
  const days = parseInt(req.query.days as string) || 7;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      clients (
        first_name,
        last_name
      )
    `)
    .eq('completed', false)
    .lte('due_date', futureDate.toISOString())
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  // Transform data to include client_name
  const transformedData = (data || []).map((activity: any) => ({
    ...activity,
    client_name: activity.clients
      ? `${activity.clients.first_name} ${activity.clients.last_name}`
      : null,
    clients: undefined,
  }));

  res.json({
    success: true,
    data: transformedData as Activity[],
  });
});

// GET /api/activities/:id - Get single activity
router.get('/:id', async (req: Request, res: Response<ApiResponse<Activity>>) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError('Activity not found', 404);
    }
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    data: data as Activity,
  });
});

// POST /api/activities - Create new activity
router.post('/', async (req: Request<unknown, unknown, CreateActivityRequest>, res: Response<ApiResponse<Activity>>) => {
  const validation = createActivitySchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0]?.message || 'Validation failed', 400);
  }

  const { data, error } = await supabase
    .from('activities')
    .insert(validation.data)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.status(201).json({
    success: true,
    data: data as Activity,
    message: 'Activity created successfully',
  });
});

// PUT /api/activities/:id - Update activity
router.put('/:id', async (req: Request<{ id: string }, unknown, UpdateActivityRequest>, res: Response<ApiResponse<Activity>>) => {
  const { id } = req.params;

  const validation = updateActivitySchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0]?.message || 'Validation failed', 400);
  }

  // If marking as completed, set completed_at timestamp
  const updateData = {
    ...validation.data,
    ...(validation.data.completed === true && { completed_at: new Date().toISOString() }),
    ...(validation.data.completed === false && { completed_at: null }),
  };

  const { data, error } = await supabase
    .from('activities')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new AppError('Activity not found', 404);
    }
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    data: data as Activity,
    message: 'Activity updated successfully',
  });
});

// DELETE /api/activities/:id - Delete activity
router.delete('/:id', async (req: Request, res: Response<ApiResponse<null>>) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError(error.message, 500);
  }

  res.json({
    success: true,
    message: 'Activity deleted successfully',
  });
});

export default router;
