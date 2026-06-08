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

Marking tasks complete/incomplete

- Update via `PUT /api/todos/:id` with `{ "completed": true }` or `{ "completed": false }`.
- Quick endpoints: `POST /api/todos/:id/complete` and `POST /api/todos/:id/incomplete`.

Example (PowerShell):

```powershell
$token = (Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/login' -Method POST -Body (ConvertTo-Json @{username='alice'; password='password123'}) -ContentType 'application/json' -UseBasicParsing).token
Invoke-RestMethod -Uri 'http://localhost:4000/api/todos/REPLACE_ID/complete' -Method POST -Headers @{ Authorization = 'Bearer ' + $token } -UseBasicParsing
```
