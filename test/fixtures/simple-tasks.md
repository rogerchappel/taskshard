# Project Tasks

## API Layer

- [ ] Set up Express server boilerplate @alice
- [ ] Add health check endpoint @alice [files: src/server.ts] [verify: npm test]
- [x] Create package.json with dependencies
- [ ] Configure TypeScript build pipeline [files: tsconfig.json] [depends-on: task-3-create-package-json-with-dependencies] [verify: npm run build]

## Database Layer

- [ ] Set up PostgreSQL connection pool @bob [files: src/db/pool.ts] [priority: high]
- [ ] Write migration runner script @bob [files: scripts/migrate.ts, src/db/migrations/]
- [x] Install pg and drizzle-orm dependencies

## Frontend

- [ ] Create React app shell @carol [files: src/frontend/]
- [ ] Set up routing with React Router @carol [files: src/frontend/App.tsx, src/frontend/routes.tsx] [depends-on: task-7-create-react-app-shell]
- [ ] Add API client with retry logic @alice [files: src/api/client.ts] [depends-on: task-2-add-health-check-endpoint]
