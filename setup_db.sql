-- Create the feature_requests table for RICE Roadmap Dashboard
CREATE TABLE IF NOT EXISTS feature_requests (
  id SERIAL PRIMARY KEY,
  feature_name TEXT NOT NULL,
  final_rice_score INTEGER NOT NULL,
  effort_score INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional, for production)
-- ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Sample data to populate the dashboard
INSERT INTO feature_requests (feature_name, final_rice_score, effort_score, status, category) VALUES
  ('Dark Mode Theme', 850, 3, 'New', 'UX'),
  ('AI-Powered Search', 720, 7, 'Planned', 'AI/ML'),
  ('One-Click Export to PDF', 680, 2, 'New', 'Feature'),
  ('Real-Time Collaboration', 620, 8, 'In Progress', 'Feature'),
  ('Mobile App Notifications', 580, 5, 'Planned', 'Mobile'),
  ('SSO Integration', 540, 6, 'New', 'Security'),
  ('Custom Dashboard Widgets', 490, 4, 'New', 'UX'),
  ('Bulk Import Tool', 450, 3, 'Planned', 'Feature'),
  ('API Rate Limiting', 380, 2, 'In Progress', 'Backend'),
  ('User Activity Analytics', 520, 5, 'New', 'Analytics');
