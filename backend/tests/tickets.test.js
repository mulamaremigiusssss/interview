const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');
const migrate = require('../src/migrate');

beforeAll(async () => {
  await migrate();
});

beforeEach(async () => {
  await db.query('TRUNCATE tickets');
});

afterAll(async () => {
  await db.pool.end();
});

describe('POST /tickets', () => {
  it('creates a ticket with defaults', async () => {
    const res = await request(app).post('/tickets').send({ title: 'Printer broken' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Printer broken', status: 'open', priority: 'medium' });
    expect(res.body.id).toBeDefined();
    expect(res.body.created_at).toBeDefined();
  });

  it('rejects a missing title', async () => {
    const res = await request(app).post('/tickets').send({ description: 'no title' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('title is required');
  });

  it('rejects an invalid priority', async () => {
    const res = await request(app).post('/tickets').send({ title: 'x', priority: 'urgent' });
    expect(res.status).toBe(400);
  });
});

describe('GET /tickets', () => {
  beforeEach(async () => {
    for (let i = 1; i <= 5; i++) {
      await request(app).post('/tickets').send({ title: `Ticket ${i}`, status: i <= 2 ? 'closed' : 'open' });
    }
  });

  it('paginates results', async () => {
    const res = await request(app).get('/tickets?page=2&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 2, total: 5, totalPages: 3 });
  });

  it('filters by status', async () => {
    const res = await request(app).get('/tickets?status=closed');
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((t) => t.status === 'closed')).toBe(true);
  });

  it('rejects an invalid status filter', async () => {
    const res = await request(app).get('/tickets?status=bogus');
    expect(res.status).toBe(400);
  });
});

describe('PATCH /tickets/:id', () => {
  it('updates status and priority', async () => {
    const { body: ticket } = await request(app).post('/tickets').send({ title: 'Fix me' });
    const res = await request(app).patch(`/tickets/${ticket.id}`).send({ status: 'in_progress', priority: 'high' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'in_progress', priority: 'high' });
  });

  it('returns 404 for an unknown ticket', async () => {
    const res = await request(app)
      .patch('/tickets/00000000-0000-0000-0000-000000000000')
      .send({ status: 'closed' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid id', async () => {
    const res = await request(app).patch('/tickets/abc').send({ status: 'closed' });
    expect(res.status).toBe(400);
  });
});

describe('GET /tickets/stats', () => {
  it('returns zero counts when empty', async () => {
    const res = await request(app).get('/tickets/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ open: 0, in_progress: 0, closed: 0 });
  });

  it('returns counts grouped by status', async () => {
    await request(app).post('/tickets').send({ title: 'a' });
    await request(app).post('/tickets').send({ title: 'b' });
    await request(app).post('/tickets').send({ title: 'c', status: 'closed' });
    const res = await request(app).get('/tickets/stats');
    expect(res.body).toEqual({ open: 2, in_progress: 0, closed: 1 });
  });
});
