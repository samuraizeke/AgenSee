import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
      supabaseClient?: ReturnType<typeof createClient>;
    }
  }
}

/**
 * Middleware to validate Supabase JWT tokens
 * Extracts the token from the Authorization header and verifies it with Supabase
 */
export const validateJWT = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Authorization header is required', 401);
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    throw new AppError('Invalid authorization header format', 401);
  }

  // Create a Supabase client with the user's token to verify it
  const supabase = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Verify the JWT by getting the user
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AppError('Invalid or expired token', 401);
  }

  // Attach user info to request
  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Create a client scoped to this user for RLS-aware queries if needed
  req.supabaseClient = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  next();
};

/**
 * Optional JWT validation - doesn't throw if no token present
 * Useful for endpoints that work for both authenticated and anonymous users
 */
export const optionalJWT = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }
  } catch {
    // Silently ignore auth errors for optional auth
  }

  next();
};
