const express = require('express');
const cors = require('cors');
const ticketsRouter = require('./routes/tickets');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/tickets', ticketsRouter);

app.use((req, res) => res.status(404).json({ errors: ['route not found'] }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Malformed JSON bodies
  if (err.type === 'entity.parse.failed') return res.status(400).json({ errors: ['invalid JSON body'] });
  console.error(err);
  res.status(500).json({ errors: ['internal server error'] });
});

module.exports = app;
