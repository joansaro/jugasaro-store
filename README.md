<h1 align="center">🛍️ Jugasaro Store</h1>

<p align="center"><strong>Full-stack e-commerce monorepo — storefront + complete admin panel, end-to-end typed.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo" />
</p>

<p align="center">
  <img src="docs/screens/home.png" alt="Jugasaro Store — storefront" width="100%" />
</p>

## ✨ What's inside

- 🔐 **JWT auth with httpOnly cookies** — sign-up, login, roles (admin / customer).
- 🛒 **Persistent cart & wishlist** backed by PostgreSQL, with a simulated checkout flow.
- 🗂️ **Full admin panel**: product CRUD with variants and images, brands, categories, order status flow, KPI dashboard, role management — even the home hero carousel is editable from the panel.
- 📦 **Reproducible seed** with 40 products and images, ready to browse out of the box.
- 🧩 **Shared types package** (`packages/shared`) consumed by both API and web — one source of truth, end-to-end type safety.

## 🧱 Architecture

```
jugasaro-store/
├── apps/
│   ├── api/          # NestJS 11 · Prisma 6 · PostgreSQL 16 · JWT (httpOnly)
│   └── web/          # Next.js 15 App Router · React 19 · Tailwind v4
├── packages/
│   └── shared/       # Shared TypeScript types (User, Product, Cart, Order, …)
├── docker-compose.yml
└── turbo.json        # pnpm workspaces + Turborepo
```

## 🚀 Quick start

> Requires Node 20.10+, pnpm 9+ and Docker.

```bash
pnpm install

# copy env templates (root, api, web)
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm db:up        # PostgreSQL via Docker Compose
pnpm dev          # API on :4000, Web on :3000 (Turborepo)
```

Once running: Web → http://localhost:3000 · API health → http://localhost:4000/health · Swagger → http://localhost:4000/api/docs

## 📸 Screens

| Storefront detail | Mobile |
|---|---|
| <img src="docs/screens/inner.png" alt="Inner view" width="100%" /> | <img src="docs/screens/mobile.png" alt="Mobile view" width="280" /> |

---

<p align="center">Built by <a href="https://github.com/joansaro">Andrés Santos</a> · <a href="https://joansaro.com">joansaro.com</a></p>
