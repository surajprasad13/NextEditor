# PRODUCTION — NextEditor @ enkash.com/docs

**Product**: NextEditor — API documentation portal & visual docs editor  
**Target Domain**: `enkash.com/docs`  
**Stack**: Next.js 16.2.9 · React 19.2.4 · TypeScript 5 · lucide-react 1.21.0  
**DB (dev)**: File-based JSON (`data/pages.json`) → **DB (prod)**: MySQL 8.0+  
**Deployment**: Node.js server behind Nginx reverse proxy, PM2 process manager

---

## Current State (as of 2026-06-30)

### Completed

- Visual block editor with 22 block types (NavBlock, HeroBlock, Card, ColumnsBlock, TabsBlock, ContainerBlock, DividerBlock, FooterBlock, TextBlock, CalloutBlock, AdmonitionBlock, HighlightBlock, StepBlock, ButtonBlock, CodeBlock, ImageBlock, Accordion, TestimonialRow, PricingBlock, EmbedBlock, StatsBlock)
- Markdown editor with live canvas sync — custom `:::BlockType{json}:::` syntax; ideal for API guides, changelogs, and reference docs
- HTML source editor with bidirectional sync (`nodesToHtml` / `htmlToNodes` / `htmlToMarkdown`)
- Content/Style split inspector with color pickers and full CSS property coverage (padding, margin, typography, borders, opacity, lineHeight, textTransform, overflow, borderStyle)
- Full-page 3-column layout (sidebar + canvas + inspector) — no card wrapper; mirrors API-docs-editor style (Notion/ReadMe/Stoplight)
- lucide-react icons throughout — no emoji
- Blue accent theme (`#2563eb`) with light/dark mode support — see Theming section
- Landing page at `/` — docs portal homepage with feature highlights, quick-start steps, and CTA
- Custom page layouts — portal homepage, API reference page, guide article, 404 — see Custom Pages section
- Multi-page docs site with slug-based routing via `[[...path]]` catch-all
- File-based JSON database (`src/lib/db.ts`) — zero config, single `data/pages.json` file
- Guide / article type with author, date, tags, reading time, featured image, excerpt — suitable for tutorials, API changelogs, and release notes
- Code export — generates Next.js page component
- Undo/redo — 100-step history
- Drag-and-drop block reorder via HTML5 drag API
- SEO metadata panel per doc page (title, description, OG, tags)

### Pending (required for production)

- Authentication system (login, signup, JWT/session)
- PostgreSQL database migration — replace `src/lib/db.ts` file adapter
- Nginx production deployment
- Role-based access control (admin / editor / viewer)
- Image upload (currently URL input only)
- Full-text search across published doc pages
- Docs index / navigation sidebar for public portal
- API changelog page + RSS feed
- Test coverage

---

## Theming — Light & Dark Mode

### Application-level theme

The editor shell uses CSS custom properties defined in `src/app/globals.css`. The system ships with two themes controlled by a `data-theme` attribute on `<html>`:

| CSS variable     | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
| ---------------- | ------------------------------ | ---------------------------- |
| `--bg-app`       | `#f8fafc`                      | `#0f172a`                    |
| `--bg-card`      | `#ffffff`                      | `#1e293b`                    |
| `--bg-input`     | `#f1f5f9`                      | `#334155`                    |
| `--border-color` | `#e2e8f0`                      | `#334155`                    |
| `--text-main`    | `#0f172a`                      | `#f1f5f9`                    |
| `--text-sub`     | `#475569`                      | `#94a3b8`                    |
| `--text-muted`   | `#94a3b8`                      | `#64748b`                    |
| `--accent`       | `#2563eb`                      | `#3b82f6`                    |
| `--accent-hover` | `#1d4ed8`                      | `#2563eb`                    |
| `--accent-bg`    | `#dbeafe`                      | `#1e3a5f`                    |

