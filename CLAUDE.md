# Instruções do projeto — Spotify Reorderer

## Commits
- **NÃO** incluir o trailer `Co-Authored-By: Claude <...>` nas mensagens de commit. O usuário assina sozinho.
- Mensagens em **português**, concisas, focando no "porquê" (motivação) em vez do "o que" (diff já mostra).
- Prefira commits pequenos e coesos a um único commit grande.

## Idioma
- Comunicação com o usuário e mensagens de commit em português.
- Código, nomes de variáveis e comentários em inglês (padrão internacional).

## Stack alvo do frontend
- **Vite** + **React 19** + **TypeScript** + **Tailwind v4**
- Tokens do tema Spotify definidos em `frontend/app/src/index.css` (bloco `@theme`).
- Componentes em `frontend/app/src/components/`.

## Stack do backend
- **FastAPI** + **Authlib** (OAuth Spotify).
- Serviços em `backend/app/services/` (`spotify.py` para wrappers da API, `reorder.py` para lógica de ordenação).

## Convenções
- Backend expõe em `http://localhost:8000`. Frontend em `http://localhost:5173` (Vite default).
- Tokens do Spotify expiram em 1h — usar o endpoint `/refresh` antes de deslogar o usuário.
- Variáveis de ambiente no frontend prefixadas com `VITE_`.
