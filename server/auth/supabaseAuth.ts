import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { authStorage } from './storage.js';

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: 'sessions',
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Setup Supabase authentication
export async function setupAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());
}

// Middleware to verify Supabase JWT token or Session
export const verifySupabaseToken: RequestHandler = async (req, res, next) => {
  // Check for Bearer token first
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.session && (req.session as any).supabaseAccessToken) {
    // Fallback to session-stored token
    token = (req.session as any).supabaseAccessToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Sync user to local database if needed
    const instagramHandle = req.headers['x-instagram-handle']?.toString();

    await authStorage.upsertUser({
      id: user.id,
      email: user.email!,
      instagramHandle: instagramHandle || undefined,
      firstName: user.user_metadata?.first_name || user.email?.split('@')[0],
      lastName: user.user_metadata?.last_name || "",
      profileImageUrl: user.user_metadata?.avatar_url || "",
    });

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Unauthorized: Token verification failed' });
  }
};

// Simple authentication check middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Register auth routes
export function registerAuthRoutes(app: Express) {
  // Redirect to Supabase Login
  app.get('/api/login', (req, res) => {
    // For local dev, we'll just redirect to the Supabase hosted UI if configured, 
    // or provide a simple instruction. 
    // Actually, let's use a simple redirect to the Supabase project URL which often has a sign-in or we can use OAuth.
    // For now, let's just send a JSON response with the instructions to use the Supabase Auth UI on the client,
    // OR just use a simple redirect to a generic login page we might build.

    // Better: let the frontend handle the login UI. We'll update Navigation.tsx to not use /api/login link if it prevents 404.
    // But since the user wants /api/login to work, we'll provide a simple redirect or message.
    res.send(`
      <html>
        <body style="background: black; color: white; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
          <h1>SUPABASE AUTH</h1>
          <p>Please use the client-side login UI.</p>
          <button onclick="window.location.href='/'" style="background: white; color: black; border: none; padding: 10px 20px; cursor: pointer;">GO BACK</button>
        </body>
      </html>
    `);
  });

  // Get current authenticated user
  app.get('/api/auth/user', verifySupabaseToken, async (req, res) => {
    const supabaseUser = req.user as any;
    const user = await authStorage.getUser(supabaseUser.id);
    res.json(user || null);
  });

  // Health check endpoint
  app.get('/api/auth/health', (req, res) => {
    res.json({
      status: 'ok',
      supabaseConfigured: !!process.env.SUPABASE_URL
    });
  });

  // Server-side logout (clear session)
  app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.redirect('/');
    });
  });
}
