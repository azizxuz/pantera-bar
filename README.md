# CyberCafe Backend (NestJS + Prisma + Socket.IO)

Production-ready backend for the CyberCafe Computer Club (51 PCs).
Mirrors the schema used by the Lovable frontend, so you can swap from
Lovable Cloud to your own server without changing the UI.

## Stack
- NestJS 10 (REST + WebSocket Gateway)
- Prisma ORM + PostgreSQL
- JWT auth (admin) + long-lived computer tokens
- Socket.IO realtime: `order:new`, `order:update`

## Quick start
```bash
cp .env.example .env       # set DATABASE_URL & JWT_SECRET
npm install
npx prisma migrate dev
npm run seed               # seeds 51 computers + sample products + admin
npm run start:dev          # http://localhost:3000
```

Default admin: `admin@cafe.local` / `admin`

## REST endpoints
- POST   `/auth/login`              { email, password } -> { accessToken }
- GET    `/computers`               (admin)
- POST   `/computers`               (admin)
- POST   `/computers/:id/rotate`    (admin) rotate token
- PATCH  `/computers/:id`           (admin) toggle/edit
- DELETE `/computers/:id`           (admin)
- GET    `/products`                (public, only active)
- POST   `/products`                (admin)
- PATCH  `/products/:id`            (admin)
- DELETE `/products/:id`            (admin)
- POST   `/orders`                  (computer token in `x-computer-token` header)
- GET    `/orders`                  (admin)
- PATCH  `/orders/:id/status`       (admin) -> emits `order:update`

## WebSocket (Socket.IO @ `/realtime`)
- Server emits: `order:new`, `order:update`
- Admin clients join room `admin` after JWT handshake.

## Frontend integration
On the Lovable frontend, replace the Zustand store with REST calls and
subscribe to Socket.IO for live updates. Drop-in client example is in
`docs/frontend-client.md`.
# pantera-bar
