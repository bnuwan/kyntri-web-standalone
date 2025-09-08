-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE incident_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE incident_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE action_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');
CREATE TYPE action_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE timeline_event_type AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED', 'ACTION_CREATED', 'COMMENT_ADDED');

-- Sites table
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    location TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id, code)
);

-- Incidents table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status incident_status DEFAULT 'OPEN' NOT NULL,
    severity incident_severity NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    location TEXT,
    reported_by VARCHAR(255) NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident attachments table
CREATE TABLE incident_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident timeline table
CREATE TABLE incident_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    type timeline_event_type NOT NULL,
    description TEXT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions/CAPA table
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status action_status DEFAULT 'PENDING' NOT NULL,
    priority action_priority DEFAULT 'MEDIUM' NOT NULL,
    assignee VARCHAR(255) NOT NULL,
    assignee_name VARCHAR(255) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_incidents_site_id ON incidents(site_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_reported_at ON incidents(reported_at DESC);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);

CREATE INDEX idx_assets_site_id ON assets(site_id);
CREATE INDEX idx_incident_attachments_incident_id ON incident_attachments(incident_id);
CREATE INDEX idx_incident_timeline_incident_id ON incident_timeline(incident_id);
CREATE INDEX idx_incident_timeline_created_at ON incident_timeline(created_at DESC);

CREATE INDEX idx_actions_incident_id ON actions(incident_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_assignee ON actions(assignee);
CREATE INDEX idx_actions_due_date ON actions(due_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO sites (id, name, code, location) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Manufacturing Plant A', 'MPA', 'Detroit, MI'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Distribution Center', 'DC1', 'Chicago, IL'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Corporate Headquarters', 'HQ', 'New York, NY');

INSERT INTO assets (id, name, code, site_id, type) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', 'Assembly Line 1', 'AL001', '550e8400-e29b-41d4-a716-446655440001', 'Production Equipment'),
    ('550e8400-e29b-41d4-a716-446655440012', 'Forklift FL-123', 'FL123', '550e8400-e29b-41d4-a716-446655440001', 'Mobile Equipment'),
    ('550e8400-e29b-41d4-a716-446655440013', 'Loading Dock A', 'LDA', '550e8400-e29b-41d4-a716-446655440002', 'Infrastructure');

-- Row Level Security (RLS) - Enable if needed
-- ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE incident_attachments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- Create policies (uncomment if using RLS)
-- CREATE POLICY "Users can view all sites" ON sites FOR SELECT USING (true);
-- CREATE POLICY "Users can view all assets" ON assets FOR SELECT USING (true);
-- CREATE POLICY "Users can view all incidents" ON incidents FOR SELECT USING (true);
-- CREATE POLICY "Users can create incidents" ON incidents FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Users can update incidents" ON incidents FOR UPDATE USING (true);

-- Storage bucket setup (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('incident-attachments', 'incident-attachments', false);

-- Storage policies (uncomment if using RLS)
-- CREATE POLICY "Users can upload incident attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'incident-attachments');
-- CREATE POLICY "Users can view incident attachments" ON storage.objects FOR SELECT USING (bucket_id = 'incident-attachments');
-- CREATE POLICY "Users can update incident attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'incident-attachments');
-- CREATE POLICY "Users can delete incident attachments" ON storage.objects FOR DELETE USING (bucket_id = 'incident-attachments');