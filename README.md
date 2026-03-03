# Puzzlemino

A zero-gravity tetromino puzzle game built with React 19, TypeScript, and Vite. Drag and drop pieces onto a 10x10 board — complete rows and columns to clear them. No gravity, no falling blocks.

## Development

```bash
npm install
npm run dev          # Dev server at http://localhost:5173
npm run build        # Type-check + production build
npm run lint         # ESLint
npx vitest           # Run tests
```

## Deployment

### Option 1: Docker (recommended)

Requires [Docker](https://docs.docker.com/get-docker/) installed on your server.

**Build and run:**

```bash
docker build -t puzzlemino .
docker run -d -p 80:80 --name puzzlemino puzzlemino
```

The app is now available at `http://your-server-ip`.

**To update after pulling new changes:**

```bash
docker stop puzzlemino && docker rm puzzlemino
docker build -t puzzlemino .
docker run -d -p 80:80 --name puzzlemino puzzlemino
```

**Use a different port** (e.g. 8080):

```bash
docker run -d -p 8080:80 --name puzzlemino puzzlemino
```

### Option 2: Docker Compose

Create a `docker-compose.yml` (or use the one in the repo):

```yaml
services:
  puzzlemino:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

Then run:

```bash
docker compose up -d
```

### Option 3: Static file hosting

Since Puzzlemino is a fully static app, you can serve the build output with any web server or static host.

```bash
npm ci
npm run build
```

This produces a `dist/` folder. Upload its contents to any static hosting provider:

- **nginx/Apache** — point the document root to `dist/` and configure a fallback to `index.html` for SPA routing
- **Cloudflare Pages / Vercel / Netlify** — connect your repo and set build command to `npm run build` with output directory `dist`
- **GitHub Pages** — push the `dist/` contents to a `gh-pages` branch

For any self-hosted web server, ensure all routes fall back to `index.html` so the SPA works correctly.
