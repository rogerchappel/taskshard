# Heavy Dependency Tasks

## Foundation

- [ ] Set up project structure @alice [files: package.json, tsconfig.json, .gitignore] [verify: npm init]
- [ ] Configure linting and formatting @alice [files: .eslintrc, .prettierrc] [depends-on: task-1-set-up-project-structure] [verify: npm run lint]

## Core Features

- [ ] Implement user model @bob [files: src/models/user.ts] [depends-on: task-1-set-up-project-structure]
- [ ] Implement auth middleware @bob [files: src/middleware/auth.ts] [depends-on: task-3-implement-user-model]
- [ ] Add session management @bob [files: src/session/store.ts] [depends-on: task-4-implement-auth-middleware, task-6-implement-session-adapter]

## Database

- [ ] Set up database schema @carol [files: db/schema/] [depends-on: task-1-set-up-project-structure]
- [ ] Write migration runner @carol [files: scripts/migrate.ts] [depends-on: task-6-set-up-database-schema]
- [ ] Implement session adapter @carol [files: src/session/adapter.ts] [depends-on: task-7-write-migration-runner]

## API Layer

- [ ] Create user endpoints @alice [files: src/api/users.ts] [depends-on: task-3-implement-user-model, task-5-set-up-database-schema]
- [ ] Create auth endpoints @alice [files: src/api/auth.ts] [depends-on: task-4-implement-auth-middleware]
- [ ] Add rate limiting middleware @alice [files: src/middleware/rate-limit.ts] [depends-on: task-4-implement-auth-middleware]
