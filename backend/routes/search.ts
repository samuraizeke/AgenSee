import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

// Search result types
interface SearchResultClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

interface SearchResultPolicy {
  id: string;
  policy_number: string;
  carrier: string;
  type: string;
  client_id: string;
  client_name: string | null;
}

interface SearchResultActivity {
  id: string;
  type: string;
  description: string;
  client_id: string | null;
  client_name: string | null;
}

interface SearchResult {
  clients: SearchResultClient[];
  policies: SearchResultPolicy[];
  activities: SearchResultActivity[];
}

// GET /api/search?q=term&limit=5
router.get('/', async (req: Request, res: Response<ApiResponse<SearchResult>>): Promise<void> => {
  const query = ((req.query.q as string) || '').trim();
  const limit = Math.min(parseInt(req.query.limit as string) || 5, 10);

  // Return empty results for short queries
  if (!query || query.length < 2) {
    res.json({
      success: true,
      data: { clients: [], policies: [], activities: [] },
    });
    return;
  }

  try {
    // Search clients by first_name, last_name, email, phone
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, last_name, email')
      .or(
        `first_name.ilike.%${query}%,` +
        `last_name.ilike.%${query}%,` +
        `email.ilike.%${query}%,` +
        `phone.ilike.%${query}%`
      )
      .limit(limit);

    if (clientsError) {
      throw new AppError('Failed to search clients', 500);
    }

    // Search policies by policy_number, carrier
    const { data: policiesByFields, error: policiesError } = await supabase
      .from('policies')
      .select(`
        id, policy_number, carrier, type, client_id,
        clients (first_name, last_name)
      `)
      .or(
        `policy_number.ilike.%${query}%,` +
        `carrier.ilike.%${query}%`
      )
      .limit(limit);

    if (policiesError) {
      throw new AppError('Failed to search policies', 500);
    }

    // Search policies by client name (separate query since we can't filter on joined columns)
    const { data: policiesByClientName, error: policiesByClientError } = await supabase
      .from('policies')
      .select(`
        id, policy_number, carrier, type, client_id,
        clients!inner (first_name, last_name)
      `)
      .or(
        `clients.first_name.ilike.%${query}%,` +
        `clients.last_name.ilike.%${query}%`
      )
      .limit(limit);

    if (policiesByClientError) {
      throw new AppError('Failed to search policies by client name', 500);
    }

    // Merge and deduplicate policy results
    const policyMap = new Map<string, typeof policiesByFields[0]>();
    for (const p of policiesByFields || []) {
      policyMap.set(p.id, p);
    }
    for (const p of policiesByClientName || []) {
      if (!policyMap.has(p.id)) {
        policyMap.set(p.id, p);
      }
    }
    const policiesRaw = Array.from(policyMap.values()).slice(0, limit);

    // Search activities by description
    const { data: activitiesRaw, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        id, type, description, client_id,
        clients (first_name, last_name)
      `)
      .ilike('description', `%${query}%`)
      .limit(limit);

    if (activitiesError) {
      throw new AppError('Failed to search activities', 500);
    }

    // Transform policies to include client_name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const policies: SearchResultPolicy[] = (policiesRaw || []).map((p: any) => {
      const client = Array.isArray(p.clients) ? p.clients[0] : p.clients;
      return {
        id: p.id,
        policy_number: p.policy_number,
        carrier: p.carrier,
        type: p.type,
        client_id: p.client_id,
        client_name: client ? `${client.first_name} ${client.last_name}` : null,
      };
    });

    // Transform activities to include client_name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activities: SearchResultActivity[] = (activitiesRaw || []).map((a: any) => {
      const client = Array.isArray(a.clients) ? a.clients[0] : a.clients;
      return {
        id: a.id,
        type: a.type,
        description: a.description,
        client_id: a.client_id,
        client_name: client ? `${client.first_name} ${client.last_name}` : null,
      };
    });

    res.json({
      success: true,
      data: {
        clients: (clients || []) as SearchResultClient[],
        policies,
        activities,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Search failed', 500);
  }
});

export default router;
