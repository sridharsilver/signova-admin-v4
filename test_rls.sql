SELECT pol.polname, pol.polcmd, pol.polroles
FROM pg_policy pol
JOIN pg_class cls ON cls.oid = pol.polrelid
WHERE cls.relname = 'products';
