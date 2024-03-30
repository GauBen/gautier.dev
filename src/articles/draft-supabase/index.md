---
title: Building a side-project with Supabase, SvelteKit and Prisma
---

Oh boy it's complicated

- not enough: https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/baseline-your-database-typescript-postgresql
- helpful: https://medium.com/@ngoctranfire/using-prisma-with-supabase-row-level-security-and-multi-schema-7c53418adba3
- issue: https://medium.com/@ngoctranfire/using-prisma-with-supabase-row-level-security-and-multi-schema-7c53418adba3

```bash
# https://supabase.com/dashboard/project/_/settings/database
# Replace `psql` with `pg_dump` and append `-n auth -x -O --schema-only > ./prisma/migrations/0_init/migration.sql`
pg_dump -h [host].pooler.supabase.com -p 5432 -d postgres -U postgres.[project] -n auth -x -O --schema-only > ./prisma/migrations/0_init/migration.sql
```
