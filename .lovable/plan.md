## Diagnóstico

O projeto **não está pronto** para deploy direto na Vercel via GitHub. Motivos:

1. **Build target é Cloudflare Workers**, não Node/Vercel. O `vite.config.ts` usa `@lovable.dev/vite-tanstack-config`, que injeta automaticamente o `@cloudflare/vite-plugin`. O `src/server.ts` exporta um handler de Worker (`export default { fetch(request, env, ctx) }`), e o `wrangler.jsonc` define o bundle.
2. **A versão do `@tanstack/react-start` (1.167) não tem mais adapter nativo para Vercel** no plugin Vite (foi removido após a migração do Nitro). Não dá só pra "trocar o target".
3. **Funcionará na Vercel?** Hoje, importando o repo no Vercel via GitHub: o build falha (ou gera artefato Cloudflare que a Vercel não roda). Server functions (`createServerFn` em `/leads`, `/imoveis`, `/canvas`) e SSR não vão funcionar.

> O **banco Supabase** continua funcionando em qualquer host — não muda nada nele.

---

## Caminhos possíveis

### Caminho A — Adaptar para Vercel (trabalhoso, perde preview do Lovable)

Sair do preset Lovable e empacotar a saída SSR manualmente como Vercel Serverless Function:

1. **Reescrever `vite.config.ts`** do zero, sem `@lovable.dev/vite-tanstack-config` e sem `@cloudflare/vite-plugin`. Compor manualmente: `tanstackStart`, `viteReact`, `tailwindcss`, `tsConfigPaths`.
2. **Reescrever `src/server.ts`** trocando o handler Worker pelo re-export do `@tanstack/react-start/server-entry` (formato Web `fetch`).
3. **Criar `api/index.ts`** — wrapper que importa o handler SSR e converte Request/Response Node ↔ Web, no formato esperado por Vercel Serverless Functions (runtime Node 20).
4. **Criar `vercel.json`** com rewrites: assets estáticos servidos do build client, restante roteado para `/api/index`.
5. **Remover** `wrangler.jsonc`, `@cloudflare/vite-plugin`, `@lovable.dev/vite-tanstack-config` do `package.json`.
6. **Configurar variáveis na Vercel** (Production + Preview):
   - Públicas: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - Server: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`
7. **Conectar GitHub** (Plus → GitHub → Connect project) e importar o repo em vercel.com/new.

**Consequências:**
- ⚠️ O **preview do Lovable provavelmente quebra** (depende do preset Cloudflare).
- ⚠️ Após esta mudança, iterar dentro do Lovable fica arriscado — passa a editar localmente / via GitHub.
- ✅ Deploy contínuo Vercel ↔ GitHub funciona como esperado.
- ✅ Cold start ~200–500ms (Node serverless) vs ~5ms (Workers).
- ⚠️ Empacotar SSR como Vercel Function exige testes — pode haver ajustes em libs Node-only durante o build.

### Caminho B — Continuar publicando via Lovable (recomendado)

A Lovable já hospeda o app em `corretor-key-hub.lovable.app` (Cloudflare Workers) **com o mesmo banco Supabase**, sem custo extra. Apontar domínio customizado fica em **Project Settings → Domains**.

**Vantagens:**
- Zero esforço de migração.
- Preview do Lovable continua funcionando.
- Deploy automático a cada `Publish`.
- Suporta domínio próprio.

**Quando o Caminho B não serve:** se você precisa de algum recurso exclusivo da Vercel (Edge Config, Analytics, ISR, integrações da Vercel, etc.) ou tem requisito organizacional de hospedar lá.

### Caminho C — Híbrido: GitHub para versionar, Lovable para hospedar

Conectar GitHub (sincroniza código bidirecionalmente), mas publicar pela Lovable. Você ganha o repositório versionado e CI/CD opcional via GitHub Actions, sem migrar o runtime.

---

## Minha recomendação

**Caminho B ou C**, a menos que você tenha um motivo específico para precisar da Vercel. O Caminho A é viável mas exige reescrita de configuração de build + empacotamento manual SSR + perda do preview Lovable — só vale a pena se você for migrar definitivamente.

**Qual caminho seguir?** Posso detalhar e implementar o A (com avisos sobre o risco do preview), configurar o GitHub para o C, ou ajudar a apontar um domínio próprio no B.
