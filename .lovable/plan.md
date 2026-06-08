# Corrigir preview quebrado

## Causa

O `vite.config.ts` foi sobrescrito para alvo Vercel (importa `@tanstack/react-start/plugin/vite`, `@vitejs/plugin-react`, `@tailwindcss/vite` etc. com `target: "vercel"`), mas o ambiente do Lovable usa o preset `@lovable.dev/vite-tanstack-config` + `@cloudflare/vite-plugin`. Resultado: a configuração ativa não casa com o runtime do preview e a página quebra. O arquivo correto já existe preservado em `vite.config.cloudflare.ts`.

Como escolhemos o caminho **C (Híbrido — GitHub + publish Lovable)**, não precisamos do alvo Vercel agora. Basta voltar à config oficial do Lovable.

## Mudanças

1. **`vite.config.ts`** — substituir pelo conteúdo de `vite.config.cloudflare.ts` (defineConfig do `@lovable.dev/vite-tanstack-config` apontando `server.entry` para `src/server.ts`).
2. **`vite.config.cloudflare.ts`** — remover (vira redundante).
3. **`vercel.json`** — remover (não usado no caminho C).
4. **`DEPLOY-VERCEL.md`** — remover (caminho A descartado; o guia ativo é `WORKFLOW-GITHUB-LOVABLE.md`).
5. **`src/server.ts`** — manter como está (handler `fetch` já é compatível com Cloudflare Workers via `@cloudflare/vite-plugin`).

## Validação

- Preview recarrega em `/` e redireciona para `/login` ou `/dashboard`.
- `bun run build` continua passando.

## O que NÃO muda

- Banco, auth, rotas, componentes, `src/server.ts`, `src/start.ts`, `package.json`.
- Publish continua via Lovable → `corretor-key-hub.lovable.app`.
- Sync GitHub (quando você conectar pelo menu Plus → GitHub) segue funcionando normal.
