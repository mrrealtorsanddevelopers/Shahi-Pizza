import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESTAURANT_LAT = 24.9964;
const RESTAURANT_LNG = 67.0645;

// Backend Pakistan petrol rate configuration (PKR per liter).
// Can be updated daily via environment variable or internal fuel rate sync without exposing fuel rates on the UI.
let cachedPetrolRatePkr = Number(process.env.PAKISTAN_PETROL_PKR_PER_LITER) || 254.63;
let lastFuelSyncAt = 0;

async function syncBackendFuelRateIfNeeded() {
  const now = Date.now();
  if (now - lastFuelSyncAt < 6 * 60 * 60 * 1000) return;
  lastFuelSyncAt = now;
  const envRate = Number(process.env.PAKISTAN_PETROL_PKR_PER_LITER);
  if (Number.isFinite(envRate) && envRate > 100) {
    cachedPetrolRatePkr = envRate;
  }
}

function haversineRoadKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.24 * 10) / 10;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/delivery-quote', async (req, res) => {
    await syncBackendFuelRateIfNeeded();

    const orderType = String(req.query.orderType || 'Delivery');
    if (orderType !== 'Delivery') {
      res.json({ distanceKm: 0, deliveryFee: 0 });
      return;
    }

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const fallbackKm = Number(req.query.distanceKm);

    let distanceKm = 1.5;
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
      distanceKm = Math.max(0.5, haversineRoadKm(RESTAURANT_LAT, RESTAURANT_LNG, lat, lng));
    } else if (Number.isFinite(fallbackKm) && fallbackKm >= 0) {
      distanceKm = Math.max(0.5, Math.round(fallbackKm * 10) / 10);
    }

    const perKmRate = (cachedPetrolRatePkr / 42) * 2.55;
    const baseDispatch = 45;
    const rawFee = baseDispatch + distanceKm * perKmRate;
    const deliveryFee = Math.max(60, Math.round(rawFee / 10) * 10);

    res.json({
      distanceKm,
      deliveryFee,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
