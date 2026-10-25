const express = require('express');
const db = require('../db');
const {
  STATUSES,
  validateCreate,
  validateUpdate,
  parsePagination,
  UUID_RE,
} = require('../validation');

const router = express.Router();

// POST /tickets
router.post('/', async (req, res, next) => {
  try {
    const errors = validateCreate(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { title, description = null, status = 'open', priority = 'medium' } = req.body;
    const { rows } = await db.query(
      `INSERT INTO tickets (title, description, status, priority)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title.trim(), description, status, priority]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /tickets/stats  (must be declared before /:id)
router.get('/stats', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT status, COUNT(*)::int AS count FROM tickets GROUP BY status'
    );
    // Always return every status, even when the count is zero
    const stats = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    rows.forEach((r) => {
      stats[r.status] = r.count;
    });
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET /tickets?status=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { errors, page, limit } = parsePagination(req.query);
    if (errors.length) return res.status(400).json({ errors });

    const where = req.query.status ? 'WHERE status = $1' : '';
    const filterParams = req.query.status ? [req.query.status] : [];

    const countResult = await db.query(`SELECT COUNT(*)::int AS total FROM tickets ${where}`, filterParams);
    const total = countResult.rows[0].total;

    const { rows } = await db.query(
      `SELECT * FROM tickets ${where}
       ORDER BY created_at DESC, id
       LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`,
      [...filterParams, limit, (page - 1) * limit]
    );

    res.json({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /tickets/:id
router.patch('/:id', async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(400).json({ errors: ['invalid ticket id'] });

    const errors = validateUpdate(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { status, priority } = req.body;
    const { rows } = await db.query(
      `UPDATE tickets
       SET status   = COALESCE($1::ticket_status, status),
           priority = COALESCE($2::ticket_priority, priority)
       WHERE id = $3
       RETURNING *`,
      [status ?? null, priority ?? null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ errors: ['ticket not found'] });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
