# Conflicting Tasks

## Auth Module

- [ ] Implement JWT token generation @alice [files: src/auth/token.ts, src/auth/middleware.ts]
- [ ] Add OAuth2 provider support @bob [files: src/auth/token.ts, src/auth/oauth.ts] [depends-on: task-1-implement-jwt-token-generation]

## Shared Utils

- [ ] Create logging utility @alice [files: src/utils/logger.ts, src/utils/format.ts]
- [ ] Create config management @bob [files: src/utils/config.ts, src/utils/format.ts] [priority: high]

## Database

- [ ] Set up connection pool @carol [files: src/db/pool.ts, src/utils/config.ts]
- [ ] Write query builder @carol [files: src/db/query.ts]
