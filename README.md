# Spotify Reorderer

Aplicação web para reordenar faixas de playlists do Spotify com múltiplos critérios (artista, álbum, nome, duração, data de adição) e ordem ascendente/descendente.

## Stack

- **Backend**: FastAPI (Python) + Authlib (OAuth Spotify)
- **Frontend**: Vite + React 19 + TypeScript + Tailwind v4
- **Estilização**: tokens do tema Spotify em `frontend/app/src/index.css`

## Estrutura

- `backend/` — API em FastAPI
- `frontend/app/` — SPA em React/Vite

## Pré-requisitos

- Python 3.10+
- Node.js 18+
- Conta de desenvolvedor no Spotify (Client ID / Client Secret)
- ngrok (necessário para o callback do OAuth do Spotify em dev, já que o Spotify exige HTTPS no redirect URI)

## Variáveis de ambiente

Copie os arquivos `.env.example` e ajuste:

### Backend (`backend/.env`)

```env
SESSION_SECRET_KEY=uma_chave_secreta_aleatoria
SPOTIFY_CLIENT_ID=seu_client_id
SPOTIFY_CLIENT_SECRET=seu_client_secret
SPOTIFY_REDIRECT_URI=https://seu-subdominio.ngrok-free.app/callback
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/app/.env`)

```env
VITE_API_URL=https://seu-subdominio.ngrok-free.app
```

## Execução local

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows (Git Bash)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API em `http://localhost:8000`, docs em `/docs`.

### 2. ngrok (expor o backend para o callback do Spotify)

```bash
ngrok http 8000
```

Cole a URL gerada em:
- `SPOTIFY_REDIRECT_URI` (em `backend/.env`)
- `VITE_API_URL` (em `frontend/app/.env`)
- Redirect URI no [Dashboard do Spotify](https://developer.spotify.com/dashboard)

### 3. Frontend

```bash
cd frontend/app
npm install
npm run dev
```

Abre em `http://localhost:3000`.

## Fluxo OAuth

1. Usuário clica em "Login with Spotify" → frontend redireciona para `{API}/login`
2. Backend redireciona para o Spotify, que autentica e volta para `{API}/callback?code=...`
3. Backend troca o `code` por `access_token` + `refresh_token` e redireciona o navegador para `{FRONTEND_URL}/#access_token=...&refresh_token=...&expires_at=...`
4. Frontend lê o fragmento da URL, salva no `localStorage`, limpa o histórico
5. Quando o token está a <60s de expirar (ou em 401), o frontend chama `POST /refresh` automaticamente

## Deploy

### Frontend — Vercel
- Vercel detecta Vite automaticamente (`npm run build` → `dist/`).
- Configure a variável `VITE_API_URL` apontando para o backend de produção.

### Backend — Railway / Fly.io
- FastAPI roda direto com `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Defina todas as variáveis de ambiente, incluindo `FRONTEND_URL` com o domínio do Vercel.

### Spotify Developer Dashboard
- Registre **duas** Redirect URIs: uma de dev (ngrok) e uma de prod (`https://api.seu-dominio.com/callback`).
- App em **Development Mode** aceita até 25 usuários adicionados manualmente. Para liberar ao público geral, solicite **Extended Quota Mode** (requer review, pode levar semanas).

## Scripts úteis (frontend)

```bash
npm run dev        # dev server com HMR
npm run build      # build de produção (tsc + vite build)
npm run preview    # testa o build localmente
npm run typecheck  # só valida tipos
```
