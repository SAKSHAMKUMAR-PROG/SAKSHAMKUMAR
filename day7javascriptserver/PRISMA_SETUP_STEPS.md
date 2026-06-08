# Prisma Setup Steps

This is exactly how Prisma was fixed in this project.

## 1. Use CommonJS / require

In `package.json`, the project was changed to CommonJS:

```json
"type": "commonjs"
```

That lets files use:

```js
const express = require("express");
const prisma = require("./src/config/prisma");
```

## 2. Use the CommonJS Prisma generator

In `prisma/schema.prisma`, the generator was changed to:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

This creates Prisma Client inside `node_modules/@prisma/client`, so it can be imported with:

```js
const { PrismaClient } = require("@prisma/client");
```

## 3. Create the Prisma client file

The file `src/config/prisma.js` uses `require`:

```js
require("dotenv/config");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
```

The app uses `DATABASE_URL` for normal runtime queries.

## 4. Fix Supabase database URLs

Supabase has two useful pooler ports:

```env
DATABASE_URL="postgresql://USER:PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify"
DIRECT_URL="postgresql://USER:PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=no-verify"
```

Use:

- `DATABASE_URL` for the Express app and Prisma Client
- `DIRECT_URL` for Prisma migration commands

Important: if your password contains `@`, write it as `%40` in the URL.

Example:

```env
PASSWORD: RIYA@SAKSHAM
URL value: RIYA%40SAKSHAM
```

## 5. Make Prisma CLI use DIRECT_URL

In `prisma.config.ts`, Prisma CLI was changed to use `DIRECT_URL`:

```ts
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
```

The important part is:

```ts
config({ override: true });
```

This makes Prisma read the latest `.env` value even if PowerShell has an old environment variable loaded.

## 6. Generate Prisma Client

After changing `schema.prisma`, run:

```bash
npx prisma generate
```

This updates `@prisma/client`.

## 7. Run migrations

Run:

```bash
npx prisma migrate dev
```

If you are creating a new migration with a name:

```bash
npx prisma migrate dev --name init
```

## 8. Test the server

Start the server:

```bash
npm start
```

Then test:

```text
GET /db-check
GET /users
POST /users
```

For `POST /users`, send:

```json
{
  "name": "Saksham",
  "email": "saksham@example.com",
  "roll_no": "101"
}
```

## Why the error happened

This error:

```text
prepared statement "s1" already exists
```

happens when Prisma migrations use the Supabase transaction pooler on port `6543`.

This error:

```text
P1001: Can't reach database server
```

can happen when Prisma does not read the updated `.env`, SSL params are missing, or the password is not URL encoded.

The fix was:

1. Use `DIRECT_URL` for Prisma CLI.
2. Use `DATABASE_URL` for the app.
3. Add `sslmode=no-verify`.
4. Encode `@` in the password as `%40`.
5. Use `config({ override: true })` in `prisma.config.ts`.
