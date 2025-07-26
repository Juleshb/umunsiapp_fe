# Prisma Scripts Reference

- **migrate**: Runs all migrations and generates the Prisma client (for production or new DB)
  - `npm run migrate`
- **prisma:generate**: Generates the Prisma client (run after schema changes)
  - `npm run prisma:generate`
- **prisma:studio**: Opens Prisma Studio (GUI for your database)
  - `npm run prisma:studio`
- **prisma:migrate:dev**: Creates and applies a new migration in development (useful for initializing migrations)
  - `npm run prisma:migrate:dev`
- **prisma:migrate:deploy**: Applies all existing migrations (for production or new DB)
  - `npm run prisma:migrate:deploy`
- **prisma:migrate:reset**: Resets the database, applies all migrations, and generates the client (destructive, use with caution)
  - `npm run prisma:migrate:reset`

> **Note:** These scripts are defined in `package.json` under the `scripts` section. Use them from the `server/` directory. 