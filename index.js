const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

let savedItineraries = [];

app.get('/api/flights', (req, res) => {
  res.json({ deal: `Best fare for ${req.query.origin} → ${req.query.destination} on ${req.query.date}` });
});

app.get('/api/hotels', (req, res) => {
  res.json([
    { name: 'Grand Hotel', price: '$200/night' },
    { name: 'City Inn', price: '$120/night' }
  ]);
});

app.get('/api/activities', (req, res) => {
  res.json([
    { name: 'City Walking Tour' },
    { name: 'Museum Visit' }
  ]);
});

app.get('/api/restaurants', (req, res) => {
  res.json([
    { name: 'Pasta Palace', type: 'Italian', rating: 4.5 },
    { name: 'Sushi World', type: 'Japanese', rating: 4.7 }
  ]);
});

app.post('/api/save-itinerary', (req, res) => {
  savedItineraries.push(req.body);
  res.json({ success: true });
});

app.get('/api/itineraries', (req, res) => {
  res.json(savedItineraries);
});

app.post('/api/checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: req.body.summary },
          unit_amount: 20000
        },
        quantity: req.body.passengers || 1
      }],
      mode: 'payment',
      success_url: 'https://your-frontend-domain.com/success',
      cancel_url: 'https://your-frontend-domain.com/cancel'
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
