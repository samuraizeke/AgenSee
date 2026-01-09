import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

// Types for dashboard responses
interface RenewalPolicy {
  id: string;
  client_id: string;
  carrier: string;
  policy_number: string;
  type: string;
  effective_date: string;
  expiration_date: string;
  premium: number;
  status: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string | null;
  client_phone: string | null;
  days_until_expiration: number;
}

interface DashboardStats {
  total_clients: number;
  total_policies: number;
  active_policies: number;
  pending_activities: number;
  total_premium: number;
  expiring_soon: number;
}

// GET /api/dashboard/renewals - Get policies expiring within specified days
router.get('/renewals', async (req: Request, res: Response<ApiResponse<RenewalPolicy[]>>) => {
  const days = parseInt(req.query.days as string) || 30;

  // Limit days to reasonable range (1-365)
  const daysToCheck = Math.min(Math.max(days, 1), 365);

  // Use the expiring_policies view or query directly
  const { data, error } = await supabase
    .from('policies')
    .select(`
      id,
      client_id,
      carrier,
      policy_number,
      type,
      effective_date,
      expiration_date,
      premium,
      status,
      clients (
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('status', 'active')
    .gte('expiration_date', new Date().toISOString().split('T')[0])
    .lte('expiration_date', new Date(Date.now() + daysToCheck * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('expiration_date', { ascending: true });

  if (error) {
    throw new AppError('Failed to fetch renewal policies', 500);
  }

  // Transform the data to flatten client info and add days until expiration
  const renewals: RenewalPolicy[] = (data || []).map((policy) => {
    // Supabase returns joined single record as object (not array) for belongs-to relationships
    const client = policy.clients as unknown as { first_name: string; last_name: string; email: string | null; phone: string | null } | null;
    const expirationDate = new Date(policy.expiration_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: policy.id,
      client_id: policy.client_id,
      carrier: policy.carrier,
      policy_number: policy.policy_number,
      type: policy.type,
      effective_date: policy.effective_date,
      expiration_date: policy.expiration_date,
      premium: policy.premium,
      status: policy.status,
      client_first_name: client?.first_name || '',
      client_last_name: client?.last_name || '',
      client_email: client?.email || null,
      client_phone: client?.phone || null,
      days_until_expiration: daysUntil,
    };
  });

  res.json({
    success: true,
    data: renewals,
    message: `Found ${renewals.length} policies expiring in the next ${daysToCheck} days`,
  });
});

// GET /api/dashboard/stats - Get overall dashboard statistics
router.get('/stats', async (req: Request, res: Response<ApiResponse<DashboardStats>>) => {
  // Run multiple queries in parallel for efficiency
  const [
    clientsResult,
    policiesResult,
    activePoliciesResult,
    pendingActivitiesResult,
    premiumResult,
    expiringResult,
  ] = await Promise.all([
    // Total clients
    supabase.from('clients').select('id', { count: 'exact', head: true }),

    // Total policies
    supabase.from('policies').select('id', { count: 'exact', head: true }),

    // Active policies
    supabase.from('policies').select('id', { count: 'exact', head: true }).eq('status', 'active'),

    // Pending activities (not completed, due date not passed or no due date)
    supabase
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('completed', false),

    // Total premium from active policies
    supabase
      .from('policies')
      .select('premium')
      .eq('status', 'active'),

    // Policies expiring in next 30 days
    supabase
      .from('policies')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('expiration_date', new Date().toISOString().split('T')[0])
      .lte('expiration_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
  ]);

  // Check for errors
  if (clientsResult.error || policiesResult.error || activePoliciesResult.error ||
      pendingActivitiesResult.error || premiumResult.error || expiringResult.error) {
    throw new AppError('Failed to fetch dashboard statistics', 500);
  }

  // Calculate total premium
  const totalPremium = (premiumResult.data || []).reduce(
    (sum, policy) => sum + (Number(policy.premium) || 0),
    0
  );

  const stats: DashboardStats = {
    total_clients: clientsResult.count || 0,
    total_policies: policiesResult.count || 0,
    active_policies: activePoliciesResult.count || 0,
    pending_activities: pendingActivitiesResult.count || 0,
    total_premium: totalPremium,
    expiring_soon: expiringResult.count || 0,
  };

  res.json({
    success: true,
    data: stats,
  });
});

// GET /api/dashboard/upcoming-activities - Get upcoming activities
router.get('/upcoming-activities', async (req: Request, res: Response<ApiResponse<unknown[]>>) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const days = parseInt(req.query.days as string) || 7;

  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('activities')
    .select(`
      id,
      type,
      description,
      due_date,
      completed,
      client_id,
      policy_id,
      clients (
        first_name,
        last_name
      ),
      policies (
        policy_number,
        carrier
      )
    `)
    .eq('completed', false)
    .or(`due_date.is.null,due_date.lte.${futureDate}`)
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw new AppError('Failed to fetch upcoming activities', 500);
  }

  res.json({
    success: true,
    data: data || [],
  });
});

export default router;
