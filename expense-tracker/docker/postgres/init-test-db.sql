SELECT 'CREATE DATABASE expense_tracker_test'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'expense_tracker_test'
)\gexec
