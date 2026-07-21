import express from 'express';
import cors from 'cors';
import { createProxyMiddleware, type Options } from 'http-proxy-middleware';
import { requireAuth, requireAdmin } from './authMiddleware.js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`missing required env var ${name}`);
    process.exit(1);
  }
  return value;
}

const app = express();
// Unset = same-origin/no browser CORS restriction beyond the default (fine
// behind Docker's internal network); set once this is reachable from the
// public internet under its own domain.
const CORS_ORIGIN = process.env.CORS_ORIGIN;
app.use(cors(CORS_ORIGIN ? { origin: CORS_ORIGIN.split(',').map((o) => o.trim()) } : undefined));

const AUTH_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:4001';
const CATALOG_URL = process.env.CATALOG_SERVICE_URL ?? 'http://catalog-service:4002';
const ORDER_URL = process.env.ORDER_SERVICE_URL ?? 'http://order-service:4003';

// catalog-service and order-service trust x-user-id / x-user-role as
// already-verified identity and only accept requests carrying this secret —
// that's what makes it safe for them to trust those headers even if they end
// up independently network-reachable (e.g. each service getting its own
// public URL, as with cPanel's Node.js app selector).
const INTERNAL_SERVICE_SECRET = requireEnv('INTERNAL_SERVICE_SECRET');
function withInternalSecret(target: string, extra: Partial<Options> = {}): Options {
  return {
    target,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq) => proxyReq.setHeader('x-internal-secret', INTERNAL_SERVICE_SECRET),
    },
    ...extra,
  };
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Express strips the app.use() mount path from req.url before the proxy sees it,
// so pathRewrite only needs to handle what's left *after* the mount prefix.
app.use('/api/auth', createProxyMiddleware({ target: AUTH_URL, changeOrigin: true }));
app.use(
  '/api/catalog',
  // catalog-service's own admin routes live at /admin/*; block them here so this
  // unauthenticated public mount can't be used to reach them (e.g. a request to
  // /api/catalog/admin/products would otherwise forward straight through as
  // /admin/products with no auth check at all).
  (req, res, next) => {
    if (req.path === '/admin' || req.path.startsWith('/admin/')) {
      return res.status(404).json({ error: 'not found' });
    }
    next();
  },
  createProxyMiddleware(withInternalSecret(CATALOG_URL)),
);
app.use(
  '/api/admin/catalog',
  requireAuth,
  requireAdmin,
  createProxyMiddleware(withInternalSecret(CATALOG_URL, { pathRewrite: { '^/': '/admin/' } })),
);
app.use(
  '/api/admin/orders',
  requireAuth,
  requireAdmin,
  createProxyMiddleware(withInternalSecret(ORDER_URL, { pathRewrite: { '^/': '/admin/' } })),
);
app.use(
  '/api/orders',
  requireAuth,
  createProxyMiddleware(withInternalSecret(ORDER_URL)),
);

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => console.log(`gateway listening on ${PORT}`));
