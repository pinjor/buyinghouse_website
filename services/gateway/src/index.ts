import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { requireAuth, requireAdmin } from './authMiddleware.js';

const app = express();
app.use(cors());

const AUTH_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:4001';
const CATALOG_URL = process.env.CATALOG_SERVICE_URL ?? 'http://catalog-service:4002';
const ORDER_URL = process.env.ORDER_SERVICE_URL ?? 'http://order-service:4003';

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
  createProxyMiddleware({ target: CATALOG_URL, changeOrigin: true }),
);
app.use(
  '/api/admin/catalog',
  requireAuth,
  requireAdmin,
  createProxyMiddleware({ target: CATALOG_URL, changeOrigin: true, pathRewrite: { '^/': '/admin/' } }),
);
app.use(
  '/api/admin/orders',
  requireAuth,
  requireAdmin,
  createProxyMiddleware({ target: ORDER_URL, changeOrigin: true, pathRewrite: { '^/': '/admin/' } }),
);
app.use(
  '/api/orders',
  requireAuth,
  createProxyMiddleware({ target: ORDER_URL, changeOrigin: true }),
);

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => console.log(`gateway listening on ${PORT}`));
