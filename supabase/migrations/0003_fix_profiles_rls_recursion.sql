DROP POLICY IF EXISTS "Admin ve todos os perfis" ON profiles;

CREATE POLICY "Admin ve todos os perfis" ON profiles
FOR ALL
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('professor', 'admin')
);
