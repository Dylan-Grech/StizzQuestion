import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const validResultIds = new Set(['0-1', '0-2', '0-3', '1-0', '1-2', '1-3', '2-0', '2-1', '2-3', '3-0', '3-1', '3-2']);
app.use(cors());
app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(501).json({ error: 'Stripe is not configured yet.' });
  if (!validResultIds.has(req.body.resultId)) return res.status(400).json({ error: 'Invalid result.' });
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const url = process.env.APP_URL || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'eur', product_data: { name: 'Your Pastizz Personality' }, unit_amount: 99 }, quantity: 1 }],
      metadata: { resultId: req.body.resultId },
      success_url: `${url}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url}/?cancelled=true`
    });
    res.json({ url: session.url });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/checkout-session', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(501).json({ error: 'Stripe is not configured yet.' });
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    const resultId = session.metadata.resultId;
    if (session.payment_status !== 'paid' || !validResultIds.has(resultId)) return res.status(402).json({ paid: false });
    res.json({ paid: true, resultId });
  } catch { res.status(400).json({ paid: false }); }
});

app.use(express.static(path.join(rootDirectory, 'dist')));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) return res.sendFile(path.join(rootDirectory, 'dist', 'index.html'));
  next();
});

const port = process.env.PORT || 4242;
app.listen(port, '0.0.0.0', () => console.log(`Pastizz app listening on port ${port}`));
