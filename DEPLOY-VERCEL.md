# Deploy na Vercel — Guia de Migração

Este projeto está hoje configurado para rodar em **Cloudflare Workers** (padrão Lovable). Este guia descreve o passo a passo para fazer deploy na **Vercel**.

> ⚠️ Após aplicar estas mudanças, o preview interno do Lovable provavelmente **não funcionará mais**. Use uma branch separada ou faça a troca somente quando for migrar definitivamente.

---

## 1. Arquivos preparados (já no repo)

Foram criados arquivos paralelos prontos para a Vercel — eles **não são usados** no fluxo atual do Lovable:

| Arquivo | Uso |
|---|---|
| `vite.config.vercel.ts` | Config Vite com `target: 'vercel'` |
| `src/server.vercel.ts` | Entry server padrão do TanStack Start (não-Workers) |
| `vercel.json` | Build/install commands para a Vercel |

---

## 2. Ativar a configuração Vercel

```bash
# Backup do atual (Cloudflare)
mv vite.config.ts vite.config.cloudflare.ts
mv src/server.ts src/server.cloudflare.ts

# Ativar Vercel
mv vite.config.vercel.ts vite.config.ts
mv src/server.vercel.ts src/server.ts

# Remover artefatos Cloudflare
rm wrangler.jsonc
```

Ajuste o `src/server.ts` (recém-renomeado) para remover a referência ao path antigo se houver erro de import (não deve haver, é self-contained).

---

## 3. Ajustar `package.json`

Remover dependências Cloudflare/Lovable-build:

```bash
bun remove @cloudflare/vite-plugin @lovable.dev/vite-tanstack-config
bun install
```

Mantenha o resto das dependências como estão.

---

## 4. Variáveis de ambiente na Vercel

No painel da Vercel: **Settings → Environment Variables**, adicionar para **Production** e **Preview**:

### Públicas (expostas ao client)
- `VITE_SUPABASE_URL` = `https://ewwxgcbyiiksmhalgvve.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = (anon key — veja `.env` atual)
- `VITE_SUPABASE_PROJECT_ID` = `ewwxgcbyiiksmhalgvve`

### Servidor (somente backend)
- `SUPABASE_URL` = mesma URL acima
- `SUPABASE_PUBLISHABLE_KEY` = mesma anon key
- `SUPABASE_SERVICE_ROLE_KEY` = (pegar no painel **Lovable Cloud → Backend → Mostrar service role**)
- `LOVABLE_API_KEY` = (opcional, só se for usar Lovable AI fora do Lovable)

---

## 5. Deploy

### Opção A — CLI
```bash
bun install -g vercel
vercel login
vercel --prod
```

### Opção B — GitHub
1. Push do repo para o GitHub
2. Importar projeto em [vercel.com/new](https://vercel.com/new)
3. A Vercel detecta o `vercel.json` e usa os comandos certos
4. Configurar as env vars listadas acima
5. Deploy

---

## 6. Validação pós-deploy

Checar manualmente:
- [ ] Login (Supabase Auth)
- [ ] Listagem de leads (`/leads`)
- [ ] Criar imóvel (`/imoveis`)
- [ ] Jornada de compra (`/leads/$id/jornada`)
- [ ] Deal Canvas (`/canvas/$id`)
- [ ] Server functions (verifique Network: requests para `/_serverFn/...`)

Se algo quebrar:
- Verifique logs em **Vercel → Project → Logs**
- Confirme que **todas** as env vars estão setadas no ambiente correto (Production vs Preview)
- Erros tipo `process.env.X is undefined` indicam env var faltando

---

## 7. Banco de dados

**Nenhuma mudança necessária.** O Lovable Cloud é Supabase real (projeto `ewwxgcbyiiksmhalgvve`), acessado via API HTTPS. Continua funcionando sem alteração. Tabelas, RLS, migrations e auth permanecem 100% intactos.

---

## 8. Voltar para Cloudflare/Lovable (rollback)

```bash
mv vite.config.ts vite.config.vercel.ts
mv src/server.ts src/server.vercel.ts
mv vite.config.cloudflare.ts vite.config.ts
mv src/server.cloudflare.ts src/server.ts
# restaurar wrangler.jsonc do git: git checkout wrangler.jsonc
bun add -d @cloudflare/vite-plugin @lovable.dev/vite-tanstack-config
```

---

## Trade-offs Vercel vs Cloudflare Workers

| Aspecto | Cloudflare (atual) | Vercel |
|---|---|---|
| Cold start | ~5ms | 200–500ms (Node serverless) |
| Compat Node | Parcial (`nodejs_compat`) | Total |
| Preview Lovable | ✅ Funciona | ❌ Quebra |
| Custom domain | ✅ | ✅ |
| Preço base | Grátis generoso | Grátis (Hobby), pago acima |