**Toggle implementation** (to be wired in Phase 2): A `ThemeToggle` button writes `localStorage.setItem("theme", "dark"|"light")` and sets `document.documentElement.dataset.theme`. A `useEffect` in `src/app/layout.tsx` reads the stored preference on mount to avoid flash-of-unstyled-content.

### Block-level dark variant

Individual blocks support their own dark/light style independent of the app theme. Currently implemented:

- **HeroBlock** — inspector dropdown "Style Variant": `gradient` (default) · `light` · `dark` (Sleek Dark) · `minimal`. The `dark` variant applies `.hero-block--dark` CSS class which sets a deep dark background with light text, independent of the page theme.
- All other blocks inherit their colors from the CSS custom properties above, so they automatically adapt when the theme switches.

### Production recommendation

- Default to `light` theme on public viewer pages (enkash.com/docs/*)
- Persist user preference in `localStorage` with `document.documentElement.dataset.theme`
- Editor (`/docs/editor`) should follow the same toggle — editors should preview in their preferred theme
- Do not use `prefers-color-scheme` media query as the sole source of truth; explicit toggle wins

---

## Custom Pages

All public-facing pages are served by a single catch-all route: `src/app/[[...path]]/page.tsx`. It branches into one of four layouts based on slug and page type:

### 1. Docs Portal Homepage (`/`)

Renders when no doc page with slug `/` exists in the database (i.e., the homepage has not been replaced by a custom doc). This is the public-facing entry point to the API documentation site. Layout:

```
lp-root
  lp-nav                  # top navigation with logo + links + "Open Editor" CTA
  lp-hero                 # full-width hero with CSS grid background, badge, headline, sub, CTA buttons, proof row
  lp-bento-section        # 6-card feature grid (2 wide + 4 standard) — highlights editor capabilities
  lp-how-section          # 4-step quick-start workflow row
  lp-cta-band             # full-width gradient CTA strip
  lp-footer               # minimal footer with logo, copyright, editor link
```

To replace the portal homepage with a custom doc page: create a doc in the editor with slug `/` and publish it. The catch-all will serve it as a full-bleed custom page instead.

### 2. API Reference / Custom Doc Page (`type: "page"`, any slug)

Renders any published doc of type `page`. Full-bleed layout — no fixed max-width, no surrounding chrome. This is the primary layout for all API reference pages, getting-started guides, endpoint documentation, and SDK docs:

```
static-page-layout custom-page-layout
  static-page-content custom-page-content
    static-content-container     # flex-wrap row, each block takes its configured blockWidth%
      [block sections...]        # CodeBlock, StepBlock, AdmonitionBlock, TabsBlock, etc.
  floating-edit-pill             # fixed bottom-right "Edit" shortcut link to /docs editor
```

All block `customStyles` (padding, margin, background, border, hover effects) apply via inline styles. Use this layout for API reference pages, SDK guides, authentication docs, quickstart pages, and any custom-designed documentation section.

### 3. Guide / Article (`type: "article"`, any slug)

Renders published docs of type `article` with a focused reading layout — suitable for tutorials, integration guides, API changelogs, and release notes:

```
static-page-layout article-layout
  static-page-header              # branded header with logo + "Editor" link
  static-page-content
    article-content-container     # max-width 720px centered reading column
      article-header
        article-category-badge    # optional category label (e.g. "Tutorial", "Changelog")
        article-featured-img      # optional featured image
        article-title
        article-excerpt
        article-meta-row          # author chip, publish date, reading time
        article-tags-row          # tag chips (e.g. "REST", "OAuth", "v2.0")
      [block sections...]         # doc content rendered as blocks
      article-author-card         # author avatar + bio card at the end
  static-page-footer              # minimal footer
```

Article-specific metadata fields: `author`, `authorImage`, `authorBio`, `date`, `readingTime` (auto-calculated), `tags`, `category`, `featuredImage`, `excerpt`. All set via the SEO/Meta panel in the editor sidebar.

### 4. 404 Page (unknown slug or unpublished page)

Rendered for any slug that doesn't match a published page. Centered layout with:

- Badge chip showing "404"
- Headline + descriptive message showing the attempted slug
- "Open Editor" primary CTA button linking to `/docs`

Custom 404 styling is handled inline within the catch-all component; no separate `not-found.tsx` is needed because the catch-all controls all routes under the domain.

### Route Summary

| URL Pattern                             | Renders                                          |
| --------------------------------------- | ------------------------------------------------ |
| `/` (no DB record)                      | Docs portal homepage                             |
| `/` (published DB record)               | Custom doc page (full-bleed)                     |
| `/[any-slug]` (type=page, published)    | API reference / custom doc page (full-bleed)     |
| `/[any-slug]` (type=article, published) | Guide / article layout (720px reading column)    |
| `/[any-slug]` (draft or missing)        | 404 page                                         |
| `/docs`                                 | Editor (`src/app/docs/page.tsx`)                 |
| `/docs/api/*`                           | API routes                                       |

---

## Infrastructure Requirements

### Database

**Development** — file-based, zero config:
```
data/pages.json         # single flat JSON array of PageItem records
```

**Production** — MySQL 8.0+:

```sql
-- Users
CREATE TABLE users (
  id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,           -- bcrypt hash
  role        VARCHAR(20)  NOT NULL DEFAULT 'editor', -- admin | editor | viewer
  name        VARCHAR(255),
  avatar      TEXT,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pages (maps 1:1 to current PageItem interface in src/lib/db.ts)
CREATE TABLE pages (
  id             CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  slug           VARCHAR(500) UNIQUE NOT NULL,
  title          VARCHAR(500) NOT NULL,
  markdown       LONGTEXT     NOT NULL DEFAULT '',
  status         VARCHAR(20)  NOT NULL DEFAULT 'draft', -- draft | published | scheduled
  type           VARCHAR(20)  NOT NULL DEFAULT 'page',  -- page | article
  author         VARCHAR(255),
  author_image   TEXT,
  author_bio     TEXT,
  date           DATETIME,
  scheduled_for  DATETIME,
  updated_date   DATETIME,
  tags           JSON,                                  -- stored as JSON array
  category       VARCHAR(255),
  featured_image TEXT,
  excerpt        TEXT,
  reading_time   INT,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT INDEX idx_pages_fts (title, markdown)        -- for full-text search
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions (for refresh token rotation)
CREATE TABLE sessions (
  id            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  user_id       CHAR(36)     NOT NULL,
  refresh_token VARCHAR(512) UNIQUE NOT NULL,
  expires_at    DATETIME     NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit log
CREATE TABLE audit_log (
  id         BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id    CHAR(36),
  action     VARCHAR(100) NOT NULL,    -- doc.create | doc.update | doc.delete | user.login
  target_id  VARCHAR(500),             -- doc slug or user id
  meta       JSON,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_pages_slug   ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_type   ON pages(type);
```

**Full-text search**: Use MySQL `FULLTEXT` index with `MATCH(title, markdown) AGAINST(? IN BOOLEAN MODE)` — no separate extension needed.  
**Connection pooling**: `mysql2` driver with built-in pool (`connectionLimit: 10`) — no separate proxy needed for single-server setups.  
**Migration tool**: Drizzle ORM + `drizzle-kit` (add as devDependency in Phase 1); Drizzle supports MySQL natively via `mysql2`.  
**Backups**: daily `mysqldump nexteditor | gzip` piped to S3 via cron.

---

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/enkash-docs

limit_req_zone $binary_remote_addr zone=auth_zone:10m rate=10r/m;

server {
    listen 80;
    server_name enkash.com www.enkash.com;
    return 301 https://enkash.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name enkash.com;

    ssl_certificate     /etc/letsencrypt/live/enkash.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/enkash.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
    gzip_vary on;

    # Security headers
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;";

    # /docs -> NextEditor app (Next.js on port 3000)
    location /docs {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }

    # Immutable cache for hashed static assets
    location /docs/_next/static {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # No cache on API routes
    location /docs/api {
        proxy_pass         http://127.0.0.1:3000;
        proxy_no_cache     1;
        proxy_cache_bypass 1;
        add_header Cache-Control "no-store";
    }

    # Rate-limit auth endpoints (10 req/min per IP, burst 5)
    location /docs/api/auth {
        limit_req  zone=auth_zone burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/enkash-docs /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d enkash.com   # SSL via Let's Encrypt
```

---

### Authentication System

**Method**: JWT — short-lived access token (15 min) + httpOnly cookie refresh token (7 days)  
**Library**: NextAuth.js v5 or custom middleware using `jose`

**API routes**:
```
POST  /docs/api/auth/login     — email + password -> set httpOnly cookie + return user
POST  /docs/api/auth/logout    — clear cookie, invalidate refresh token in sessions table
POST  /docs/api/auth/refresh   — read refresh cookie -> issue new access token
GET   /docs/api/auth/me        — return current user from JWT
POST  /docs/api/auth/register  — admin-invite only (no public self-registration)
```

**Route protection** — `src/middleware.ts`:
- Protect `/docs/editor` and all `POST/PUT/DELETE /api/*` routes
- Redirect unauthenticated users to `/docs/login`
- Check JWT claims for role before allowing admin-only routes

**Roles**:

| Role     | Permissions |
|----------|-------------|
| `admin`  | Everything — user management, delete any page, change roles |
| `editor` | Create / edit / publish / delete own pages |
| `viewer` | Read published pages only — no editor access |

---

## Module Breakdown & Timeline

### Phase 1 — Foundation (Weeks 1–2) ~52 h

| Module | Tasks | Est. |
|--------|-------|------|
| Server setup | Provision Ubuntu 22.04 VPS, install Node 20 LTS, PM2, MySQL 8.0, Nginx; point DNS `enkash.com` to server IP | 4 h |
| SSL & Nginx | Deploy Nginx config above, Certbot SSL for `enkash.com`, test `/docs` proxy | 4 h |
| Database layer | Install Drizzle ORM + `mysql2` driver; write schema (users, pages, sessions, audit_log); migration scripts via `drizzle-kit`; replace `src/lib/db.ts` file adapter with MySQL adapter keeping same `PageItem` interface | 16 h |
| Authentication | NextAuth.js v5 setup; login/signup pages at `/docs/login`; `src/middleware.ts` route protection; bcrypt hashing; refresh token rotation; session table management | 20 h |
| CI/CD | GitHub Actions: `lint -> tsc --noEmit -> next build -> ssh deploy`; PM2 ecosystem config; zero-downtime `pm2 reload` | 8 h |

**Phase 1 total: ~52 h / 2 weeks**

---

### Phase 2 — Core Editor Hardening (Weeks 3–5) ~88 h

| Module | Tasks | Est. |
|--------|-------|------|
| Block editor stabilisation | Audit all 22 block types end-to-end; fix `onChange` edge cases in ContainerBlock nested editing; ensure `customStyles` round-trips correctly through save/load | 16 h |
| HTML editor hardening | Add syntax highlighting to HTML textarea (CodeMirror 6 or Monaco lite); harden `htmlToNodes()` for malformed HTML input; XSS-sanitise EmbedBlock output via DOMPurify before render | 20 h |
| Style inspector completeness | Verify all CSS properties (opacity, lineHeight, textTransform, overflow, borderStyle, hover) apply in both canvas and exported Next.js code | 12 h |
| Image upload | S3 presigned upload endpoint at `POST /docs/api/upload`; replace URL-only image inputs with drag-drop + paste upload in ImageBlock, Card, HeroBlock inspectors | 20 h |
| Canvas improvements | Multi-select blocks (shift-click); copy/paste blocks across pages via clipboard; keyboard shortcuts (Del to remove, Ctrl+D duplicate) | 20 h |

**Phase 2 total: ~88 h / 3 weeks**

---

### Phase 3 — Dynamic Pages & Public Routing (Weeks 6–7) ~76 h

| Module | Tasks | Est. |
|--------|-------|------|
| Dynamic routing | Harden `[[...path]]` catch-all; 404 page for unknown slugs; redirect table in DB for renamed doc slugs; slug history column on `pages` table | 12 h |
| ISR public viewer | `generateStaticParams` for published docs; ISR `revalidate: 60`; preview mode for draft docs (token-gated URL); optimistic save in editor | 16 h |
| Docs index & changelog | Docs index at `/docs/index` — categorized list of all published reference pages; API changelog at `/docs/changelog`; tag/category archive; RSS feed at `/docs/feed.xml` | 20 h |
| SEO | `generateMetadata()` per doc (title, description, OG image, canonical, JSON-LD TechArticle schema); `sitemap.xml` via `app/sitemap.ts`; robots.txt | 12 h |
| Full-text search | MySQL `FULLTEXT` index on `pages(title, markdown)`; `MATCH ... AGAINST` query; `GET /docs/api/search?q=` API route; search modal in docs sidebar (Cmd+K) | 16 h |

**Phase 3 total: ~76 h / 2 weeks**

---

### Phase 4 — Auth & Access Control (Week 8) ~40 h

| Module | Tasks | Est. |
|--------|-------|------|
| User management | Admin panel at `/docs/admin/users`; invite by email (magic link); role assignment UI; account deactivation; audit log viewer | 20 h |
| Per-page permissions | Page-level visibility: public / team-only / private; API route guards checking JWT role claims; rate limiting per authenticated user on write operations | 12 h |
| OAuth (optional) | Google + GitHub OAuth via NextAuth.js; account linking to existing email account; avatar sync | 8 h |

**Phase 4 total: ~40 h / 1 week**

---

### Phase 5 — Hardening & Launch (Weeks 9–10) ~84 h

| Module | Tasks | Est. |
|--------|-------|------|
| Performance | `next/image` for user-uploaded images; dynamic imports for heavy components (CodeBlock, ColumnsBlock, PricingBlock); `@next/bundle-analyzer` audit; Core Web Vitals target: LCP < 1.5 s on 3G | 12 h |
| Security audit | DOMPurify on EmbedBlock HTML; CSRF token on all mutating forms; Content-Security-Policy header review; SQL injection prevention via parameterised queries only; Nginx rate limits verified | 16 h |
| Testing | Unit tests for `src/lib/parser.tsx` (`parseMarkdown`, `nodesToMarkdown`); unit tests for `nodesToHtml` / `htmlToNodes` round-trip; integration tests for `/api/pages` CRUD (real MySQL via Docker); Playwright E2E: login -> create doc -> add block -> save -> view at `/docs/[slug]` | 24 h |
| Monitoring | Sentry error tracking (`@sentry/nextjs`); Nginx access logs -> Promtail -> Loki -> Grafana dashboard; uptime check via Checkly on `https://enkash.com/docs`; MySQL slow query log alerts | 8 h |
| Documentation | API reference at `/docs/api-reference`; editor user guide; block type reference; deployment runbook | 16 h |
| Launch | Production deploy; smoke test checklist; DNS TTL reduction to 60 s before cutover; Nginx cache warm-up; announcement | 8 h |

**Phase 5 total: ~84 h / 2 weeks**

---

## Timeline Summary

| Phase | Duration | Effort |
|-------|----------|--------|
| Phase 1 — Foundation | Weeks 1–2 | ~52 h |
| Phase 2 — Core Editor | Weeks 3–5 | ~88 h |
| Phase 3 — Dynamic Pages | Weeks 6–7 | ~76 h |
| Phase 4 — Auth & ACL | Week 8 | ~40 h |
| Phase 5 — Hardening & Launch | Weeks 9–10 | ~84 h |
| **TOTAL** | **10 weeks** | **~340 h** |

---

## Environment Variables

```env
# App
NEXT_PUBLIC_BASE_URL=https://enkash.com/docs
NODE_ENV=production

# Database
DATABASE_URL=mysql://nexteditor:PASSWORD@localhost:3306/nexteditor
DATABASE_POOL_SIZE=10

# Auth (NextAuth.js v5)
AUTH_SECRET=<openssl rand -hex 32>
AUTH_URL=https://enkash.com/docs
JWT_ACCESS_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>

# OAuth (optional, Phase 4)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Storage (Phase 2 image upload)
S3_BUCKET=enkash-docs-assets
S3_REGION=ap-south-1
S3_ACCESS_KEY=
S3_SECRET_KEY=
NEXT_PUBLIC_CDN_URL=https://enkash-docs-assets.s3.ap-south-1.amazonaws.com

# Monitoring (Phase 5)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## PM2 Ecosystem Config

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nexteditor',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/enkash-docs',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_memory_restart: '512M',
    error_file: '/var/log/pm2/nexteditor-error.log',
    out_file: '/var/log/pm2/nexteditor-out.log',
  }],
};
```

Deploy command (run from CI/CD on server):
```bash
git pull origin main
npm ci --omit=dev
npm run db:migrate
npx next build
pm2 reload ecosystem.config.js --env production
```

---

## Launch Smoke Test Checklist

### Server & Nginx

- [ ] MySQL 8.0 running: `systemctl status mysql`
- [ ] Database schema migrated: `npm run db:migrate`
- [ ] Nginx config valid: `nginx -t`
- [ ] SSL certificate active: `certbot certificates`
- [ ] PM2 process running: `pm2 status`
- [ ] `https://enkash.com/docs` returns HTTP 200

### Build
- [ ] TypeScript clean: `npx tsc --noEmit`
- [ ] Production build succeeds: `npx next build`
- [ ] No console errors on first page load

### Auth
- [ ] Login at `/docs/login` — valid credentials succeed
- [ ] Invalid credentials return 401, not 500
- [ ] Accessing `/docs/editor` without session redirects to `/docs/login`
- [ ] Refresh token rotates correctly on re-login
- [ ] `/docs/api/auth` returns 429 after 10 req/min from same IP

### Editor
- [ ] Create new page — slug, title, save
- [ ] Add TextBlock, CodeBlock, CalloutBlock — inspector opens for each
- [ ] Markdown editor syncs to canvas in real time
- [ ] HTML editor syncs bidirectionally with canvas
- [ ] Undo/redo works across 5 changes
- [ ] Drag reorder updates markdown

### Public viewer
- [ ] Published page visible at `https://enkash.com/docs/[slug]` without auth
- [ ] Draft page returns 404 without preview token
- [ ] Sitemap accessible: `https://enkash.com/docs/sitemap.xml`

### Monitoring
- [ ] Sentry test event received in dashboard
- [ ] Nginx access logs flowing to Loki
- [ ] Checkly uptime check created for `https://enkash.com/docs`

---

## Key File Reference

| Path | Purpose |
|------|---------|
| `src/lib/db.ts` | File-based DB adapter — replace with MySQL adapter (`mysql2`) in Phase 1 |
| `src/lib/parser.tsx` | Custom markdown parser — `:::BlockType{json}:::` to `EditorNode[]` |
| `src/components/editor/VisualEditor.tsx` | Main editor — 3-column layout, all state, HTML/markdown sync |
| `src/components/editor/DraggableBlock.tsx` | Individual block wrapper — drag handle, select, style compile |
| `src/components/editor/ComponentDefinitions.ts` | Block type registry — 22 types, default props, categories |
| `src/components/render/` | All block render components — each accepts `isEditable` + `onChange` |
| `src/app/[[...path]]/page.tsx` | Catch-all public viewer + landing page at `/` |
| `src/app/docs/page.tsx` | Editor entry point — renders `<VisualEditor />` full page |
| `src/app/api/pages/route.ts` | Pages CRUD API — currently wraps `src/lib/db.ts` |
| `src/app/globals.css` | All CSS — custom properties, layout shells, block styles |
| `src/middleware.ts` | (to be created Phase 1) — JWT auth middleware |
| `data/pages.json` | Dev database — do not commit to production |
