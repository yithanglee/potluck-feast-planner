# 草地小清新野餐 Pot Luck

Signup board for a picnic potluck. Each person brings one dish that serves five.

## Local development

```sh
npm i
npm run dev
```

The Vite app runs on port 8080 and proxies `/api` to the local API on port 3001. Start that API with `npm run dev:api`.

## Deploy

```sh
npm run deploy
```

This builds the site and deploys it with Wrangler. Static files come from `dist`; API routes are handled by the Worker in `worker/`.
