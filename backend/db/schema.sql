DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  status      ticket_status   NOT NULL DEFAULT 'open',
  priority    ticket_priority NOT NULL DEFAULT 'medium',
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets (created_at DESC);
