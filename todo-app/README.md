# Todo App

Simple Node.js + Express todo app with file-based persistence.

## Install

```bash
cd todo-app
npm install
npm start
```

Server runs on `http://localhost:4000` and exposes CRUD endpoints under `/api/todos`.

Authentication

- Register: `POST /api/auth/register` { username, password }
- Login: `POST /api/auth/login` { username, password } -> returns `{ token }`

Include `Authorization: Bearer <token>` header to access `/api/todos` endpoints.
