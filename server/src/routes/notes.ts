import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ClientNote, CreateClientNoteRequest, UpdateClientNoteRequest, ApiResponse } from '../types/index.js';

const router = Router();

// Validation schemas
const createNoteSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  content: z.string().min(1, 'Content is required'),
});

const updateNoteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

// GET /api/notes?client_id=xxx - Get all notes for a client
router.get('/', async (req: Request, res: Response<ApiResponse<ClientNote[]>>) => {
  const clientId = req.query.client_id as string;

  if (!clientId) {
    throw new AppError('client_id is required', 400);
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(clientId)) {
    throw new AppError('Invalid client ID format', 400);
  }

  const { data, error } = await supabase
    .from('client_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch notes', 500);
  }

  res.json({
    success: true,
    data: data as ClientNote[],
  });
});

// POST /api/notes - Create a new note
router.post('/', async (req: Request<unknown, unknown, CreateClientNoteRequest>, res: Response<ApiResponse<ClientNote>>) => {
  const validation = createNoteSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = validation.error.errors
      .map(e => e.message)
      .join(', ');
    throw new AppError(errorMessage, 400);
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
    .from('client_notes')
    .insert({
      client_id: validation.data.client_id,
      content: validation.data.content,
    })
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to create note', 500);
  }

  res.status(201).json({
    success: true,
    data: data as ClientNote,
    message: 'Note created successfully',
  });
});

// PUT /api/notes/:id - Update a note
router.put('/:id', async (req: Request<{ id: string }, unknown, UpdateClientNoteRequest>, res: Response<ApiResponse<ClientNote>>) => {
  const { id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError('Invalid note ID format', 400);
  }

  const validation = updateNoteSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = validation.error.errors
      .map(e => e.message)
      .join(', ');
    throw new AppError(errorMessage, 400);
  }

  // Check if note exists
  const { data: existingNote } = await supabase
    .from('client_notes')
    .select('id')
    .eq('id', id)
    .single();

  if (!existingNote) {
    throw new AppError('Note not found', 404);
  }

  const { data, error } = await supabase
    .from('client_notes')
    .update({ content: validation.data.content })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update note', 500);
  }

  res.json({
    success: true,
    data: data as ClientNote,
    message: 'Note updated successfully',
  });
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<null>>) => {
  const { id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError('Invalid note ID format', 400);
  }

  // Check if note exists
  const { data: existingNote } = await supabase
    .from('client_notes')
    .select('id')
    .eq('id', id)
    .single();

  if (!existingNote) {
    throw new AppError('Note not found', 404);
  }

  const { error } = await supabase
    .from('client_notes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError('Failed to delete note', 500);
  }

  res.json({
    success: true,
    message: 'Note deleted successfully',
  });
});

export default router;
