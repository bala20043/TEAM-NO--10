-- Seed data for development/demo
-- Passwords are hashed versions of the demo passwords

-- Departments
INSERT OR IGNORE INTO departments (name, unique_code) VALUES
  ('Basic Engineering', 'BE'),
  ('Computer Science & Engineering', 'CSE'),
  ('Electronics & Communication', 'ECE'),
  ('Mechanical Engineering', 'MECH'),
  ('Civil Engineering', 'CIVIL'),
  ('Electrical Engineering', 'EEE');

-- Admin user (password: admin123)
-- Note: Actual password hash will be generated at runtime via the seed API endpoint
-- These are placeholder hashes - the /api/auth/setup endpoint will create the real admin
