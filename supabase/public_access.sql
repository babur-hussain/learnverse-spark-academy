-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON subjects;
DROP POLICY IF EXISTS "Enable read access for all users" ON subject_resources;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
DROP POLICY IF EXISTS "Allow public read access to subjects" ON subjects;
DROP POLICY IF EXISTS "Allow public read access to subject_resources" ON subject_resources;
DROP POLICY IF EXISTS "Allow public read access to user_roles" ON user_roles;

-- 2. Disable RLS completely for all tables
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE subject_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- 3. Grant full access to anon role
GRANT ALL ON subjects TO anon;
GRANT ALL ON subject_resources TO anon;
GRANT ALL ON user_roles TO anon;

-- 4. Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Security disabled. Please verify:';
    RAISE NOTICE '1. RLS is disabled on all tables';
    RAISE NOTICE '2. All policies have been removed';
    RAISE NOTICE '3. Anonymous users have full access';
END $$; 