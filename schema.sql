-- AgenSee Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_name ON clients(last_name, first_name);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- ============================================
-- POLICIES TABLE
-- ============================================
CREATE TYPE policy_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
CREATE TYPE policy_type AS ENUM ('auto', 'home', 'life', 'health', 'business', 'umbrella', 'other');

CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    carrier VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    type policy_type NOT NULL DEFAULT 'other',
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    premium NUMERIC(12, 2) NOT NULL DEFAULT 0,
    details JSONB DEFAULT '{}',
    status policy_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for policies
CREATE INDEX idx_policies_client_id ON policies(client_id);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_expiration ON policies(expiration_date);
CREATE INDEX idx_policies_policy_number ON policies(policy_number);

-- ============================================
-- ACTIVITIES TABLE
-- ============================================
CREATE TYPE activity_type AS ENUM ('call', 'email', 'task', 'meeting', 'note');

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type activity_type NOT NULL,
    description TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activities
CREATE INDEX idx_activities_client_id ON activities(client_id);
CREATE INDEX idx_activities_policy_id ON activities(policy_id);
CREATE INDEX idx_activities_due_date ON activities(due_date);
CREATE INDEX idx_activities_completed ON activities(completed);
CREATE INDEX idx_activities_type ON activities(type);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_policy_id ON documents(policy_id);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at
    BEFORE UPDATE ON policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- For now, we'll use service role key in the Node backend
-- which bypasses RLS. These policies are for direct client access
-- or can be expanded for multi-tenant scenarios.

-- Policy: Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read access on clients"
    ON clients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access on policies"
    ON policies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access on activities"
    ON activities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access on documents"
    ON documents FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert data
CREATE POLICY "Allow authenticated insert on clients"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on policies"
    ON policies FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on activities"
    ON activities FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on documents"
    ON documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update data
CREATE POLICY "Allow authenticated update on clients"
    ON clients FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on policies"
    ON policies FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on activities"
    ON activities FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on documents"
    ON documents FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete data
CREATE POLICY "Allow authenticated delete on clients"
    ON clients FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated delete on policies"
    ON policies FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated delete on activities"
    ON activities FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated delete on documents"
    ON documents FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View: Client summary with policy count
CREATE OR REPLACE VIEW client_summary AS
SELECT
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    COUNT(DISTINCT p.id) AS policy_count,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) AS active_policies,
    COALESCE(SUM(CASE WHEN p.status = 'active' THEN p.premium ELSE 0 END), 0) AS total_premium,
    c.created_at
FROM clients c
LEFT JOIN policies p ON p.client_id = c.id
GROUP BY c.id;

-- View: Upcoming activities
CREATE OR REPLACE VIEW upcoming_activities AS
SELECT
    a.*,
    c.first_name AS client_first_name,
    c.last_name AS client_last_name,
    p.policy_number
FROM activities a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN policies p ON a.policy_id = p.id
WHERE a.completed = FALSE
AND (a.due_date IS NULL OR a.due_date >= NOW())
ORDER BY a.due_date ASC NULLS LAST;

-- View: Expiring policies (next 30 days)
CREATE OR REPLACE VIEW expiring_policies AS
SELECT
    p.*,
    c.first_name AS client_first_name,
    c.last_name AS client_last_name,
    c.email AS client_email,
    c.phone AS client_phone
FROM policies p
JOIN clients c ON p.client_id = c.id
WHERE p.status = 'active'
AND p.expiration_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
ORDER BY p.expiration_date ASC;
