const STATUSES = ['open', 'in_progress', 'closed'];
const PRIORITIES = ['low', 'medium', 'high'];

const isString = (v) => typeof v === 'string';

function validateCreate(body = {}) {
  const errors = [];
  const { title, description, status, priority } = body;

  if (!isString(title) || title.trim() === '') errors.push('title is required');
  else if (title.length > 255) errors.push('title must be at most 255 characters');

  if (description !== undefined && description !== null && !isString(description))
    errors.push('description must be a string');

  if (status !== undefined && !STATUSES.includes(status))
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);

  if (priority !== undefined && !PRIORITIES.includes(priority))
    errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);

  return errors;
}

function validateUpdate(body = {}) {
  const errors = [];
  const { status, priority } = body;

  if (status === undefined && priority === undefined)
    errors.push('provide at least one of: status, priority');

  if (status !== undefined && !STATUSES.includes(status))
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);

  if (priority !== undefined && !PRIORITIES.includes(priority))
    errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);

  return errors;
}

function parsePagination(query) {
  const errors = [];
  let page = 1;
  let limit = 10;

  if (query.page !== undefined) {
    page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) errors.push('page must be a positive integer');
  }
  if (query.limit !== undefined) {
    limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      errors.push('limit must be an integer between 1 and 100');
  }
  if (query.status !== undefined && !STATUSES.includes(query.status))
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);

  return { errors, page, limit };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = { STATUSES, PRIORITIES, validateCreate, validateUpdate, parsePagination, UUID_RE };
