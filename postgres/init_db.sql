SELECT 'CREATE DATABASE challenge'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'challenge')\gexec
GRANT ALL PRIVILEGES on challenge.*
TO 'root'@'%' IDENTIFIED BY 'root'
WITH GRANT OPTION;