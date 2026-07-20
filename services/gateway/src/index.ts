import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { requireAuth } from './authMiddleware.js';

const app = express();
app.use(cors());

const AUTH_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:4001';
const CATALOG_URL = process.env.CATALOG_SERVICE_URL ?? 'http://catalog-service:4002';
const ORDER_URL = process.env.ORDER_SERVICE_URL ?? 'http://order-service:4003';

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', createProxyMiddleware({ target: AUTH_URL, changeOrigin: true, pathRewrite: { '^/api/auth': '' } }));
app.use('/api/catalog', createProxyMiddleware({ target: CATALOG_URL, changeOrigin: true, pathRewrite: { '^/api/catalog': '' } }));
app.use(
  '/api/orders',
  requireAuth,
  createProxyMiddleware({ target: ORDER_URL, changeOrigin: true, pathRewrite: { '^/api/orders': '' } }),
);

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => console.log(`gateway listening on ${PORT}`));
